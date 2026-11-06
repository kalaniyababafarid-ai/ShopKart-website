import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    totalItemsCount,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    appliedCoupon,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 50.0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Shopping Cart ({totalItemsCount})
              </h3>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Add ${remainingForFreeShipping.toFixed(2)} more for FREE Delivery!
                  </span>
                  <span>{freeShippingPercent}%</span>
                </div>
                <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>You unlocked FREE Standard Shipping!</span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Explore our curated collection of flagship gadgets, fashion, and lifestyle essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    onNavigate('shop');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-4 flex gap-3.5 group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      {item.attributes && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.attributes).map(
                            ([key, val]) =>
                              val && (
                                <span
                                  key={key}
                                  className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium"
                                >
                                  {val}
                                </span>
                              )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2.5 text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400">
                            ${item.price.toFixed(2)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> (-${appliedCoupon.discount.toFixed(2)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-rose-500 p-0.5 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    closeDrawer();
                    onNavigate('checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      closeDrawer();
                      onNavigate('cart');
                    }}
                    className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    View Full Cart
                  </button>
                  <button
                    onClick={clearCart}
                    className="py-2 px-3 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
