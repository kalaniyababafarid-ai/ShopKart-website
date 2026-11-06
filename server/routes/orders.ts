import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../auth';
import { Order, OrderItem, OrderTimelineEvent, PaymentMethod, PaymentStatus, ReturnRequest, StockMovement } from '../types';

const router = Router();

// Server-side calculation endpoint
router.post('/calculate', (req: AuthenticatedRequest, res: Response) => {
  const { items = [], couponCode, shippingMethodId = 'ship-std' } = req.body;

  const database = db.get();
  const settings = database.settings;

  let subtotal = 0;
  for (const item of items) {
    const product = database.products.find((p) => p.id === item.productId);
    if (!product) continue;
    let price = product.price;
    if (item.variantId) {
      const v = product.variants.find((variant) => variant.id === item.variantId);
      if (v) price = v.price;
    }
    subtotal += price * (item.quantity || 1);
  }
  subtotal = parseFloat(subtotal.toFixed(2));

  // Discount
  let discount = 0;
  if (couponCode) {
    const coupon = database.coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
    );
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }
  }
  discount = parseFloat(discount.toFixed(2));

  // Shipping
  let shippingFee = 0;
  if (subtotal < settings.freeShippingThreshold) {
    shippingFee = shippingMethodId === 'ship-exp' ? settings.expressShippingFee : settings.standardShippingFee;
  } else if (shippingMethodId === 'ship-exp') {
    shippingFee = settings.expressShippingFee;
  }
  shippingFee = parseFloat(shippingFee.toFixed(2));

  // Tax
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * settings.taxRate).toFixed(2));

  // Final Total
  const total = parseFloat((taxableAmount + shippingFee + tax).toFixed(2));

  res.json({
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    currencySymbol: settings.currencySymbol,
  });
});

// Create Order (strictly validated on server)
router.post('/create', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const {
    items = [],
    shippingAddress,
    shippingMethod = { id: 'ship-std', name: 'Standard Delivery', estimatedDays: '3-5 Business Days', cost: 0 },
    paymentMethod = 'card',
    couponCode,
    notes,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Your cart is empty. Add items before placing an order.' });
    return;
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
    res.status(400).json({ error: 'A valid delivery shipping address is required.' });
    return;
  }

  const database = db.get();
  const settings = database.settings;

  // 1. Validate real inventory and prices from DB
  const validatedItems: OrderItem[] = [];
  let subtotal = 0;

  for (const requestedItem of items) {
    const product = database.products.find((p) => p.id === requestedItem.productId);
    if (!product) {
      res.status(400).json({ error: `Product "${requestedItem.title || 'Item'}" is no longer available.` });
      return;
    }

    let unitPrice = product.price;
    let availableStock = product.stock;
    let variantName = '';

    if (requestedItem.variantId) {
      const variant = product.variants.find((v) => v.id === requestedItem.variantId);
      if (!variant) {
        res.status(400).json({ error: `Selected variant for "${product.title}" is unavailable.` });
        return;
      }
      unitPrice = variant.price;
      availableStock = variant.stock;
      variantName = variant.name;
    }

    const qty = Math.max(1, parseInt(requestedItem.quantity, 10) || 1);
    if (qty > availableStock) {
      res.status(400).json({
        error: `Insufficient stock for "${product.title}". Only ${availableStock} units remaining.`,
      });
      return;
    }

    const itemTotal = parseFloat((unitPrice * qty).toFixed(2));
    subtotal += itemTotal;

    validatedItems.push({
      productId: product.id,
      variantId: requestedItem.variantId,
      title: variantName ? `${product.title} (${variantName})` : product.title,
      image: product.images[0] || '',
      price: unitPrice,
      quantity: qty,
      total: itemTotal,
      attributes: requestedItem.attributes,
    });
  }

  subtotal = parseFloat(subtotal.toFixed(2));

  // 2. Validate Coupon
  let discount = 0;
  let validatedCouponCode: string | undefined;

  if (couponCode) {
    const coupon = database.coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
    );
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
      discount = parseFloat(discount.toFixed(2));
      validatedCouponCode = coupon.code;
    }
  }

  // 3. Shipping Fee
  let shippingFee = 0;
  if (subtotal < settings.freeShippingThreshold) {
    shippingFee = shippingMethod.id === 'ship-exp' ? settings.expressShippingFee : settings.standardShippingFee;
  } else if (shippingMethod.id === 'ship-exp') {
    shippingFee = settings.expressShippingFee;
  }
  shippingFee = parseFloat(shippingFee.toFixed(2));

  // 4. Tax
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * settings.taxRate).toFixed(2));

  // 5. Grand Total
  const total = parseFloat((taxableAmount + shippingFee + tax).toFixed(2));

  // 6. Generate IDs
  const orderNumber = `SK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  // Payment status
  const isCod = paymentMethod === 'cod';
  const paymentStatus: PaymentStatus = isCod ? 'pending' : 'completed';
  const transactionId = isCod
    ? undefined
    : `TXN_${paymentMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const timeline: OrderTimelineEvent[] = [
    {
      status: 'pending',
      title: 'Order Placed',
      description: `Order successfully submitted with ${paymentMethod.toUpperCase()} payment method.`,
      timestamp: nowIso,
    },
    {
      status: 'confirmed',
      title: 'Order Confirmed',
      description: isCod
        ? 'Cash on delivery verified. Sent to warehouse for fulfillment.'
        : `Payment verified (${transactionId}). Order confirmed for processing.`,
      timestamp: new Date(Date.now() + 2000).toISOString(),
    },
  ];

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    userId: req.user!.id,
    customerName: req.user!.name || shippingAddress.fullName,
    customerEmail: req.user!.email,
    customerPhone: shippingAddress.phone || req.user!.phone || '',
    items: validatedItems,
    shippingAddress,
    shippingMethod: {
      id: shippingMethod.id || 'ship-std',
      name: shippingMethod.name || 'Standard Insured Delivery',
      estimatedDays: shippingMethod.estimatedDays || '3-4 Business Days',
      cost: shippingFee,
    },
    subtotal,
    discount,
    couponCode: validatedCouponCode,
    shippingFee,
    tax,
    total,
    paymentMethod: paymentMethod as PaymentMethod,
    paymentStatus,
    paymentTransactionId: transactionId,
    status: 'confirmed',
    timeline,
    trackingCarrier: 'Shopkart Express Courier',
    trackingNumber: `SKP-${Math.floor(100000000 + Math.random() * 900000000)}`,
    notes,
    createdAt: nowIso,
  };

  // 7. Atomic Database Mutation: Deduct Stock, Record Stock Movement, Increment Coupon Usage, Clear Cart
  db.mutate((d) => {
    // Deduct stock
    for (const item of validatedItems) {
      const p = d.products.find((prod) => prod.id === item.productId);
      if (p) {
        const prevStock = p.stock;
        p.stock = Math.max(0, p.stock - item.quantity);

        if (item.variantId) {
          const v = p.variants.find((variant) => variant.id === item.variantId);
          if (v) {
            v.stock = Math.max(0, v.stock - item.quantity);
          }
        }

        const movement: StockMovement = {
          id: `sm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: p.id,
          variantId: item.variantId,
          quantityChange: -item.quantity,
          type: 'sale',
          reason: `Customer Order ${orderNumber}`,
          previousStock: prevStock,
          newStock: p.stock,
          createdAt: nowIso,
        };
        d.stockMovements.push(movement);
      }
    }

    // Coupon increment
    if (validatedCouponCode) {
      const c = d.coupons.find((cp) => cp.code === validatedCouponCode);
      if (c) c.timesUsed += 1;
    }

    // Insert order
    d.orders.unshift(newOrder);

    // Clear user's cart
    const userCart = d.carts.find((c) => c.userId === req.user!.id);
    if (userCart) {
      userCart.items = [];
      userCart.updatedAt = nowIso;
    }
  });

  res.status(201).json({
    message: 'Order created successfully.',
    order: newOrder,
  });
});

// List User Orders
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const userOrders = database.orders
    .filter((o) => o.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ orders: userOrders });
});

// Get Single Order
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const database = db.get();

  const order = database.orders.find(
    (o) => (o.id === id || o.orderNumber === id) && (o.userId === req.user!.id || req.user!.role === 'admin')
  );

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json({ order });
});

// Cancel Order (if eligible: pending or confirmed)
router.post('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason = 'Cancelled by customer' } = req.body;

  const order = db.mutate((d) => {
    const o = d.orders.find((item) => item.id === id && item.userId === req.user!.id);
    if (!o) return null;

    if (!['pending', 'confirmed'].includes(o.status)) {
      return { error: 'Order can only be cancelled while in Pending or Confirmed status.' };
    }

    o.status = 'cancelled';
    o.timeline.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      description: `Cancelled: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    if (o.paymentStatus === 'completed') {
      o.paymentStatus = 'refunded';
    }

    // Restore stock to inventory!
    for (const item of o.items) {
      const p = d.products.find((prod) => prod.id === item.productId);
      if (p) {
        const prev = p.stock;
        p.stock += item.quantity;
        if (item.variantId) {
          const v = p.variants.find((variant) => variant.id === item.variantId);
          if (v) v.stock += item.quantity;
        }

        d.stockMovements.push({
          id: `sm-restock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: p.id,
          variantId: item.variantId,
          quantityChange: item.quantity,
          type: 'restock',
          reason: `Restocked after order cancellation (${o.orderNumber})`,
          previousStock: prev,
          newStock: p.stock,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return o;
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if ('error' in order) {
    res.status(400).json({ error: order.error });
    return;
  }

  res.json({ message: 'Order has been successfully cancelled and stock restored.', order });
});

// Request Return / Refund / Replacement
router.post('/:id/return', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason, comments, requestType = 'return' } = req.body;

  if (!reason || !comments) {
    res.status(400).json({ error: 'Reason and detailed comments are required for return request.' });
    return;
  }

  const result = db.mutate((d) => {
    const o = d.orders.find((item) => item.id === id && item.userId === req.user!.id);
    if (!o) return null;

    if (o.status !== 'delivered') {
      return { error: 'Returns can only be requested on delivered orders.' };
    }

    const returnRequest: ReturnRequest = {
      id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: o.id,
      reason,
      comments,
      requestType,
      status: 'requested',
      createdAt: new Date().toISOString(),
      refundAmount: o.total,
    };

    o.returnRequest = returnRequest;
    o.timeline.push({
      status: 'returned',
      title: `${requestType.toUpperCase()} Requested`,
      description: `Customer submitted ${requestType} request. Reason: ${reason}. Under admin review.`,
      timestamp: new Date().toISOString(),
    });

    return o;
  });

  if (!result) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ message: 'Return request submitted successfully. Our team will review within 24 hours.', order: result });
});

export default router;
