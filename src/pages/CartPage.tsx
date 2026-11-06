import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { getProductFallbackSvg } from '../utils/imageFallback';

interface CartPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    totalItemsCount,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { showToast } = useNotification();

  const freeShippingThreshold = 50.0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyQuickCoupon = async (code: string) => {
    try {
      await applyCoupon(code);
    } catch {
      // Handled
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our wide range of premium electronics, lifestyle accessories, and apparel today.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-8 py-3 rounded-full shadow-lg shadow-indigo-600/25 transition-all"
        >
          Explore Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
            Shopping Cart ({totalItemsCount} items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your selections and apply available promo discounts</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Cart Items</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        {remainingForFreeShipping > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Add ${remainingForFreeShipping.toFixed(2)} more to qualify for FREE Standard Delivery!
              </span>
              <span>{freeShippingPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Congratulations! You qualify for FREE Insured Standard Delivery.</span>
          </div>
        )}
      </div>

      {/* 2-Column Layout: Items Table vs Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 divide-y divide-slate-100 dark:divide-slate-700/60 shadow-sm">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getProductFallbackSvg(item.title);
                  }}
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.attributes && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {Object.entries(item.attributes).map(
                              ([k, v]) =>
                                v && (
                                  <span
                                    key={k}
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded"
                                  >
                                    {v}
                                  </span>
                                )
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping Catalog</span>
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Apply Coupon or Promo Code
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon.code} (-${appliedCoupon.discount.toFixed(2)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-500 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Quick coupons pills */}
              {!appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Try:</span>
                  <button
                    onClick={() => handleApplyQuickCoupon('WELCOME10')}
                    className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800"
                  >
                    WELCOME10 (10% OFF)
                  </button>
                  <button
                    onClick={() => handleApplyQuickCoupon('FLAT50')}
                    className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800"
                  >
                    FLAT50 ($50 OFF)
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cart Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Savings</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Insured Courier Shipping</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-4 border-t border-slate-200 dark:border-slate-700">
                <span>Final Total</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-heading">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SSL Encrypted Checkout • Money-Back Guarantee</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
