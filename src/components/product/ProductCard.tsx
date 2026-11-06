import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { StarRating } from '../common/StarRating';
import { ProductImage } from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, param?: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, product.variants[0]?.id, 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Media Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          title={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isDeal && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
              <Zap className="w-2.5 h-2.5 fill-white" />
              Deal
            </span>
          )}
          {product.isBestSeller && !product.discountPercentage && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Button Hover Overlay */}
        {onQuickView && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 hover:text-indigo-600 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="uppercase tracking-wider font-semibold">{product.sku}</span>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} showNumber />
          </div>

          <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              {isOutOfStock ? (
                <span className="text-rose-500 font-semibold">Out of Stock</span>
              ) : product.stock <= product.lowStockThreshold ? (
                <span className="text-amber-500 font-semibold">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-500">In Stock</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white transition-all duration-200 disabled:opacity-30 disabled:hover:bg-indigo-50 shadow-sm"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
