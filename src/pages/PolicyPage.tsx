import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

interface PolicyPageProps {
  initialSection?: string;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ initialSection = 'shipping' }) => {
  const [section, setSection] = useState<'shipping' | 'returns' | 'privacy' | 'terms'>('shipping');

  useEffect(() => {
    if (['shipping', 'returns', 'privacy', 'terms'].includes(initialSection)) {
      setSection(initialSection as any);
    }
  }, [initialSection]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Policy Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold overflow-x-auto pb-2">
        {[
          { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
          { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
          { id: 'privacy', label: 'Privacy & Data Protection', icon: Lock },
          { id: 'terms', label: 'Terms of Service', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = section === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-3 border-b-2 font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Policy Details */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6">
        {section === 'shipping' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading mb-4">
              Shopkart Global Shipping & Fulfillment Policy
            </h2>
            <p>
              Shopkart operates modern climate-controlled fulfillment centers across North America, Europe, and Asia. All orders are processed, quality-inspected, and dispatched within 24 hours of payment authorization.
            </p>
            <h3 className="font-bold text-slate-900 dark:text-white mt-4">1. Shipping Speeds & Rates</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Standard Insured Delivery:</strong> 3-5 business days. Free for orders over $50.00 (otherwise $5.99).</li>
              <li><strong>Priority Air Express Courier (FedEx/UPS):</strong> 1-2 business days guaranteed ($14.99).</li>
            </ul>
            <h3 className="font-bold text-slate-900 dark:text-white mt-4">2. Tamper-Evident Packaging</h3>
            <p>
              High-value consumer electronics, smartphones, and audio gear are shipped in sealed tamper-evident containers with individual serial number verification.
            </p>
          </div>
        )}

        {section === 'returns' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading mb-4">
              30-Day Money-Back Guarantee & Return Policy
            </h2>
            <p>
              We want you to be 100% delighted with your purchase. If you are not satisfied for any reason, you may request a return or direct product replacement within 30 calendar days of delivery.
            </p>
            <h3 className="font-bold text-slate-900 dark:text-white mt-4">1. Return Eligibility Criteria</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Items must include original manufacturer packaging, tags, and all enclosed accessories.</li>
              <li>Defective, transit-damaged, or incorrect items qualify for immediate courier pickup and free return shipping.</li>
            </ul>
            <h3 className="font-bold text-slate-900 dark:text-white mt-4">2. Refund Processing</h3>
            <p>
              Refunds are initiated immediately upon warehouse inspection and restored to your original payment method (Cards, UPI, or Bank account) within 2-4 business days.
            </p>
          </div>
        )}

        {section === 'privacy' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading mb-4">
              Privacy & Personal Data Security
            </h2>
            <p>
              Your privacy is fundamental to our architecture. We enforce industry-standard 256-bit encryption for all customer data and password hashing algorithms (bcrypt).
            </p>
            <h3 className="font-bold text-slate-900 dark:text-white mt-4">1. Information We Collect</h3>
            <p>
              We collect information necessary to fulfill and dispatch your orders: name, shipping address, email, contact telephone, and encrypted session identifiers. We never sell your personal data to third-party ad brokers.
            </p>
          </div>
        )}

        {section === 'terms' && (
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading mb-4">
              Terms of Commercial Service
            </h2>
            <p>
              By accessing or purchasing through the Shopkart platform, you agree to these binding commercial terms. All prices are listed in USD and include all applicable platform taxes and warranties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
