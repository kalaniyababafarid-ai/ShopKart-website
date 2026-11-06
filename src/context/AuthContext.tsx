import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Address } from '../types';
import { api, getAuthToken, setAuthToken, getCartSessionToken } from '../services/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot-password';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot-password'>('login');
  const { showToast } = useNotification();

  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.auth.getProfile();
      setUser(data.user);
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setAuthToken(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      setIsAuthModalOpen(false);

      // Merge guest cart
      const guestToken = getCartSessionToken();
      if (guestToken) {
        api.cart.mergeGuestCart(guestToken).catch(() => {});
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({ name, email, password, phone });
      setAuthToken(res.token);
      setUser(res.user);
      showToast(`Account created successfully! Welcome to Shopkart, ${res.user.name}.`, 'success');
      setIsAuthModalOpen(false);

      const guestToken = getCartSessionToken();
      if (guestToken) {
        api.cart.mergeGuestCart(guestToken).catch(() => {});
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    try {
      const res = await api.auth.updateProfile(data);
      setUser(res.user);
      showToast('Profile updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not update profile.', 'error');
      throw err;
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const res = await api.auth.addAddress(address);
      if (user) {
        setUser({ ...user, addresses: res.addresses });
      }
      showToast('Address added to your address book.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not add address.', 'error');
      throw err;
    }
  };

  const updateAddress = async (id: string, address: Partial<Address>) => {
    try {
      const res = await api.auth.updateAddress(id, address);
      if (user) {
        setUser({ ...user, addresses: res.addresses });
      }
      showToast('Address updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not update address.', 'error');
      throw err;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await api.auth.deleteAddress(id);
      if (user) {
        setUser({ ...user, addresses: res.addresses });
      }
      showToast('Address deleted.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not delete address.', 'error');
      throw err;
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const res = await api.auth.setDefaultAddress(id);
      if (user) {
        setUser({ ...user, addresses: res.addresses });
      }
      showToast('Default delivery address updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not set default address.', 'error');
      throw err;
    }
  };

  const openAuthModal = (tab: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        refreshUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
