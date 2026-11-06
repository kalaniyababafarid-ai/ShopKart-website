import React, { useState } from 'react';
import {
  ShoppingBag,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useNotification();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await api.support.subscribeNewsletter(email);
      setIsSubscribed(true);
      showToast(res.message, 'success');
      setEmail('');
    } catch (err: any) {
      showToast(err.message || 'Subscription failed.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Fast Insured Shipping</h4>
              <p className="text-xs text-slate-400 mt-0.5">Free delivery on all orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Genuine Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">Directly sourced official brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">30-day replacement & refund window</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">24/7 Expert Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Dedicated concierge desk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Story */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                SHOP<span className="text-indigo-400">KART</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Shopkart is a premier full-stack global commerce destination bringing together flagship electronics, designer streetwear, precision audio, and smart living innovations.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Join Shopkart Insider VIP
              </p>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You're subscribed! Use promo coupon <strong>WELCOME10</strong> on checkout.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for 10% off..."
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Shop Categories</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('shop', 'category=electronics-audio')} className="hover:text-white transition-colors">
                  Electronics & Audio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=fashion-apparel')} className="hover:text-white transition-colors">
                  Fashion & Streetwear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=home-living')} className="hover:text-white transition-colors">
                  Home & Living
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=smart-accessories')} className="hover:text-white transition-colors">
                  Smart Accessories & Peripherals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'deal=true')} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Weekly Flash Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('account', 'orders')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Concierge Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'returns')} className="hover:text-white transition-colors">
                  Returns & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'shipping')} className="hover:text-white transition-colors">
                  Shipping & Delivery Rates
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Company & Legal</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Shopkart
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                  Journal & Buying Guides
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', 'terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Admin Operations Portal
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 Shopkart Marketplace Inc. All rights reserved. Crafted with precision for global shoppers.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 text-xs">
            <CreditCard className="w-4 h-4 text-slate-400" />
            256-Bit SSL Encrypted Payments: UPI, Cards, NetBanking, COD
          </span>
        </div>
      </div>
    </footer>
  );
};
