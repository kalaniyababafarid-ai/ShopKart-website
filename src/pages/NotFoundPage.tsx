import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-black">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested page or product URL does not exist or has been relocated to another department.
        </p>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('home')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-md shadow-indigo-600/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-6 py-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Browse Catalog
        </button>
      </div>
    </div>
  );
};
