const fs = require('fs');
const path = require('path');

// We will construct 520+ realistic, distinctive products across 25 categories.
// Each product has:
// - Unique ID
// - Unique SKU
// - Unique Slug
// - Unique Title
// - Unique Primary Unsplash Image (verified distinct photo IDs)
// - Realistic Indian INR Pricing (MRP, Selling Price, Discount %)
// - Stock & Low Stock Threshold
// - Review Count & Rating
// - Specific Category Attributes & Specs
// - Realistic Variants

const products = [];
const usedImageIds = new Set();
const usedSkus = new Set();
const usedSlugs = new Set();
const usedTitles = new Set();

function addProduct(p) {
  // Validate and clean
  const title = p.title.trim();
  const sku = p.sku.trim().toUpperCase();
  const slug = p.slug.trim().toLowerCase();
  
  // Extract photo id
  const imgMatch = p.images[0].match(/photo-([0-9a-zA-Z-]+)/);
  const photoId = imgMatch ? imgMatch[1] : p.images[0];

  if (usedTitles.has(title.toLowerCase())) {
    throw new Error(`Duplicate Title: ${title}`);
  }
  if (usedSkus.has(sku)) {
    throw new Error(`Duplicate SKU: ${sku}`);
  }
  if (usedSlugs.has(slug)) {
    throw new Error(`Duplicate Slug: ${slug}`);
  }
  if (usedImageIds.has(photoId)) {
    throw new Error(`Duplicate Image PhotoID: ${photoId} on SKU ${sku}`);
  }

  usedTitles.add(title.toLowerCase());
  usedSkus.add(sku);
  usedSlugs.add(slug);
  usedImageIds.add(photoId);

  // Compute discount if not explicit
  const price = Math.round(p.price);
  const compareAtPrice = p.compareAtPrice ? Math.round(p.compareAtPrice) : Math.round(price * 1.25);
  const discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);

  products.push({
    id: p.id || `prod-${products.length + 1}`,
    title,
    slug,
    sku,
    categoryId: p.categoryId,
    subCategoryId: p.subCategoryId,
    brandId: p.brandId,
    description: p.description,
    shortDescription: p.shortDescription || p.description.slice(0, 120) + '...',
    price,
    compareAtPrice,
    discountPercentage,
    stock: p.stock !== undefined ? p.stock : Math.floor(10 + Math.random() * 60),
    lowStockThreshold: p.lowStockThreshold || 10,
    rating: p.rating || parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
    reviewCount: p.reviewCount || Math.floor(15 + Math.random() * 450),
    isFeatured: !!p.isFeatured,
    isBestSeller: !!p.isBestSeller,
    isTrending: !!p.isTrending,
    isDeal: !!p.isDeal,
    tags: p.tags || [],
    images: p.images,
    specs: p.specs || {},
    variants: p.variants || [],
    createdAt: p.createdAt || '2026-08-15T10:00:00Z',
  });
}

console.log('Building comprehensive catalog builder script...');
