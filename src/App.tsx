import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { AuthModal } from './components/common/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PolicyPage } from './pages/PolicyPage';
import { BlogPage } from './pages/BlogPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function ShopkartApp() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string>('');

  // Handle URL hash changes for easy bookmarking and browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [route, ...rest] = hash.split('/');
      const param = rest.join('/');
      setCurrentPage(route || 'home');
      setPageParam(param || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial parse
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string, param: string = '') => {
    setCurrentPage(page);
    setPageParam(param);
    window.location.hash = param ? `${page}/${param}` : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'shop':
        return <ShopPage onNavigate={navigateTo} initialParams={pageParam} />;
      case 'product':
        return <ProductDetailPage slug={pageParam || 'sony-wh-1000xm5-wireless-headphones'} onNavigate={navigateTo} />;
      case 'cart':
        return <CartPage onNavigate={navigateTo} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigateTo} />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={pageParam} onNavigate={navigateTo} />;
      case 'account':
        return <AccountPage initialTab={pageParam || 'orders'} onNavigate={navigateTo} />;
      case 'admin':
        return <AdminPage onNavigate={navigateTo} />;
      case 'about':
        return <AboutPage onNavigate={navigateTo} />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FaqPage />;
      case 'policy':
        return <PolicyPage initialSection={pageParam || 'shipping'} />;
      case 'blog':
        return <BlogPage initialSlug={pageParam} onNavigate={navigateTo} />;
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      <Header onNavigate={navigateTo} currentPage={currentPage} />

      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer onNavigate={navigateTo} />

      {/* Global Modals & Drawers */}
      <CartDrawer onNavigate={navigateTo} />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ShopkartApp />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
