import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../auth';
import { Review } from '../types';

const router = Router();

// Get reviews for a product
router.get('/product/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const database = db.get();
  const reviews = database.reviews
    .filter((r) => r.productId === productId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ reviews });
});

// Post review
router.post('/product/:productId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  if (!rating || !comment || !title) {
    res.status(400).json({ error: 'Rating (1-5), title, and review comment are required.' });
    return;
  }

  const ratingNum = Math.min(5, Math.max(1, parseFloat(rating)));
  const database = db.get();
  const product = database.products.find((p) => p.id === productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  // Check if existing review from this user
  const alreadyReviewed = database.reviews.find(
    (r) => r.productId === productId && r.userId === req.user!.id
  );
  if (alreadyReviewed) {
    res.status(400).json({ error: 'You have already submitted a review for this product.' });
    return;
  }

  // Check verified purchase
  const hasPurchased = database.orders.some(
    (o) => o.userId === req.user!.id && o.items.some((item) => item.productId === productId)
  );

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    userId: req.user!.id,
    userName: req.user!.name || 'Verified Buyer',
    userAvatar: req.user!.avatar,
    rating: ratingNum,
    title: title.trim(),
    comment: comment.trim(),
    isVerifiedPurchase: hasPurchased,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    d.reviews.push(newReview);

    // Recalculate product rating
    const allProdReviews = d.reviews.filter((r) => r.productId === productId);
    const avgRating = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;

    const p = d.products.find((item) => item.id === productId);
    if (p) {
      p.rating = parseFloat(avgRating.toFixed(2));
      p.reviewCount = allProdReviews.length;
    }
  });

  res.status(201).json({
    message: 'Your review has been submitted successfully.',
    review: newReview,
  });
});

// Upvote review helpfulness
router.post('/:id/helpful', (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedReview = db.mutate((d) => {
    const rev = d.reviews.find((r) => r.id === id);
    if (rev) {
      rev.helpfulCount += 1;
    }
    return rev;
  });

  if (!updatedReview) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  res.json({ message: 'Marked as helpful.', helpfulCount: updatedReview.helpfulCount });
});

export default router;
