import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Tag,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, Brand, SiteBanner } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flash deal countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.support.getSiteInfo().then((res) => setBanners(res.banners)).catch(() => {});
    api.support.getCategories().then((res) => setCategories(res.categories)).catch(() => {});
    api.support.getBrands().then((res) => setBrands(res.brands)).catch(() => {});

    api.products.list({ deal: true, limit: 4 }).then((res) => setDeals(res.products)).catch(() => {});
    api.products.list({ featured: true, limit: 8 }).then((res) => setFeatured(res.products)).catch(() => {});
    api.products.list({ bestSeller: true, limit: 4 }).then((res) => setBestSellers(res.products)).catch(() => {});
  }, []);

  // Carousel autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Carousel */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl min-h-[460px] md:min-h-[520px] flex items-center">
          {banners.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background with gradient overlay */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-105 filter brightness-75 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

              {/* Slide Content */}
              <div className="relative z-20 h-full flex flex-col justify-center max-w-2xl px-8 sm:px-16 py-12 space-y-5 text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600/90 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                    {slide.tag}
                  </span>
                  {slide.badge && (
                    <span className="bg-amber-500/90 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      {slide.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-heading">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-lg">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <button
                    onClick={() => onNavigate('shop', 'deal=true')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-full shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('shop')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full transition-colors"
                  >
                    Browse Full Catalog
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Arrows */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('shop', `category=${cat.slug}`)}
              className="group text-left bg-white dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 relative mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  {cat.productCount || 0} Products
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                {cat.name}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Deals with Live Countdown */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 border border-amber-500/20 dark:border-amber-500/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-slate-950" />
                    Limited Time Offer
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Up to 25% Off
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
                  Flash Deals of the Day
                </h2>
              </div>

              {/* Countdown Clocks */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                  Offers Expire in:
                </span>
                <div className="flex gap-1.5 font-mono text-xs font-black">
                  <span className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-2.5 py-1.5 rounded-lg shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-slate-400 py-1">:</span>
                  <span className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-2.5 py-1.5 rounded-lg shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-slate-400 py-1">:</span>
                  <span className="bg-rose-600 text-white px-2.5 py-1.5 rounded-lg shadow-sm animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onNavigate}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Curated Showcase
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
              Featured Flagships
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'featured=true')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* Promo Banner: Audio & Studio Gear */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 sm:p-14 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Acoustic Innovation
            </span>
            <h3 className="text-3xl font-black font-heading leading-tight">
              Spatial Acoustics. <br />Pure Silence.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Equipped with studio-grade LDAC codecs, dual noise sensor microphones, and tailored ergonomic fit for endless music and seamless calls.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('product', 'sony-wh-1000xm5-wireless-headphones')}
                className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
              >
                <span>Discover Sony Flagship</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 lg:h-full relative overflow-hidden bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&q=80"
              alt="Studio Audio"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Customer Favorites
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
              Best Selling Gear
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'bestSeller=true')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>See More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      {/* Brand Partners Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Authorized Official Distributors
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Partnered With World-Class Brands
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 items-center">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onNavigate('shop', `brand=${b.slug}`)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center p-2">
                <img src={b.logo} alt={b.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Verified Customer Feedback
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-heading">
            Loved by Thousands Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The delivery was insanely fast! Ordered my MacBook Pro and it arrived in sealed mint condition within 24 hours. Shopkart customer service is truly top tier."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                MC
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Marcus Chen</p>
                <p className="text-[10px] text-slate-400">Software Architect, Seattle</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The returns process is seamless. I accidentally ordered the wrong headphone color and their support team dispatched the replacement right away with zero friction."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                ER
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Elena Rostova</p>
                <p className="text-[10px] text-slate-400">Creative Producer, NYC</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The coupon engine and live tracking are super crisp. Got $50 off with their promo code and tracked the carrier directly to my porch. 10/10 recommended."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                DJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">David Johnson</p>
                <p className="text-[10px] text-slate-400">Verified Buyer, Austin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
