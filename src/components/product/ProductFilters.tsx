import React from 'react';
import { Filter, X, Check, Star } from 'lucide-react';
import { Category, Brand, SubCategory, ProductFacets } from '../../types';

export interface FilterState {
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  deal?: boolean;
  bestSeller?: boolean;
  sort?: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  subCategories?: SubCategory[];
  facets?: ProductFacets;
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  subCategories = [],
  facets,
  filters,
  onChange,
  onReset,
}) => {
  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== false && v !== '' && v !== 'all' && v !== 'newest'
  ).length;

  // Selected category object
  const activeCat = categories.find((c) => c.slug === filters.category || c.id === filters.category);
  const relevantSubs = activeCat
    ? subCategories.filter((s) => s.categoryId === activeCat.id)
    : subCategories;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h3>
          {activeCount > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ category: undefined, subCategory: undefined })}
            className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
              !filters.category
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug || filters.category === cat.id;
            const facetCount = facets?.categories.find((f) => f.id === cat.id || f.slug === cat.slug)?.count;
            const displayCount = facetCount !== undefined ? facetCount : cat.productCount;
            return (
              <button
                key={cat.id}
                onClick={() => onChange({ category: cat.slug, subCategory: undefined })}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate text-left">{cat.name}</span>
                {displayCount !== undefined && (
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({displayCount})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories (shown when category is selected or available) */}
      {relevantSubs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Subcategory
            </h4>
            {filters.subCategory && (
              <button
                onClick={() => onChange({ subCategory: undefined })}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {relevantSubs.map((sub) => {
              const isSelected = filters.subCategory === sub.slug || filters.subCategory === sub.id;
              const facetCount = facets?.subCategories.find((f) => f.id === sub.id || f.slug === sub.slug)?.count;
              return (
                <button
                  key={sub.id}
                  onClick={() => onChange({ subCategory: isSelected ? undefined : sub.slug })}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate text-left">{sub.name}</span>
                  {facetCount !== undefined && (
                    <span className="text-[10px] text-slate-400 font-normal ml-1">({facetCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ brand: undefined })}
            className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
              !filters.brand
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Brands</span>
          </button>
          {brands.map((b) => {
            const isSelected = filters.brand === b.slug || filters.brand === b.id;
            const facetCount = facets?.brands.find((f) => f.id === b.id || f.slug === b.slug)?.count;
            const displayCount = facetCount !== undefined ? facetCount : b.productCount;
            return (
              <button
                key={b.id}
                onClick={() => onChange({ brand: b.slug })}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="truncate text-left">{b.name}</span>
                {displayCount !== undefined && (
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({displayCount})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Price Range ($)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400">Min ($)</label>
            <input
              type="number"
              min={0}
              value={filters.minPrice || ''}
              onChange={(e) =>
                onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder={facets ? String(Math.floor(facets.priceRange.min)) : '0'}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">Max ($)</label>
            <input
              type="number"
              min={0}
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder={facets ? String(Math.ceil(facets.priceRange.max)) : '1500'}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((star) => (
            <button
              key={star}
              onClick={() =>
                onChange({ minRating: filters.minRating === star ? undefined : star })
              }
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                filters.minRating === star
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{star} Stars & Above</span>
              </div>
              {filters.minRating === star && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles: In Stock & Deals */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            In Stock Only {facets?.inStockCount !== undefined && <span className="text-slate-400 font-normal">({facets.inStockCount})</span>}
          </span>
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked ? true : undefined })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Deals & Discounts {facets?.dealCount !== undefined && <span className="text-slate-400 font-normal">({facets.dealCount})</span>}
          </span>
          <input
            type="checkbox"
            checked={!!filters.deal}
            onChange={(e) => onChange({ deal: e.target.checked ? true : undefined })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Best Sellers {facets?.bestSellerCount !== undefined && <span className="text-slate-400 font-normal">({facets.bestSellerCount})</span>}
          </span>
          <input
            type="checkbox"
            checked={!!filters.bestSeller}
            onChange={(e) => onChange({ bestSeller: e.target.checked ? true : undefined })}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
        </label>
      </div>
    </div>
  );
};

