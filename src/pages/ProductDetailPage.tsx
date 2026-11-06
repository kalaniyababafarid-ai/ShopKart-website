import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Plus,
  Minus,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, ProductVariant, Review, Category, Brand } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getProductFallbackSvg } from '../utils/imageFallback';
import { StarRating } from '../components/common/StarRating';
import { ProductCard } from '../components/product/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Interaction states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'shipping'>('desc');
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);

  // Review submission form state
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.products
      .getDetail(slug)
      .then((res) => {
        setProduct(res.product);
        setCategory(res.category || null);
        setBrand(res.brand || null);
        setRelated(res.related);
        setReviews(res.reviews);
        setRatingDistribution(res.ratingDistribution);
        if (res.product.variants && res.product.variants.length > 0) {
          setSelectedVariant(res.product.variants[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Product not found.', 'error');
        onNavigate('shop');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading product specifications...</p>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAt = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (buyNow: boolean = false) => {
    if (isOutOfStock) return;
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      if (buyNow) {
        onNavigate('checkout');
      }
    } catch {
      // Notification handled in context
    }
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length < 4) {
      showToast('Please enter a valid postal code.', 'warning');
      return;
    }
    const days = Math.floor(Math.random() * 2) + 2;
    const date = new Date(Date.now() + 86400000 * days);
    setDeliveryEstimate(`Express Delivery Guaranteed by ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}.`);
    showToast('Delivery available for this postal code!', 'success');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to leave a verified review.', 'info');
      openAuthModal('login');
      return;
    }

    if (!newReviewTitle.trim() || !newReviewComment.trim()) {
      showToast('Please fill in both review title and comments.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.reviews.submit(product.id, {
        rating: newReviewRating,
        title: newReviewTitle.trim(),
        comment: newReviewComment.trim(),
      });
      setReviews([res.review, ...reviews]);
      showToast('Thank you! Your verified review has been posted.', 'success');
      setNewReviewTitle('');
      setNewReviewComment('');
    } catch (err: any) {
      showToast(err.message || 'Could not post review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const res = await api.reviews.markHelpful(reviewId);
      setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r)));
      showToast('Thanks for your feedback!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-700 dark:hover:text-slate-200">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-slate-700 dark:hover:text-slate-200">
          Shop
        </button>
        {category && (
          <>
            <span>/</span>
            <button
              onClick={() => onNavigate('shop', `category=${category.slug}`)}
              className="hover:text-indigo-600"
            >
              {category.name}
            </button>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getProductFallbackSvg(product.title, product.categoryId, product.brandId);
              }}
            />
            {product.discountPercentage && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-95'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getProductFallbackSvg(product.title, product.categoryId, product.brandId);
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Bar */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              {brand && (
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                  {brand.name}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 leading-tight font-heading">
              {product.title}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} showNumber />
              <span>•</span>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewCount} Verified Customer Reviews
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              ${currentPrice.toFixed(2)}
            </span>
            {currentCompareAt && (
              <span className="text-base text-slate-400 line-through">
                ${currentCompareAt.toFixed(2)}
              </span>
            )}
            {product.discountPercentage && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Save ${(currentCompareAt! - currentPrice).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                <span>Select Configuration:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{selectedVariant?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`text-xs px-4 py-2.5 rounded-xl border font-semibold transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-600/30'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {v.name} - ${v.price.toFixed(2)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock & Quantity Stepper */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Quantity</span>
              <span
                className={`font-semibold ${
                  isOutOfStock ? 'text-rose-500' : currentStock <= 5 ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : currentStock <= 5
                  ? `Only ${currentStock} units remaining!`
                  : `In Stock (${currentStock} available)`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock}
                  className="p-3 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  Buy Now
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'border-rose-200 bg-rose-50 text-rose-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Postal Code Delivery Checker */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Check Delivery Availability</span>
            </div>
            <form onSubmit={handleCheckDelivery} className="flex gap-2">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 5-digit ZIP / Postal code"
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Check
              </button>
            </form>
            {deliveryEstimate && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                <Check className="w-4 h-4" />
                <span>{deliveryEstimate}</span>
              </p>
            )}
          </div>

          {/* Value Perks */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-slate-500">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Original Gear</span>
              <span className="text-[10px]">100% Guaranteed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Free Courier</span>
              <span className="text-[10px]">On orders &gt; $50</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Easy Returns</span>
              <span className="text-[10px]">30 Days Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews, Shipping */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'desc'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Product Overview
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'specs'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Technical Specifications
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 transition-colors relative ${
              activeTab === 'shipping'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Shipping & Return Guarantee
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="py-6">
          {activeTab === 'desc' && (
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
              <p>{product.description}</p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex py-3 px-5">
                  <span className="w-1/3 font-bold text-slate-500 dark:text-slate-400">{key}</span>
                  <span className="w-2/3 font-semibold text-slate-900 dark:text-white">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Ratings Overview Bar */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:border-r border-slate-200 dark:border-slate-700">
                  <div className="text-4xl font-black text-slate-900 dark:text-white font-heading">
                    {product.rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center my-1.5">
                    <StarRating rating={product.rating} size="md" />
                  </div>
                  <p className="text-xs text-slate-500">Based on {reviews.length} reviews</p>
                </div>

                {/* Star bars */}
                <div className="space-y-1.5 md:col-span-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDistribution[star] || 0;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-slate-600 dark:text-slate-400 font-semibold">
                          {star} Stars
                        </span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400 font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="p-6 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Write a Verified Customer Review
                </h4>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Rating (1 to 5 Stars)
                    </label>
                    <StarRating
                      rating={newReviewRating}
                      interactive
                      size="md"
                      onChange={setNewReviewRating}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="e.g. Unbelievable battery life and sound stage!"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Review Comments
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Tell other shoppers about your real-world experience, comfort, and build quality..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {rev.userName}
                            </span>
                            {rev.isVerifiedPurchase && (
                              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <StarRating rating={rev.rating} size="sm" />
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{rev.title}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                      <button
                        onClick={() => handleHelpfulVote(rev.id)}
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <h4 className="font-bold text-slate-900 dark:text-white text-base font-heading">
                Shopkart Shipping Policy & Return Process
              </h4>
              <p>
                All orders are dispatched from our automated climate-controlled regional fulfilment centers. Orders placed before 3:00 PM EST ship same day.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Free Standard Delivery for all cart values above $50.00</li>
                <li>Express Insured Courier arrives in 1-2 business days with real-time tracking</li>
                <li>Tamper-evident anti-theft protective packaging for all high-value electronics</li>
                <li>Full 30-day money-back guarantee with zero restocking deductions</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Recommended For You
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading">
                Similar Products in this Category
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
