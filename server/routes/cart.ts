import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../auth';
import { Cart, CartItem } from '../types';

const router = Router();

function getOrCreateCart(userId?: string, sessionToken?: string): Cart {
  const database = db.get();
  let cart: Cart | undefined;

  if (userId) {
    cart = database.carts.find((c) => c.userId === userId);
  } else if (sessionToken) {
    cart = database.carts.find((c) => c.sessionToken === sessionToken);
  }

  if (!cart) {
    const tokenToUse = !userId ? (sessionToken || `gst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`) : undefined;
    cart = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      sessionToken: tokenToUse,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    db.mutate((d) => {
      d.carts.push(cart!);
    });
  }

  return cart;
}

// Refresh prices and stock from live catalog
function refreshCartItems(items: CartItem[]): CartItem[] {
  const database = db.get();
  const refreshed: CartItem[] = [];

  for (const item of items) {
    const product = database.products.find((p) => p.id === item.productId);
    if (!product) continue; // Product was removed

    let price = product.price;
    let maxStock = product.stock;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        price = variant.price;
        maxStock = variant.stock;
      }
    }

    if (maxStock <= 0) continue; // Out of stock

    const validQty = Math.min(item.quantity, maxStock);
    refreshed.push({
      ...item,
      price,
      originalPrice: product.compareAtPrice,
      maxStock,
      quantity: validQty,
    });
  }

  return refreshed;
}

// GET Cart
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionToken = (req.headers['x-cart-token'] as string) || (req.query.token as string);

  const cart = getOrCreateCart(userId, sessionToken);
  const validatedItems = refreshCartItems(cart.items);

  // Update in DB if anything changed
  if (JSON.stringify(validatedItems) !== JSON.stringify(cart.items)) {
    db.mutate((d) => {
      const c = d.carts.find((item) => item.id === cart.id);
      if (c) {
        c.items = validatedItems;
        c.updatedAt = new Date().toISOString();
      }
    });
    cart.items = validatedItems;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    cart: {
      ...cart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItemsCount,
    },
  });
});

// POST Add to Cart
router.post('/add', (req: AuthenticatedRequest, res: Response) => {
  const { productId, variantId, quantity = 1 } = req.body;
  const userId = req.user?.id;
  const sessionToken = (req.headers['x-cart-token'] as string) || req.body.token;

  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  const database = db.get();
  const product = database.products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  let price = product.price;
  let maxStock = product.stock;
  let attributes: Record<string, string | undefined> | undefined = undefined;

  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      res.status(404).json({ error: 'Selected variant is not available.' });
      return;
    }
    price = variant.price;
    maxStock = variant.stock;
    attributes = variant.attributes;
  }

  if (maxStock <= 0) {
    res.status(400).json({ error: 'This item is currently out of stock.' });
    return;
  }

  const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
  const cart = getOrCreateCart(userId, sessionToken);

  const existingIndex = cart.items.findIndex(
    (i) => i.productId === productId && (i.variantId || '') === (variantId || '')
  );

  let newQuantity = qtyToAdd;
  if (existingIndex > -1) {
    newQuantity = cart.items[existingIndex].quantity + qtyToAdd;
  }

  if (newQuantity > maxStock) {
    res.status(400).json({
      error: `Cannot add more than ${maxStock} units of this item (current stock limit reached).`,
    });
    return;
  }

  db.mutate((d) => {
    const c = d.carts.find((item) => item.id === cart.id);
    if (!c) return;

    if (existingIndex > -1) {
      c.items[existingIndex].quantity = newQuantity;
      c.items[existingIndex].price = price;
    } else {
      c.items.push({
        id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId,
        variantId,
        title: product.title,
        image: product.images[0] || '',
        price,
        originalPrice: product.compareAtPrice,
        quantity: newQuantity,
        maxStock,
        attributes,
      });
    }
    c.updatedAt = new Date().toISOString();
  });

  const updatedCart = db.get().carts.find((c) => c.id === cart.id)!;
  const subtotal = updatedCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    message: 'Added to cart successfully.',
    cart: {
      ...updatedCart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItemsCount: updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// PUT Update quantity
router.put('/update', (req: AuthenticatedRequest, res: Response) => {
  const { productId, variantId, quantity } = req.body;
  const userId = req.user?.id;
  const sessionToken = (req.headers['x-cart-token'] as string) || req.body.token;

  const targetQty = parseInt(quantity, 10);
  const cart = getOrCreateCart(userId, sessionToken);

  const database = db.get();
  const product = database.products.find((p) => p.id === productId);
  if (!product && targetQty > 0) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  let maxStock = product?.stock || 0;
  if (variantId && product) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) maxStock = variant.stock;
  }

  if (targetQty > maxStock) {
    res.status(400).json({ error: `Only ${maxStock} units currently available in stock.` });
    return;
  }

  db.mutate((d) => {
    const c = d.carts.find((item) => item.id === cart.id);
    if (!c) return;

    if (targetQty <= 0) {
      c.items = c.items.filter(
        (i) => !(i.productId === productId && (i.variantId || '') === (variantId || ''))
      );
    } else {
      const item = c.items.find(
        (i) => i.productId === productId && (i.variantId || '') === (variantId || '')
      );
      if (item) {
        item.quantity = targetQty;
      }
    }
    c.updatedAt = new Date().toISOString();
  });

  const updatedCart = db.get().carts.find((c) => c.id === cart.id)!;
  const subtotal = updatedCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    message: 'Cart updated.',
    cart: {
      ...updatedCart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItemsCount: updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// DELETE Item
router.delete('/item/:productId', (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const variantId = req.query.variantId as string | undefined;
  const userId = req.user?.id;
  const sessionToken = (req.headers['x-cart-token'] as string) || (req.query.token as string);

  const cart = getOrCreateCart(userId, sessionToken);

  db.mutate((d) => {
    const c = d.carts.find((item) => item.id === cart.id);
    if (!c) return;
    c.items = c.items.filter(
      (i) => !(i.productId === productId && (i.variantId || '') === (variantId || ''))
    );
    c.updatedAt = new Date().toISOString();
  });

  const updatedCart = db.get().carts.find((c) => c.id === cart.id)!;
  const subtotal = updatedCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    message: 'Item removed from cart.',
    cart: {
      ...updatedCart,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItemsCount: updatedCart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// DELETE Clear Cart
router.delete('/clear', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const sessionToken = (req.headers['x-cart-token'] as string) || (req.query.token as string);

  const cart = getOrCreateCart(userId, sessionToken);

  db.mutate((d) => {
    const c = d.carts.find((item) => item.id === cart.id);
    if (c) {
      c.items = [];
      c.updatedAt = new Date().toISOString();
    }
  });

  res.json({ message: 'Cart cleared.', cart: { ...cart, items: [], subtotal: 0, totalItemsCount: 0 } });
});

// POST Merge Guest Cart to User Cart
router.post('/merge', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { guestToken } = req.body;
  if (!guestToken) {
    res.json({ message: 'No guest cart to merge.' });
    return;
  }

  const database = db.get();
  const guestCart = database.carts.find((c) => c.sessionToken === guestToken);
  if (!guestCart || guestCart.items.length === 0) {
    res.json({ message: 'Guest cart empty or not found.' });
    return;
  }

  const userCart = getOrCreateCart(req.user!.id);

  db.mutate((d) => {
    const target = d.carts.find((c) => c.id === userCart.id);
    if (!target) return;

    for (const gItem of guestCart.items) {
      const match = target.items.find(
        (t) => t.productId === gItem.productId && (t.variantId || '') === (gItem.variantId || '')
      );
      if (match) {
        match.quantity = Math.min(match.quantity + gItem.quantity, match.maxStock);
      } else {
        target.items.push(gItem);
      }
    }

    target.updatedAt = new Date().toISOString();

    // Clear guest cart
    const g = d.carts.find((c) => c.id === guestCart.id);
    if (g) g.items = [];
  });

  const refreshed = db.get().carts.find((c) => c.id === userCart.id)!;
  res.json({ message: 'Cart merged successfully.', cart: refreshed });
});

// WISHLIST: Get user wishlist
router.get('/wishlist', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const productIds = database.wishlists[req.user!.id] || [];
  const products = database.products.filter((p) => productIds.includes(p.id));
  res.json({ wishlist: products, count: products.length });
});

// WISHLIST: Toggle item
router.post('/wishlist/toggle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  const userId = req.user!.id;
  let isInWishlist = false;

  db.mutate((d) => {
    if (!d.wishlists[userId]) {
      d.wishlists[userId] = [];
    }

    const index = d.wishlists[userId].indexOf(productId);
    if (index > -1) {
      d.wishlists[userId].splice(index, 1);
      isInWishlist = false;
    } else {
      d.wishlists[userId].push(productId);
      isInWishlist = true;
    }
  });

  const currentWishlist = db.get().wishlists[userId] || [];
  res.json({
    message: isInWishlist ? 'Product added to wishlist.' : 'Product removed from wishlist.',
    isInWishlist,
    count: currentWishlist.length,
  });
});

export default router;
