import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  LogOut,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Category, Product } from '../../types';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { totalItemsCount, subtotal, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.support.getCategories().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      api.products
        .list({ q: searchQuery.trim(), limit: 5 })
        .then((res) => {
          setSearchResults(res.products);
          setShowSearchDropdown(true);
        })
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      onNavigate('shop', `q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top promotional announcement banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white text-xs py-2 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
              Special Offer
            </span>
            <span>
              Use coupon <strong className="text-amber-300 font-mono tracking-wider">WELCOME10</strong> for 10% off your entire order!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-indigo-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Genuine Brands
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Free Shipping Over $50
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
                  SHOP<span className="text-indigo-600 dark:text-indigo-400">KART</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-600 dark:text-slate-400 -mt-1">
                  Premier Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Search bar with live suggestions dropdown */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
                placeholder="Search premium electronics, headphones, shoes, gadgets..."
                className="w-full pl-11 pr-24 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 dark:focus:ring-indigo-500 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Live Autocomplete Results */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Search Suggestions</span>
                  {isSearching && <span className="animate-pulse text-indigo-600">Searching...</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          onNavigate('product', product.slug);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-indigo-50/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-2.5 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No products matching "{searchQuery}" found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons: Theme, Wishlist, User, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <NotificationBell onNavigate={onNavigate} />

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('account', 'wishlist');
                } else {
                  openAuthModal('login');
                }
              }}
              className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-scale">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('account', 'orders');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders & Tracking
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('account', 'profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('account', 'wishlist');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      Wishlist ({wishlistCount})
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white pl-3.5 pr-4 py-2 rounded-full shadow-md shadow-indigo-600/20 transition-all transform active:scale-95"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-indigo-950 rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                ${subtotal.toFixed(2)}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <div className="hidden lg:flex items-center justify-between border-t border-slate-100 dark:border-slate-800 py-2.5 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('shop')}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                currentPage === 'shop' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              All Products
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('shop', `category=${cat.slug}`)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => onNavigate('shop', 'deal=true')}
              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-bold"
            >
              <Tag className="w-3.5 h-3.5" />
              Flash Deals
            </button>

            <button
              onClick={() => onNavigate('blog')}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                currentPage === 'blog' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Stories & Guides
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-normal">
            <button onClick={() => onNavigate('blog')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Journal
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('faq')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Help Center & FAQ
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              24/7 Concierge Support
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1 text-sm font-semibold">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('home');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('shop');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Shop All Products
            </button>

            <div className="pt-2 pb-1 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Browse Categories
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('shop', `category=${cat.slug}`);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                {cat.name}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('about');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-500"
              >
                About Shopkart
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-500"
              >
                Contact Support
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('faq');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-500"
              >
                FAQ & Shipping Policies
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
