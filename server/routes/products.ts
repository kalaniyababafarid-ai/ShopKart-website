import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Product } from '../types';

const router = Router();

// List products with advanced search, filter, sort, pagination
router.get('/', (req: Request, res: Response) => {
  const {
    q,
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    featured,
    deal,
    trending,
    bestSeller,
    sort = 'newest',
    page = '1',
    limit = '12',
  } = req.query;

  const database = db.get();
  let results: Product[] = [...database.products];

  // Search filter
  if (q && typeof q === 'string' && q.trim()) {
    const queryTerm = q.trim().toLowerCase();
    results = results.filter((p) => {
      const brandObj = database.brands.find((b) => b.id === p.brandId);
      const catObj = database.categories.find((c) => c.id === p.categoryId);
      return (
        p.title.toLowerCase().includes(queryTerm) ||
        p.description.toLowerCase().includes(queryTerm) ||
        p.sku.toLowerCase().includes(queryTerm) ||
        p.tags.some((t) => t.toLowerCase().includes(queryTerm)) ||
        (brandObj && brandObj.name.toLowerCase().includes(queryTerm)) ||
        (catObj && catObj.name.toLowerCase().includes(queryTerm))
      );
    });
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    const cat = database.categories.find((c) => c.id === category || c.slug === category);
    if (cat) {
      results = results.filter((p) => p.categoryId === cat.id);
    }
  }

  // SubCategory filter
  if (subCategory && typeof subCategory === 'string') {
    const sub = database.subCategories.find((s) => s.id === subCategory || s.slug === subCategory);
    if (sub) {
      results = results.filter((p) => p.subCategoryId === sub.id);
    }
  }

  // Brand filter
  if (brand && typeof brand === 'string' && brand !== 'all') {
    const b = database.brands.find((item) => item.id === brand || item.slug === brand);
    if (b) {
      results = results.filter((p) => p.brandId === b.id);
    }
  }

  // Price range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) results = results.filter((p) => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) results = results.filter((p) => p.price <= max);
  }

  // Rating
  if (minRating) {
    const ratingVal = parseFloat(minRating as string);
    if (!isNaN(ratingVal)) results = results.filter((p) => p.rating >= ratingVal);
  }

  // In Stock only
  if (inStock === 'true' || inStock === '1') {
    results = results.filter((p) => p.stock > 0);
  }

  // Flags
  if (featured === 'true') results = results.filter((p) => p.isFeatured);
  if (deal === 'true') results = results.filter((p) => p.isDeal);
  if (trending === 'true') results = results.filter((p) => p.isTrending);
  if (bestSeller === 'true') results = results.filter((p) => p.isBestSeller);

  // Sorting
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'popular':
      results.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'discount':
      results.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      break;
    case 'newest':
    default:
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const total = results.length;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = results.slice(startIndex, startIndex + limitNum);

  // Calculate dynamic facets based on search query context
  const baseForFacets = (q && typeof q === 'string' && q.trim()) ?
    database.products.filter(p => {
      const queryTerm = q.trim().toLowerCase();
      const brandObj = database.brands.find((b) => b.id === p.brandId);
      const catObj = database.categories.find((c) => c.id === p.categoryId);
      return (
        p.title.toLowerCase().includes(queryTerm) ||
        p.description.toLowerCase().includes(queryTerm) ||
        p.sku.toLowerCase().includes(queryTerm) ||
        p.tags.some((t) => t.toLowerCase().includes(queryTerm)) ||
        (brandObj && brandObj.name.toLowerCase().includes(queryTerm)) ||
        (catObj && catObj.name.toLowerCase().includes(queryTerm))
      );
    }) : database.products;

  const categoryFacets = database.categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: baseForFacets.filter((p) => p.categoryId === c.id).length,
  }));

  const brandFacets = database.brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    count: baseForFacets.filter((p) => p.brandId === b.id).length,
  }));

  const subCategoryFacets = database.subCategories.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    categoryId: s.categoryId,
    count: baseForFacets.filter((p) => p.subCategoryId === s.id).length,
  }));

  const inStockCount = baseForFacets.filter((p) => p.stock > 0).length;
  const outOfStockCount = baseForFacets.filter((p) => p.stock <= 0).length;
  const dealCount = baseForFacets.filter((p) => p.isDeal || (p.discountPercentage && p.discountPercentage >= 20)).length;
  const bestSellerCount = baseForFacets.filter((p) => p.isBestSeller).length;

  res.json({
    products: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    facets: {
      categories: categoryFacets,
      subCategories: subCategoryFacets,
      brands: brandFacets,
      inStockCount,
      outOfStockCount,
      dealCount,
      bestSellerCount,
      priceRange: {
        min: baseForFacets.length ? Math.min(...baseForFacets.map((p) => p.price)) : 0,
        max: baseForFacets.length ? Math.max(...baseForFacets.map((p) => p.price)) : 0,
      },
    },
  });
});

// Single product details
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const database = db.get();

  const product = database.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const category = database.categories.find((c) => c.id === product.categoryId);
  const subCategory = database.subCategories.find((s) => s.id === product.subCategoryId);
  const brand = database.brands.find((b) => b.id === product.brandId);

  // Related products
  const related = database.products
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.brandId === product.brandId))
    .slice(0, 4);

  // Reviews & Rating breakdown
  const reviews = database.reviews.filter((r) => r.productId === product.id);
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  res.json({
    product,
    category,
    subCategory,
    brand,
    related,
    reviews,
    ratingDistribution: ratingCounts,
  });
});

export default router;
