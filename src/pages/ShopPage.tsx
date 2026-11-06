import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, Brand, SubCategory, ProductFacets } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilters, FilterState } from '../components/product/ProductFilters';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { getProductFallbackSvg } from '../utils/imageFallback';

interface ShopPageProps {
  onNavigate: (page: string, param?: string) => void;
  initialParams?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, initialParams = '' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [facets, setFacets] = useState<ProductFacets | undefined>(undefined);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Parse initial query params from prop
  const parseParams = (paramStr: string): FilterState => {
    const params = new URLSearchParams(paramStr);
    return {
      category: params.get('category') || undefined,
      subCategory: params.get('subCategory') || undefined,
      brand: params.get('brand') || undefined,
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
      inStock: params.get('inStock') === 'true',
      deal: params.get('deal') === 'true',
      bestSeller: params.get('bestSeller') === 'true',
      sort: params.get('sort') || 'newest',
    };
  };

  const [filters, setFilters] = useState<FilterState>(() => parseParams(initialParams));
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(initialParams);
    return params.get('q') || '';
  });

  // Load categories, subcategories & brands metadata
  useEffect(() => {
    api.support
      .getCategories()
      .then((res) => {
        setCategories(res.categories);
        const subs = res.categories.flatMap((c: any) => c.subCategories || []);
        if (subs.length > 0) setSubCategories(subs);
      })
      .catch(() => {});

    api.support
      .getSubCategories()
      .then((res) => {
        if (res.subCategories?.length) {
          setSubCategories(res.subCategories);
        }
      })
      .catch(() => {});

    api.support.getBrands().then((res) => setBrands(res.brands)).catch(() => {});
  }, []);

  // Update when initialParams changes (e.g. from header search or category click)
  useEffect(() => {
    if (initialParams) {
      setFilters(parseParams(initialParams));
      const params = new URLSearchParams(initialParams);
      if (params.has('q')) {
        setSearchQuery(params.get('q') || '');
      }
    }
  }, [initialParams]);

  const fetchProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const res = await api.products.list({
        ...filters,
        q: searchQuery.trim() || undefined,
        page,
        limit: 12,
      });
      setProducts(res.products);
      setPagination(res.pagination);
      if (res.facets) {
        setFacets(res.facets);
      }
    } catch (e) {
      console.error('Failed fetching products:', e);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ sort: 'newest' });
    setSearchQuery('');
  };

  const activeCategory = categories.find((c) => c.slug === filters.category || c.id === filters.category);
  const activeBrand = brands.find((b) => b.slug === filters.brand || b.id === filters.brand);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button onClick={() => onNavigate('home')} className="hover:text-slate-600 dark:hover:text-slate-300">
            Home
          </button>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-semibold">Shop Catalog</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-indigo-600 font-bold">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              {activeCategory ? activeCategory.name : activeBrand ? activeBrand.name : 'All Products'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Showing {pagination.total} high-grade verified items ready for immediate dispatch
            </p>
          </div>

          {/* Controls: Sort & Layout */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(filters.category ||
          filters.brand ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.minRating ||
          filters.inStock ||
          filters.deal ||
          filters.bestSeller ||
          searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs text-slate-400 font-medium">Active:</span>

            {searchQuery && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {activeCategory && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                {activeCategory.name}
                <button onClick={() => handleFilterChange({ category: undefined })}><X className="w-3 h-3" /></button>
              </span>
            )}

            {activeBrand && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                {activeBrand.name}
                <button onClick={() => handleFilterChange({ brand: undefined })}><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.minRating && (
              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                Rating: {filters.minRating}★+
                <button onClick={() => handleFilterChange({ minRating: undefined })}><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.deal && (
              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                Deals Only
                <button onClick={() => handleFilterChange({ deal: undefined })}><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-500 hover:underline font-bold ml-1"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <ProductFilters
              categories={categories}
              subCategories={subCategories}
              brands={brands}
              facets={facets}
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
              <div className="w-screen max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-5 overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-sm">Refine Results</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  subCategories={subCategories}
                  brands={brands}
                  facets={facets}
                  filters={filters}
                  onChange={(u) => {
                    handleFilterChange(u);
                    setIsMobileFiltersOpen(false);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Catalog Items */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-100 dark:bg-slate-800 aspect-square animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try loosening your filters, changing keywords, or clearing search criteria to see all available products.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onNavigate}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate('product', prod.slug)}
                  className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-5 hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full sm:w-44 h-44 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getProductFallbackSvg(prod.title, prod.categoryId, prod.brandId);
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {prod.sku}
                        </span>
                        {prod.discountPercentage && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Save {prod.discountPercentage}%
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60 mt-4">
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ${prod.price.toFixed(2)}
                        </span>
                        {prod.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ${prod.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(prod);
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Quick Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 border-t border-slate-200 dark:border-slate-800 flex-wrap">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => fetchProducts(pagination.page - 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {(() => {
                const total = pagination.totalPages;
                const current = pagination.page;
                let items: (number | '...')[] = [];
                if (total <= 7) {
                  items = Array.from({ length: total }, (_, i) => i + 1);
                } else {
                  items.push(1);
                  const start = Math.max(2, current - 1);
                  const end = Math.min(total - 1, current + 1);
                  if (start > 2) items.push('...');
                  for (let i = start; i <= end; i++) {
                    items.push(i);
                  }
                  if (end < total - 1) items.push('...');
                  items.push(total);
                }

                return items.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold"
                      >
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(item);
                  const isCurrent = pagination.page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchProducts(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}

              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchProducts(pagination.page + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
