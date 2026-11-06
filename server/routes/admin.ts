import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../auth';
import { Product, StockMovement, Coupon, OrderStatus, Category, Brand, BlogPost, SiteBanner, SubCategory } from '../types';
import { auditProductCatalog, extractImageSignature } from '../catalog/duplicateDetector';

const router = Router();
router.use(requireAdmin);

// Admin Analytics & Dashboard Overview
router.get('/dashboard', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const orders = database.orders;
  const products = database.products;
  const users = database.users;

  // Real calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Top 5 Products by sales
  const productSalesMap: Record<string, { title: string; count: number; revenue: number; image: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          title: item.title,
          count: 0,
          revenue: 0,
          image: item.image,
        };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by Category
  const categorySalesMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const cat = database.categories.find((c) => c.id === p?.categoryId);
      const catName = cat ? cat.name : 'Other';
      categorySalesMap[catName] = (categorySalesMap[catName] || 0) + item.total;
    });
  });

  const recentOrders = orders.slice(0, 5);
  const pendingReturns = orders.filter((o) => o.returnRequest?.status === 'requested').length;

  res.json({
    metrics: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      pendingReturns,
    },
    statusCounts,
    topProducts,
    categorySales: categorySalesMap,
    recentOrders,
    lowStockProducts: lowStockProducts.slice(0, 6),
  });
});

// Orders Management
router.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  const { status, q, page = '1', limit = '20' } = req.query;
  const database = db.get();
  let filtered = [...database.orders];

  if (status && status !== 'all') {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (q && typeof q === 'string') {
    const term = q.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(term))
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 20;
  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    orders: paginated,
    pagination: {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Update Order Status
router.put('/orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, trackingCarrier, note } = req.body;

  const validStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid order status '${status}'.` });
    return;
  }

  const updatedOrder = db.mutate((d) => {
    const order = d.orders.find((o) => o.id === id);
    if (!order) return null;

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber.trim();
    if (trackingCarrier) order.trackingCarrier = trackingCarrier.trim();

    if (status === 'delivered') {
      order.paymentStatus = 'completed';
    }

    const descriptions: Record<OrderStatus, string> = {
      pending: 'Order placed, pending warehouse confirmation.',
      confirmed: 'Order verified and scheduled for packing.',
      processing: 'Order packed with secure materials and sealed.',
      shipped: `Dispatched with ${order.trackingCarrier || 'carrier'}. Tracking #${order.trackingNumber || 'Available shortly'}.`,
      out_for_delivery: 'Courier is delivering your package today.',
      delivered: 'Package successfully delivered.',
      cancelled: 'Order has been cancelled by administration.',
      returned: 'Returned goods inspected at fulfillment center.',
    };

    order.timeline.push({
      status,
      title: `Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
      description: note || descriptions[status as OrderStatus],
      timestamp: new Date().toISOString(),
    });

    return order;
  });

  if (!updatedOrder) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json({ message: 'Order status updated successfully.', order: updatedOrder });
});

// Returns & Refunds Management
router.get('/returns', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const returnOrders = database.orders.filter((o) => !!o.returnRequest);
  res.json({ returns: returnOrders });
});

router.put('/returns/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, adminNotes } = req.body; // 'approve' | 'reject' | 'complete'

  const updated = db.mutate((d) => {
    const order = d.orders.find((o) => o.id === id);
    if (!order || !order.returnRequest) return null;

    if (action === 'approve') {
      order.returnRequest.status = 'approved';
      order.returnRequest.adminNotes = adminNotes;
      order.timeline.push({
        status: 'returned',
        title: 'Return Approved',
        description: `Your ${order.returnRequest.requestType} has been approved. ${adminNotes || 'Please await carrier pickup or drop-off label.'}`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'complete') {
      order.returnRequest.status = 'completed';
      order.status = 'returned';
      order.paymentStatus = 'refunded';
      order.returnRequest.adminNotes = adminNotes;

      // Restock returned items!
      for (const item of order.items) {
        const prod = d.products.find((p) => p.id === item.productId);
        if (prod) {
          const prev = prod.stock;
          prod.stock += item.quantity;
          d.stockMovements.push({
            id: `sm-return-${Date.now()}`,
            productId: prod.id,
            quantityChange: item.quantity,
            type: 'return',
            reason: `Return completed for order ${order.orderNumber}`,
            previousStock: prev,
            newStock: prod.stock,
            createdAt: new Date().toISOString(),
          });
        }
      }

      order.timeline.push({
        status: 'returned',
        title: 'Return & Refund Finalized',
        description: `Goods inspected and refund of $${order.total.toFixed(2)} processed. Stock restored to inventory.`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'replacement') {
      order.returnRequest.status = 'completed';
      order.returnRequest.adminNotes = adminNotes;
      const rplTracking = `RPL-${Math.floor(100000000 + Math.random() * 900000000)}`;
      order.returnRequest.replacementCarrier = 'Shopkart Express Courier';
      order.returnRequest.replacementTrackingNumber = rplTracking;

      order.timeline.push({
        status: 'delivered',
        title: 'Replacement Dispatched',
        description: `Replacement package processed and dispatched. Carrier: Shopkart Express (Tracking: ${rplTracking}). ${adminNotes || ''}`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'reject') {
      order.returnRequest.status = 'rejected';
      order.returnRequest.adminNotes = adminNotes;
      order.timeline.push({
        status: order.status,
        title: 'Return Request Declined',
        description: `Return declined: ${adminNotes || 'Policy requirements not met.'}`,
        timestamp: new Date().toISOString(),
      });
    }

    return order;
  });

  if (!updated) {
    res.status(404).json({ error: 'Order or return request not found.' });
    return;
  }

  res.json({ message: `Return request ${action}d.`, order: updated });
});

// Products CRUD
router.get('/products', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({ products: database.products });
});

router.post('/products', (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    categoryId,
    subCategoryId,
    brandId,
    price,
    compareAtPrice,
    stock,
    lowStockThreshold = 5,
    shortDescription,
    description,
    images = [],
    tags = [],
    specs = {},
    variants = [],
    isFeatured = false,
    isDeal = false,
  } = req.body;

  if (!title || !price || !categoryId || !brandId) {
    res.status(400).json({ error: 'Title, price, category, and brand are mandatory fields.' });
    return;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const id = `prod-${Date.now()}`;
  const sku = `SK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const numPrice = parseFloat(price);
  const numCompare = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
  const discountPercentage = numCompare && numCompare > numPrice ? Math.round(((numCompare - numPrice) / numCompare) * 100) : undefined;

  const newProduct: Product = {
    id,
    title: title.trim(),
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    sku,
    categoryId,
    subCategoryId,
    brandId,
    price: numPrice,
    compareAtPrice: numCompare,
    discountPercentage,
    stock: parseInt(stock, 10) || 0,
    lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
    rating: 5.0,
    reviewCount: 0,
    isFeatured: !!isFeatured,
    isBestSeller: false,
    isTrending: false,
    isDeal: !!isDeal,
    shortDescription: shortDescription || title,
    description: description || title,
    tags: Array.isArray(tags) ? tags : [],
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'],
    specs: specs || {},
    variants: Array.isArray(variants) ? variants : [],
    createdAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    d.products.unshift(newProduct);
  });

  res.status(201).json({ message: 'Product created successfully.', product: newProduct });
});

router.put('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedProduct = db.mutate((d) => {
    const p = d.products.find((prod) => prod.id === id);
    if (!p) return null;

    if (updates.title) p.title = updates.title.trim();
    if (updates.price !== undefined) p.price = parseFloat(updates.price);
    if (updates.compareAtPrice !== undefined) p.compareAtPrice = updates.compareAtPrice ? parseFloat(updates.compareAtPrice) : undefined;
    if (updates.stock !== undefined) p.stock = parseInt(updates.stock, 10);
    if (updates.lowStockThreshold !== undefined) p.lowStockThreshold = parseInt(updates.lowStockThreshold, 10);
    if (updates.categoryId) p.categoryId = updates.categoryId;
    if (updates.subCategoryId !== undefined) p.subCategoryId = updates.subCategoryId;
    if (updates.brandId) p.brandId = updates.brandId;
    if (updates.shortDescription) p.shortDescription = updates.shortDescription;
    if (updates.description) p.description = updates.description;
    if (updates.images) p.images = updates.images;
    if (updates.tags) p.tags = updates.tags;
    if (updates.specs) p.specs = updates.specs;
    if (updates.variants) p.variants = updates.variants;
    if (updates.isFeatured !== undefined) p.isFeatured = !!updates.isFeatured;
    if (updates.isDeal !== undefined) p.isDeal = !!updates.isDeal;
    if (updates.isBestSeller !== undefined) p.isBestSeller = !!updates.isBestSeller;
    if (updates.isTrending !== undefined) p.isTrending = !!updates.isTrending;

    return p;
  });

  if (!updatedProduct) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json({ message: 'Product updated.', product: updatedProduct });
});

router.delete('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const removed = db.mutate((d) => {
    const idx = d.products.findIndex((p) => p.id === id);
    if (idx > -1) {
      return d.products.splice(idx, 1)[0];
    }
    return null;
  });

  if (!removed) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json({ message: 'Product deleted successfully.' });
});

// Inventory Management
router.get('/inventory', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({
    products: database.products.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock',
      variants: p.variants,
    })),
    recentMovements: database.stockMovements.slice(-20).reverse(),
  });
});

router.post('/inventory/adjust', (req: AuthenticatedRequest, res: Response) => {
  const { productId, variantId, quantityAdjustment, reason } = req.body;

  if (!productId || quantityAdjustment === undefined || !reason) {
    res.status(400).json({ error: 'ProductId, quantityAdjustment (+/-), and reason are required.' });
    return;
  }

  const adj = parseInt(quantityAdjustment, 10);
  if (isNaN(adj) || adj === 0) {
    res.status(400).json({ error: 'Invalid quantity adjustment.' });
    return;
  }

  const result = db.mutate((d) => {
    const p = d.products.find((prod) => prod.id === productId);
    if (!p) return null;

    const prev = p.stock;
    const newStock = Math.max(0, p.stock + adj);
    p.stock = newStock;

    if (variantId) {
      const v = p.variants.find((variant) => variant.id === variantId);
      if (v) v.stock = Math.max(0, v.stock + adj);
    }

    const movement: StockMovement = {
      id: `sm-adj-${Date.now()}`,
      productId,
      variantId,
      quantityChange: adj,
      type: 'adjustment',
      reason: `Manual Admin Adjustment: ${reason}`,
      previousStock: prev,
      newStock,
      createdAt: new Date().toISOString(),
    };
    d.stockMovements.push(movement);

    return { product: p, movement };
  });

  if (!result) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  res.json({ message: 'Inventory adjusted.', result });
});

// Coupons CRUD
router.get('/coupons', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({ coupons: database.coupons });
});

router.post('/coupons', (req: AuthenticatedRequest, res: Response) => {
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, validFrom, validUntil } = req.body;

  if (!code || !discountType || !discountValue) {
    res.status(400).json({ error: 'Code, discountType, and discountValue are required.' });
    return;
  }

  const cleanCode = code.trim().toUpperCase();
  const database = db.get();
  if (database.coupons.some((c) => c.code === cleanCode)) {
    res.status(409).json({ error: 'A coupon with this code already exists.' });
    return;
  }

  const newCoupon: Coupon = {
    id: `cp-${Date.now()}`,
    code: cleanCode,
    description: description || `${discountValue}${discountType === 'percentage' ? '%' : '$'} OFF`,
    discountType,
    discountValue: parseFloat(discountValue),
    minOrderValue: parseFloat(minOrderValue) || 0,
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
    validFrom: validFrom || new Date().toISOString(),
    validUntil: validUntil || new Date(Date.now() + 86400000 * 365).toISOString(),
    usageLimit: parseInt(usageLimit, 10) || 1000,
    timesUsed: 0,
    isActive: true,
  };

  db.mutate((d) => {
    d.coupons.push(newCoupon);
  });

  res.status(201).json({ message: 'Coupon created.', coupon: newCoupon });
});

router.put('/coupons/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.mutate((d) => {
    const c = d.coupons.find((cp) => cp.id === id);
    if (!c) return null;
    Object.assign(c, updates);
    return c;
  });

  if (!updated) {
    res.status(404).json({ error: 'Coupon not found.' });
    return;
  }

  res.json({ message: 'Coupon updated.', coupon: updated });
});

router.delete('/coupons/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((d) => {
    d.coupons = d.coupons.filter((c) => c.id !== id);
  });
  res.json({ message: 'Coupon removed.' });
});

// Categories & Brands CRUD
router.post('/categories', (req: AuthenticatedRequest, res: Response) => {
  const { name, description, image, banner, icon } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: name.trim(),
    slug,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    banner,
    icon: icon || 'Tag',
    isFeatured: true,
  };

  db.mutate((d) => {
    d.categories.push(newCat);
  });

  res.status(201).json({ message: 'Category added.', category: newCat });
});

router.post('/brands', (req: AuthenticatedRequest, res: Response) => {
  const { name, logo, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Brand name is required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newBrand: Brand = {
    id: `brand-${Date.now()}`,
    name: name.trim(),
    slug,
    logo: logo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
    description: description || '',
    isFeatured: true,
  };

  db.mutate((d) => {
    d.brands.push(newBrand);
  });

  res.status(201).json({ message: 'Brand added.', brand: newBrand });
});

// Users directory
router.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const userList = database.users.map((u) => {
    const userOrders = database.orders.filter((o) => o.userId === u.id);
    const spent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'completed' ? o.total : 0), 0);
    const { passwordHash: _, ...safe } = u;
    return {
      ...safe,
      orderCount: userOrders.length,
      totalSpent: parseFloat(spent.toFixed(2)),
    };
  });
  res.json({ users: userList });
});

// Admin Support Tickets
router.get('/tickets', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({ tickets: database.supportTickets });
});

router.put('/tickets/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, replyMessage } = req.body;

  const ticket = db.mutate((d) => {
    const t = d.supportTickets.find((item) => item.id === id);
    if (!t) return null;

    if (status) t.status = status;
    if (replyMessage) {
      t.replies.push({
        id: `rep-adm-${Date.now()}`,
        sender: 'support',
        senderName: 'Shopkart Official Support Concierge',
        message: replyMessage.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    return t;
  });

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  res.json({ message: 'Ticket updated.', ticket });
});

// Messages & Subscribers
router.get('/messages', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ messages: db.get().contactMessages });
});

router.get('/subscribers', (_req: AuthenticatedRequest, res: Response) => {
  res.json({ subscribers: db.get().newsletterSubscribers });
});

// Site Settings update
router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const newSettings = db.mutate((d) => {
    Object.assign(d.settings, updates);
    return d.settings;
  });
  res.json({ message: 'Settings saved.', settings: newSettings });
});

// Blog Posts Admin CRUD
router.get('/blog', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({ posts: database.blogPosts || [] });
});

router.post('/blog', (req: AuthenticatedRequest, res: Response) => {
  const { title, excerpt, content, category, tags = [], coverImage, author, readTime = '4 min read', isPublished = true } = req.body;

  if (!title || !content || !category) {
    res.status(400).json({ error: 'Title, content, and category are required.' });
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newPost: BlogPost = {
    id: `blog-${Date.now()}`,
    slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
    title: title.trim(),
    excerpt: excerpt?.trim() || title.trim(),
    content: content.trim(),
    category: category.trim(),
    tags: Array.isArray(tags) ? tags : [],
    coverImage: coverImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80',
    author: author || req.user!.name || 'Shopkart Editorial',
    authorAvatar: req.user!.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    readTime,
    isPublished: !!isPublished,
    publishedAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    if (!d.blogPosts) d.blogPosts = [];
    d.blogPosts.unshift(newPost);
  });

  res.status(201).json({ message: 'Blog post published.', post: newPost });
});

router.put('/blog/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.mutate((d) => {
    const post = (d.blogPosts || []).find((p) => p.id === id);
    if (!post) return null;
    Object.assign(post, updates);
    return post;
  });

  if (!updated) {
    res.status(404).json({ error: 'Blog post not found.' });
    return;
  }

  res.json({ message: 'Blog post updated.', post: updated });
});

router.delete('/blog/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((d) => {
    d.blogPosts = (d.blogPosts || []).filter((p) => p.id !== id);
  });
  res.json({ message: 'Blog post deleted.' });
});

// Reviews Moderation
router.get('/reviews', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const enhanced = (database.reviews || []).map((r) => {
    const p = database.products.find((prod) => prod.id === r.productId);
    return {
      ...r,
      productTitle: p?.title || 'Unknown Product',
      productImage: p?.images[0] || '',
    };
  });
  res.json({ reviews: enhanced });
});

router.delete('/reviews/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const removed = db.mutate((d) => {
    const idx = (d.reviews || []).findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const rev = d.reviews.splice(idx, 1)[0];

    // Recalculate product rating
    const prodReviews = d.reviews.filter((r) => r.productId === rev.productId);
    const p = d.products.find((prod) => prod.id === rev.productId);
    if (p) {
      if (prodReviews.length > 0) {
        const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        p.rating = parseFloat(avg.toFixed(2));
        p.reviewCount = prodReviews.length;
      } else {
        p.rating = 5.0;
        p.reviewCount = 0;
      }
    }
    return rev;
  });

  if (!removed) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  res.json({ message: 'Review moderated and removed.' });
});

// Banners Admin CRUD
router.get('/banners', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  res.json({ banners: database.banners || [] });
});

router.post('/banners', (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, tag, image, link = 'shop', buttonText = 'Shop Now', badge } = req.body;
  if (!title || !image) {
    res.status(400).json({ error: 'Title and image URL are required.' });
    return;
  }

  const newBanner: SiteBanner = {
    id: `bnr-${Date.now()}`,
    title: title.trim(),
    subtitle: subtitle?.trim() || '',
    tag: tag?.trim() || 'Featured',
    image: image.trim(),
    link: link.trim(),
    buttonText: buttonText.trim(),
    badge: badge?.trim(),
    isActive: true,
  };

  db.mutate((d) => {
    if (!d.banners) d.banners = [];
    d.banners.push(newBanner);
  });

  res.status(201).json({ message: 'Banner added.', banner: newBanner });
});

router.put('/banners/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.mutate((d) => {
    const b = (d.banners || []).find((bnr) => bnr.id === id);
    if (!b) return null;
    Object.assign(b, updates);
    return b;
  });

  if (!updated) {
    res.status(404).json({ error: 'Banner not found.' });
    return;
  }

  res.json({ message: 'Banner updated.', banner: updated });
});

router.delete('/banners/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((d) => {
    d.banners = (d.banners || []).filter((b) => b.id !== id);
  });
  res.json({ message: 'Banner removed.' });
});

// Subcategories CRUD
router.post('/subcategories', (req: AuthenticatedRequest, res: Response) => {
  const { categoryId, name, description } = req.body;
  if (!categoryId || !name) {
    res.status(400).json({ error: 'Category ID and Subcategory Name are required.' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newSub: SubCategory = {
    id: `subcat-${Date.now()}`,
    categoryId,
    name: name.trim(),
    slug,
    description: description?.trim(),
  };

  db.mutate((d) => {
    if (!d.subCategories) d.subCategories = [];
    d.subCategories.push(newSub);
  });

  res.status(201).json({ message: 'Subcategory added.', subCategory: newSub });
});

router.delete('/subcategories/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  db.mutate((d) => {
    d.subCategories = (d.subCategories || []).filter((s) => s.id !== id);
  });
  res.json({ message: 'Subcategory deleted.' });
});

// User Role Management
router.put('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'admin' && role !== 'customer') {
    res.status(400).json({ error: 'Invalid user role.' });
    return;
  }

  const updated = db.mutate((d) => {
    const u = d.users.find((user) => user.id === id);
    if (!u) return null;
    u.role = role;
    return u;
  });

  if (!updated) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ message: `User role updated to ${role}.`, user: { id: updated.id, email: updated.email, role: updated.role } });
});

// Catalog & Image Forensic Audit Report (Prompt Requirement 1)
router.get('/audit/images', (_req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const products = database.products;
  const categories = database.categories;
  const brands = database.brands;

  const categoryIds = new Set(categories.map((c) => c.id));
  const brandIds = new Set(brands.map((b) => b.id));

  // Run duplicate detector validation
  const validation = auditProductCatalog(products, categoryIds, brandIds);

  // Analyze each product image
  const imageMap = new Map<string, string[]>(); // signature -> skus
  let missingImagesCount = 0;
  let brokenUrlsCount = 0;
  let manualVerificationCount = 0;

  const auditedProducts = products.map((p) => {
    const hasImage = p.images && p.images.length > 0 && !!p.images[0];
    if (!hasImage) {
      missingImagesCount++;
    }

    const primaryImg = hasImage ? p.images[0] : '';
    const sig = extractImageSignature(primaryImg);
    if (sig) {
      const existing = imageMap.get(sig) || [];
      existing.push(p.sku);
      imageMap.set(sig, existing);
    }

    // Check URL syntax validity
    let isValidUrl = false;
    try {
      new URL(primaryImg);
      isValidUrl = true;
    } catch {
      brokenUrlsCount++;
    }

    const cat = categories.find((c) => c.id === p.categoryId);
    const br = brands.find((b) => b.id === p.brandId);

    const isVerified = hasImage && isValidUrl && (imageMap.get(sig)?.length || 0) <= 1;

    return {
      id: p.id,
      sku: p.sku,
      title: p.title,
      category: cat ? cat.name : p.categoryId,
      brand: br ? br.name : p.brandId,
      primaryImage: primaryImg,
      galleryCount: p.images ? p.images.length : 0,
      signature: sig,
      status: isVerified ? 'verified' : 'flagged',
    };
  });

  // Duplicate image assignments count
  let duplicateImageAssignments = 0;
  const duplicateSignatures: { signature: string; skus: string[] }[] = [];
  imageMap.forEach((skus, sig) => {
    if (skus.length > 1) {
      duplicateImageAssignments += skus.length - 1;
      duplicateSignatures.push({ signature: sig, skus });
    }
  });

  const verifiedMatchingImages = auditedProducts.filter((p) => p.status === 'verified').length;

  res.json({
    summary: {
      totalProductsAudited: products.length,
      verifiedMatchingImages,
      duplicateImageAssignments,
      brokenImageUrls: brokenUrlsCount,
      missingImages: missingImagesCount,
      productsRequiringManualVerification: manualVerificationCount,
      isValid: validation.isValid && duplicateImageAssignments === 0 && missingImagesCount === 0,
      lastAuditedAt: new Date().toISOString(),
    },
    validation,
    duplicateSignatures,
    products: auditedProducts,
  });
});

export default router;
