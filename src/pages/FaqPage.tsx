import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Package, ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: 'Orders & Shipping',
    q: 'How long does standard delivery take, and is it free?',
    a: 'Standard courier delivery typically arrives within 3-4 business days. All orders exceeding $50.00 qualify automatically for 100% free delivery across all supported regions.',
  },
  {
    category: 'Orders & Shipping',
    q: 'How do I track my order once it has dispatched?',
    a: 'Once your order is packed and dispatched from our fulfillment center, you will receive an automated tracking code and link in your email. You can also view live tracking milestones directly under My Account > Orders.',
  },
  {
    category: 'Returns & Refunds',
    q: 'What is the Shopkart 30-Day Money-Back Guarantee?',
    a: 'We offer an unconditional 30-day return window on all eligible items. If you are not completely thrilled with your purchase, you can submit a return request from your account for a full refund or direct replacement unit with free return courier pickup.',
  },
  {
    category: 'Returns & Refunds',
    q: 'How quickly are refunds credited to my original payment source?',
    a: 'Once your returned package is scanned and inspected at our fulfillment hub, refunds are authorized within 24 hours. Depending on your financial institution or UPI provider, funds appear on your statement in 2-4 business days.',
  },
  {
    category: 'Payments & Security',
    q: 'Which payment methods are accepted on Shopkart?',
    a: 'We support all major Credit/Debit Cards (Visa, MasterCard, American Express), Instant UPI / QR payment authorization, Net Banking with leading national & international banks, and Cash on Delivery (COD).',
  },
  {
    category: 'Payments & Security',
    q: 'Are my payment credentials and transactions secure?',
    a: 'Yes. All payments on Shopkart are protected by bank-grade 256-bit SSL encryption. We never store raw card numbers or CVV credentials on our servers.',
  },
  {
    category: 'Warranty & Authenticity',
    q: 'Are products 100% genuine with official manufacturer warranty?',
    a: 'Every product catalogued on Shopkart is sourced directly through brand authorizations and verified distributor manifests. Your itemized invoice acts as valid proof of purchase for manufacturer service centers worldwide.',
  },
];

export const FaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Orders & Shipping', 'Returns & Refunds', 'Payments & Security', 'Warranty & Authenticity'];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Knowledge Base & Support
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Instant answers to commonly asked questions about courier transit, returns, warranty, and payment methods.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question, keyword, or policy..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 shadow-sm"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  <p>{faq.a}</p>
                  <span className="inline-block mt-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                    {faq.category}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
