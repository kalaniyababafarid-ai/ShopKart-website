/**
 * ShopKart Dynamic Product Image Fallback Generator
 *
 * Ensures that if any external image fails to load, the product NEVER displays an
 * unrelated silver smartwatch or generic duplicate stock photo.
 * Instead, it renders a crisp, high-contrast SVG tailored to the exact product title,
 * category, and brand with elegant ShopKart styling.
 */

// Category icons for SVG rendering
const CATEGORY_ICONS: Record<string, string> = {
  'Electronics & Audio': '🎧',
  'Mobiles & Tablets': '📱',
  'Computers & Laptops': '💻',
  'Computer Accessories': '⌨️',
  'Smart Accessories': '⌚',
  "Men's Fashion": '👔',
  "Women's Fashion": '👗',
  'Kids Fashion': '🧸',
  'Footwear': '👟',
  'Home & Living': '🛋️',
  'Home Appliances': '🔌',
  'Kitchen & Dining': '🍳',
  'Furniture & Decor': '🪑',
  'Beauty & Personal Care': '✨',
  'Sports & Outdoors': '⚽',
  'Health & Wellness': '💊',
  'Grocery & Gourmet': '☕',
  'Toys & Games': '🎲',
  'Books & Stationery': '📚',
  'Automotive Accessories': '🚗',
  'Travel & Luggage': '🧳',
  'Jewelry & Watches': '💎',
  'Pet Supplies': '🐾',
  'Gaming & Consoles': '🎮',
};

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates an SVG data URL for a product image fallback.
 * Guarantees zero duplicate watch images and zero deceptive photos.
 */
export function getProductFallbackSvg(title: string, category?: string, brand?: string): string {
  const safeTitle = escapeXml(title || 'Product');
  const safeCat = escapeXml(category || 'ShopKart Product');
  const safeBrand = escapeXml(brand || 'ShopKart');
  const icon = (category && CATEGORY_ICONS[category]) || '🛍️';

  // Truncate title for clean rendering
  const displayTitle = safeTitle.length > 38 ? `${safeTitle.slice(0, 35)}...` : safeTitle;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#ede9fe" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed" />
        <stop offset="100%" stop-color="#4f46e5" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bgGrad)" />
    <rect x="16" y="16" width="368" height="368" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
    
    <!-- Category Icon Circle -->
    <circle cx="200" cy="140" r="54" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="2" />
    <text x="200" y="152" font-size="44" text-anchor="middle" dominant-baseline="central">${icon}</text>
    
    <!-- Brand Tag -->
    <rect x="130" y="212" width="140" height="22" rx="11" fill="url(#accentGrad)" />
    <text x="200" y="227" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${safeBrand.toUpperCase()}</text>
    
    <!-- Product Title -->
    <text x="200" y="268" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#1e293b" text-anchor="middle">${displayTitle}</text>
    
    <!-- Category Label -->
    <text x="200" y="294" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#64748b" text-anchor="middle">${safeCat}</text>

    <!-- Verified Badge -->
    <rect x="120" y="324" width="160" height="24" rx="12" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
    <text x="200" y="340" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">ShopKart Verified Catalog</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
