import { Product } from '../types';

export interface ValidationReport {
  isValid: boolean;
  totalProducts: number;
  uniquePrimaryImages: number;
  uniqueTitles: number;
  uniqueSkus: number;
  uniqueSlugs: number;
  errors: string[];
  warnings: string[];
}

/**
 * Normalizes an image URL to its unique visual asset signature.
 * For Unsplash images, strips variable query parameters (w, q, fit, etc.) to get the exact photo ID.
 */
export function extractImageSignature(imageUrl: string): string {
  if (!imageUrl) return '';
  const trimmed = imageUrl.trim();
  try {
    const url = new URL(trimmed);
    // For Unsplash or similar CDN, the pathname contains the unique photo ID
    return `${url.hostname}${url.pathname}`.toLowerCase();
  } catch {
    // If not a full URL, strip query params if any
    return trimmed.split('?')[0].toLowerCase();
  }
}

/**
 * Runs a complete forensic audit on a catalog array.
 * Validates uniqueness of names, SKUs, slugs, and primary image signatures.
 */
export function auditProductCatalog(
  products: Product[],
  knownCategoryIds: Set<string>,
  knownBrandIds: Set<string>
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const seenIds = new Set<string>();
  const seenSkus = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const seenPrimaryImages = new Map<string, string>(); // imageSignature -> productSku

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const prefix = `[Product ${i + 1} (${p.sku || p.id || 'Unknown'})]`;

    // 1. ID Uniqueness
    if (!p.id) {
      errors.push(`${prefix}: Missing product ID.`);
    } else if (seenIds.has(p.id)) {
      errors.push(`${prefix}: Duplicate product ID "${p.id}".`);
    } else {
      seenIds.add(p.id);
    }

    // 2. SKU Uniqueness
    if (!p.sku) {
      errors.push(`${prefix}: Missing product SKU.`);
    } else {
      const normalizedSku = p.sku.trim().toUpperCase();
      if (seenSkus.has(normalizedSku)) {
        errors.push(`${prefix}: Duplicate SKU "${p.sku}".`);
      } else {
        seenSkus.add(normalizedSku);
      }
    }

    // 3. Slug Uniqueness
    if (!p.slug) {
      errors.push(`${prefix}: Missing product slug.`);
    } else {
      const normalizedSlug = p.slug.trim().toLowerCase();
      if (seenSlugs.has(normalizedSlug)) {
        errors.push(`${prefix}: Duplicate slug "${p.slug}".`);
      } else {
        seenSlugs.add(normalizedSlug);
      }
    }

    // 4. Title Uniqueness
    if (!p.title) {
      errors.push(`${prefix}: Missing product title.`);
    } else {
      const normalizedTitle = p.title.trim().toLowerCase();
      if (seenTitles.has(normalizedTitle)) {
        errors.push(`${prefix}: Duplicate product title "${p.title}".`);
      } else {
        seenTitles.add(normalizedTitle);
      }
    }

    // 5. Image Uniqueness (Section 7 & 8)
    if (!p.images || p.images.length === 0 || !p.images[0]) {
      errors.push(`${prefix}: Product has no primary image.`);
    } else {
      const primarySig = extractImageSignature(p.images[0]);
      if (seenPrimaryImages.has(primarySig)) {
        const conflictSku = seenPrimaryImages.get(primarySig);
        errors.push(
          `${prefix}: Duplicate primary image signature detected! Reused from SKU "${conflictSku}". Image: ${p.images[0]}`
        );
      } else {
        seenPrimaryImages.set(primarySig, p.sku);
      }
    }

    // 6. Category & Brand Integrity
    if (!knownCategoryIds.has(p.categoryId)) {
      errors.push(`${prefix}: Unknown categoryId "${p.categoryId}".`);
    }
    if (!knownBrandIds.has(p.brandId)) {
      errors.push(`${prefix}: Unknown brandId "${p.brandId}".`);
    }

    // 7. Pricing Realism (Section 10)
    if (typeof p.price !== 'number' || p.price <= 0) {
      errors.push(`${prefix}: Invalid selling price: ${p.price}.`);
    }
    if (p.compareAtPrice !== undefined && p.compareAtPrice < p.price) {
      warnings.push(`${prefix}: MRP (compareAtPrice: ${p.compareAtPrice}) is lower than selling price (${p.price}).`);
    }

    // 8. Stock & Inventory Realism (Section 13)
    if (typeof p.stock !== 'number' || p.stock < 0) {
      errors.push(`${prefix}: Negative or invalid stock level: ${p.stock}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    totalProducts: products.length,
    uniquePrimaryImages: seenPrimaryImages.size,
    uniqueTitles: seenTitles.size,
    uniqueSkus: seenSkus.size,
    uniqueSlugs: seenSlugs.size,
    errors,
    warnings,
  };
}
