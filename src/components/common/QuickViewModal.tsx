import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { StarRating } from './StarRating';
import { getProductFallbackSvg } from '../../utils/imageFallback';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (page: string, param?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAt = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, selectedVariant?.id, quantity);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-white shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getProductFallbackSvg(product.title, product.categoryId, product.brandId);
                }}
              />
              {product.discountPercentage && (
                <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Save {product.discountPercentage}%
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === idx
                        ? 'border-indigo-600 scale-95'
                        : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
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

          {/* Details Side */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <span>SKU: {product.sku}</span>
                  <span>•</span>
                  <span className={isOutOfStock ? 'text-rose-500' : 'text-emerald-500'}>
                    {isOutOfStock ? 'Out of Stock' : `In Stock (${currentStock} left)`}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {product.title}
                </h3>

                <div className="mt-2 flex items-center gap-3">
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} showNumber />
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                {currentCompareAt && (
                  <span className="text-sm text-slate-400 line-through">
                    ${currentCompareAt.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* Variants Selector */}
              {product.variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isInWishlist(product.id)
                      ? 'border-rose-200 bg-rose-50 text-rose-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('product', product.slug);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
              >
                <span>View Full Specifications & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
