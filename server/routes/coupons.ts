import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// List public active promotional coupons
router.get('/', (_req: Request, res: Response) => {
  const database = db.get();
  const now = new Date();
  const activeCoupons = database.coupons.filter(
    (c) => c.isActive && new Date(c.validFrom) <= now && new Date(c.validUntil) >= now
  );

  res.json({
    coupons: activeCoupons.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount,
    })),
  });
});

// Validate coupon for checkout
router.post('/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Coupon code is required.' });
    return;
  }

  const cleanCode = code.trim().toUpperCase();
  const cartSubtotal = parseFloat(subtotal) || 0;

  const database = db.get();
  const coupon = database.coupons.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    res.status(404).json({ error: `Coupon code '${cleanCode}' is invalid.` });
    return;
  }

  if (!coupon.isActive) {
    res.status(400).json({ error: 'This coupon has been deactivated.' });
    return;
  }

  const now = new Date();
  if (new Date(coupon.validFrom) > now || new Date(coupon.validUntil) < now) {
    res.status(400).json({ error: 'This coupon has expired.' });
    return;
  }

  if (coupon.timesUsed >= coupon.usageLimit) {
    res.status(400).json({ error: 'This coupon has reached its maximum redemption limit.' });
    return;
  }

  if (cartSubtotal < coupon.minOrderValue) {
    res.status(400).json({
      error: `Minimum order value of $${coupon.minOrderValue.toFixed(2)} required for coupon ${cleanCode}.`,
    });
    return;
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (cartSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, cartSubtotal);
  }

  discount = parseFloat(discount.toFixed(2));

  res.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount,
  });
});

export default router;
