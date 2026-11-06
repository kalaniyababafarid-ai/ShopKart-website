import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart, CartItem, Coupon } from '../types';
import { api } from '../services/api';
import { useNotification } from './NotificationContext';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  appliedCoupon: { code: string; discount: number; description?: string } | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { showToast } = useNotification();

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.cart.get();
      setCart(res.cart);
    } catch (e) {
      console.error('Failed to load cart:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = cart?.items || [];
  const totalItemsCount = cart?.totalItemsCount || items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart?.subtotal || items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Recalculate coupon discount if cart total changes
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const freeShippingThreshold = 50.0;
  const shippingFee = subtotal > 0 && subtotal >= freeShippingThreshold ? 0 : subtotal > 0 ? 5.99 : 0;
  const taxRate = 0.08;
  const taxable = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxable * taxRate).toFixed(2));
  const total = parseFloat((taxable + shippingFee + tax).toFixed(2));

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    try {
      const res = await api.cart.addItem({ productId, variantId, quantity });
      setCart(res.cart);
      showToast(res.message || 'Item added to your cart.', 'success');
      setIsDrawerOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Could not add item to cart.', 'error');
      throw err;
    }
  };

  const updateQuantity = async (productId: string, variantId: string | undefined, quantity: number) => {
    try {
      const res = await api.cart.updateQuantity({ productId, variantId, quantity });
      setCart(res.cart);
    } catch (err: any) {
      showToast(err.message || 'Could not update quantity.', 'error');
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    try {
      const res = await api.cart.removeItem(productId, variantId);
      setCart(res.cart);
      showToast('Item removed from cart.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.cart.clear();
      setCart(res.cart);
      setAppliedCoupon(null);
      showToast('Cart cleared.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not clear cart.', 'error');
    }
  };

  const applyCoupon = async (code: string) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code.', 'warning');
      return;
    }
    try {
      const res = await api.coupons.validate(code, subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount: res.discount,
          description: res.description,
        });
        showToast(`Promo code '${res.code}' applied: saved $${res.discount.toFixed(2)}!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid coupon code.', 'error');
      throw err;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalItemsCount,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        appliedCoupon,
        isLoading,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
