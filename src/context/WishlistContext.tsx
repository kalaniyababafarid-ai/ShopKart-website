import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.wishlist.get();
      setWishlist(res.wishlist);
    } catch {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const wishlistIds = new Set(wishlist.map((p) => p.id));

  const isInWishlist = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      showToast('Please sign in to save items to your wishlist.', 'info');
      openAuthModal('login');
      return;
    }

    try {
      const res = await api.wishlist.toggle(product.id);
      if (res.isInWishlist) {
        setWishlist((prev) => [...prev, product]);
        showToast(`Saved "${product.title}" to wishlist.`, 'success');
      } else {
        setWishlist((prev) => prev.filter((p) => p.id !== product.id));
        showToast(`Removed "${product.title}" from wishlist.`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update wishlist.', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        count: wishlist.length,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
