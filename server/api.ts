import { Router } from 'express';
import { db } from './db';
import { authMiddleware } from './auth';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import supportRoutes from './routes/support';
import adminRoutes from './routes/admin';
import blogRoutes from './routes/blog';
import notificationRoutes from './routes/notifications';

const api = Router();

// Apply auth middleware to parse bearer tokens across all api calls
api.use(authMiddleware);

// Health check endpoint
api.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Shopkart E-Commerce API Engine',
    timestamp: new Date().toISOString(),
  });
});

// Top-level discovery & catalog routes
api.get('/categories', (_req, res) => {
  const database = db.get();
  const withCounts = database.categories.map((c) => {
    const count = database.products.filter((p) => p.categoryId === c.id).length;
    const subs = database.subCategories.filter((s) => s.categoryId === c.id);
    return { ...c, productCount: count, subCategories: subs };
  });
  res.json({ categories: withCounts });
});

api.get('/brands', (_req, res) => {
  const database = db.get();
  const withCounts = database.brands.map((b) => {
    const count = database.products.filter((p) => p.brandId === b.id).length;
    return { ...b, productCount: count };
  });
  res.json({ brands: withCounts });
});

api.get('/banners', (_req, res) => {
  const database = db.get();
  res.json({ banners: database.banners.filter((b) => b.isActive) });
});

api.get('/settings', (_req, res) => {
  const database = db.get();
  res.json({ settings: database.settings });
});

// Mount modules
api.use('/auth', authRoutes);
api.use('/products', productRoutes);
api.use('/cart', cartRoutes);
api.use('/orders', orderRoutes);
api.use('/coupons', couponRoutes);
api.use('/reviews', reviewRoutes);
api.use('/support', supportRoutes);
api.use('/admin', adminRoutes);
api.use('/blog', blogRoutes);
api.use('/notifications', notificationRoutes);

export default api;
