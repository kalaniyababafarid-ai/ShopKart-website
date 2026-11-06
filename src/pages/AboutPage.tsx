import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Globe2, Award, Users } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Our Brand Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
          Redefining Modern Commerce with Unrivaled Quality
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Founded on the uncompromising pursuit of design elegance, authentic engineering, and frictionless shopping, Shopkart connects discerning consumers directly to flagship electronics, designer outerwear, and ergonomic home essentials.
        </p>
      </div>

      {/* Image Banner */}
      <div className="aspect-video sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="Shopkart Global Headquarters"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pillar Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Authenticity Guaranteed
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every item catalogued on Shopkart is verified through direct brand licensing and authorized distributor manifests. Zero counterfeits, 100% genuine.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Rapid Global Logistics
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            With climate-controlled fulfillment centers in Seattle, Frankfurt, and Singapore, orders are packaged securely and dispatched within hours.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            30-Day Total Satisfaction
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If you are not completely satisfied with your purchase, our 1-click return and instant replacement policy ensures a zero-stress shopping experience.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white text-center space-y-4">
        <h2 className="text-2xl font-black font-heading">Ready to Experience Premier Commerce?</h2>
        <p className="text-xs text-indigo-200 max-w-md mx-auto">
          Discover why over 100,000 customers trust Shopkart for their daily tech, fashion, and lifestyle needs.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold px-8 py-3.5 rounded-full transition-colors shadow-lg"
        >
          Explore Shopkart Collection
        </button>
      </div>
    </div>
  );
};
