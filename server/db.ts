import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  SubCategory,
  Brand,
  Product,
  Cart,
  Coupon,
  Order,
  Review,
  StockMovement,
  SupportTicket,
  ContactMessage,
  NewsletterSubscriber,
  SiteBanner,
  SiteSettings,
  BlogPost,
  UserNotification,
} from './types';

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  subCategories: SubCategory[];
  brands: Brand[];
  products: Product[];
  carts: Cart[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  stockMovements: StockMovement[];
  wishlists: Record<string, string[]>; // userId -> productId[]
  supportTickets: SupportTicket[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  banners: SiteBanner[];
  settings: SiteSettings;
  blogPosts: BlogPost[];
  notifications: UserNotification[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'shopkart.db.json');

// Memory cache & persistence
let dbData: DatabaseSchema | null = null;

function ensureDirExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
  const userPasswordHash = bcrypt.hashSync('Customer@123', 10);

  const categories: Category[] = [
    {
      id: 'cat-electronics',
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Cutting-edge smartphones, wireless headphones, audio gear & computing.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      icon: 'Headphones',
      banner: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1400&q=80',
      isFeatured: true,
    },
    {
      id: 'cat-fashion',
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Designer streetwear, luxury activewear, jackets and seasonal collections.',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      icon: 'Shirt',
      banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80',
      isFeatured: true,
    },
    {
      id: 'cat-home',
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Minimalist smart appliances, ergonomic decor and kitchen essentials.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
      icon: 'Home',
      banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
      isFeatured: true,
    },
    {
      id: 'cat-fitness',
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Performance gear, smart fitness wearables and camping technology.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
      icon: 'Activity',
      banner: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80',
      isFeatured: true,
    },
    {
      id: 'cat-beauty',
      name: 'Personal Care & Grooming',
      slug: 'personal-care',
      description: 'Premium skincare, ultrasonic styling and smart beauty instruments.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      icon: 'Sparkles',
      banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80',
      isFeatured: false,
    },
    {
      id: 'cat-gadgets',
      name: 'Smart Accessories',
      slug: 'smart-accessories',
      description: 'MagSafe docks, mechanical keyboards, ergonomic desk mounts & cases.',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      icon: 'Watch',
      banner: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1400&q=80',
      isFeatured: true,
    },
  ];

  const subCategories: SubCategory[] = [
    { id: 'sub-phones', categoryId: 'cat-electronics', name: 'Smartphones & Flagships', slug: 'smartphones' },
    { id: 'sub-audio', categoryId: 'cat-electronics', name: 'Wireless Headphones', slug: 'wireless-headphones' },
    { id: 'sub-laptops', categoryId: 'cat-electronics', name: 'Ultrabooks & Laptops', slug: 'laptops' },
    { id: 'sub-jackets', categoryId: 'cat-fashion', name: 'Jackets & Outerwear', slug: 'outerwear' },
    { id: 'sub-shoes', categoryId: 'cat-fashion', name: 'Sneakers & Athletic Footwear', slug: 'sneakers' },
    { id: 'sub-kitchen', categoryId: 'cat-home', name: 'Espresso & Smart Kitchen', slug: 'kitchen' },
    { id: 'sub-decor', categoryId: 'cat-home', name: 'Lighting & Acoustic Decor', slug: 'decor' },
    { id: 'sub-wearables', categoryId: 'cat-fitness', name: 'Smart Fitness Watches', slug: 'smart-watches' },
    { id: 'sub-skincare', categoryId: 'cat-beauty', name: 'Ultrasonic Skincare', slug: 'skincare' },
    { id: 'sub-peripherals', categoryId: 'cat-gadgets', name: 'Mechanical Keyboards & Hubs', slug: 'peripherals' },
  ];

  const brands: Brand[] = [
    { id: 'brand-apple', name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&q=80', isFeatured: true },
    { id: 'brand-sony', name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80', isFeatured: true },
    { id: 'brand-bose', name: 'Bose', slug: 'bose', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', isFeatured: true },
    { id: 'brand-nike', name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', isFeatured: true },
    { id: 'brand-dyson', name: 'Dyson', slug: 'dyson', logo: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&q=80', isFeatured: true },
    { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80', isFeatured: true },
    { id: 'brand-logitech', name: 'Logitech Master', slug: 'logitech', logo: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80', isFeatured: true },
    { id: 'brand-breville', name: 'Breville Artisan', slug: 'breville', logo: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&q=80', isFeatured: false },
    { id: 'brand-philips', name: 'Philips Hue & Sound', slug: 'philips', logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80', description: 'Smart ambient lighting, acoustic drivers, and personal grooming technology.', isFeatured: true },
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      title: 'Sony WH-1000XM5 Noise-Canceling Wireless Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      sku: 'SNY-WH-1000XM5-BLK',
      categoryId: 'cat-electronics',
      subCategoryId: 'sub-audio',
      brandId: 'brand-sony',
      price: 349.99,
      compareAtPrice: 399.99,
      discountPercentage: 13,
      stock: 42,
      lowStockThreshold: 10,
      rating: 4.9,
      reviewCount: 148,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      isDeal: true,
      dealEndsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      shortDescription: 'Industry-leading noise cancellation with dual processors, 8 microphones, and up to 30 hours battery.',
      description: 'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and crystal clear call quality. With newly developed lightweight drivers, integrated V1 processor, and ultra-comfortable soft fit leather headband, you enjoy breathtaking sound in complete comfort.',
      tags: ['audio', 'bluetooth', 'anc', 'headphones', 'sony'],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&q=80',
      ],
      specs: {
        'Battery Life': '30 Hours with ANC on',
        'Fast Charging': '3 mins = 3 hours playback',
        'Connectivity': 'Bluetooth 5.2 / 3.5mm Aux / LDAC',
        'Weight': '250 grams',
        'Microphones': '8 beamforming mics with AI noise reduction',
      },
      variants: [
        { id: 'v-sny-blk', name: 'Matte Black', sku: 'SNY-WH-BLK', price: 349.99, compareAtPrice: 399.99, stock: 24, attributes: { color: 'Matte Black' } },
        { id: 'v-sny-slv', name: 'Platinum Silver', sku: 'SNY-WH-SLV', price: 349.99, compareAtPrice: 399.99, stock: 18, attributes: { color: 'Platinum Silver' } },
      ],
      createdAt: '2026-08-10T10:00:00Z',
    },
    {
      id: 'prod-2',
      title: 'Apple MacBook Pro 16" M3 Max Studio',
      slug: 'apple-macbook-pro-16-m3-max',
      sku: 'APL-MBP16-M3MAX',
      categoryId: 'cat-electronics',
      subCategoryId: 'sub-laptops',
      brandId: 'brand-apple',
      price: 2899.00,
      compareAtPrice: 3199.00,
      discountPercentage: 9,
      stock: 15,
      lowStockThreshold: 5,
      rating: 4.95,
      reviewCount: 92,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      isDeal: false,
      shortDescription: '16-core CPU, 40-core GPU, Liquid Retina XDR display with up to 128GB unified memory.',
      description: 'The ultimate pro laptop. Powered by M3 Max, the 16-inch MacBook Pro delivers extreme performance and astounding battery life up to 22 hours. Liquid Retina XDR display with 1600 nits peak brightness and ProMotion 120Hz.',
      tags: ['apple', 'macbook', 'laptop', 'pro', 'm3max'],
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&q=80',
      ],
      specs: {
        'Processor': 'Apple M3 Max (16-core)',
        'Display': '16.2-inch Liquid Retina XDR (3456x2234)',
        'Memory': '36GB Unified Memory',
        'Storage': '1TB Superfast NVMe SSD',
        'Battery': 'Up to 22 hours video playback',
      },
      variants: [
        { id: 'v-mbp-space-black', name: 'Space Black / 36GB / 1TB', sku: 'APL-MBP-SB-1TB', price: 2899.00, compareAtPrice: 3199.00, stock: 10, attributes: { color: 'Space Black', storage: '1TB' } },
        { id: 'v-mbp-silver', name: 'Silver / 36GB / 1TB', sku: 'APL-MBP-SLV-1TB', price: 2899.00, compareAtPrice: 3199.00, stock: 5, attributes: { color: 'Silver', storage: '1TB' } },
      ],
      createdAt: '2026-08-15T12:00:00Z',
    },
    {
      id: 'prod-3',
      title: 'Nike Air VaporMax Flyknit Precision Runner',
      slug: 'nike-air-vapormax-flyknit-precision',
      sku: 'NKE-VPR-FLK-01',
      categoryId: 'cat-fashion',
      subCategoryId: 'sub-shoes',
      brandId: 'brand-nike',
      price: 189.99,
      compareAtPrice: 220.00,
      discountPercentage: 14,
      stock: 65,
      lowStockThreshold: 15,
      rating: 4.8,
      reviewCount: 210,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      isDeal: true,
      dealEndsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      shortDescription: 'Revolutionary VaporMax air cushioning with seamless, ultra-breathable recycled Flyknit upper.',
      description: 'Experience bouncy, gravity-defying comfort with Nike Air VaporMax. Built from stretchable Flyknit yarn that adapts seamlessly to your foot stride, paired with full-length integrated air pods for explosive energy return.',
      tags: ['footwear', 'running', 'nike', 'flyknit', 'shoes'],
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80',
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1000&q=80',
      ],
      specs: {
        'Upper': 'Flyknit elastic breathable weave',
        'Cushioning': 'Air VaporMax one-piece air unit',
        'Outsole': 'Recycled Nike Grind rubber lugs',
        'Weight': '295g (Size 10)',
      },
      variants: [
        { id: 'v-nke-red-9', name: 'Gym Red / Size 9', sku: 'NKE-RED-09', price: 189.99, stock: 15, attributes: { color: 'Gym Red', size: 'US 9' } },
        { id: 'v-nke-red-10', name: 'Gym Red / Size 10', sku: 'NKE-RED-10', price: 189.99, stock: 25, attributes: { color: 'Gym Red', size: 'US 10' } },
        { id: 'v-nke-red-11', name: 'Gym Red / Size 11', sku: 'NKE-RED-11', price: 189.99, stock: 15, attributes: { color: 'Gym Red', size: 'US 11' } },
        { id: 'v-nke-blk-10', name: 'Triple Black / Size 10', sku: 'NKE-BLK-10', price: 199.99, stock: 10, attributes: { color: 'Triple Black', size: 'US 10' } },
      ],
      createdAt: '2026-08-20T14:00:00Z',
    },
    {
      id: 'prod-4',
      title: 'Bose QuietComfort Ultra Spatial Audio Earbuds',
      slug: 'bose-quietcomfort-ultra-earbuds',
      sku: 'BSE-QCU-EAR',
      categoryId: 'cat-electronics',
      subCategoryId: 'sub-audio',
      brandId: 'brand-bose',
      price: 279.00,
      compareAtPrice: 299.00,
      discountPercentage: 7,
      stock: 35,
      lowStockThreshold: 8,
      rating: 4.85,
      reviewCount: 114,
      isFeatured: true,
      isBestSeller: false,
      isTrending: true,
      isDeal: false,
      shortDescription: 'World-class active noise cancellation with immersive spatial audio and CustomTune acoustic tailoring.',
      description: 'Bose QuietComfort Ultra Earbuds revolutionize in-ear listening with breakthrough spatialized audio that places sound right in front of you. CustomTune technology personalizes noise cancellation and sound performance to fit your individual ears precisely.',
      tags: ['earbuds', 'bose', 'spatial-audio', 'anc', 'wireless'],
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&q=80',
        'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=1000&q=80',
      ],
      specs: {
        'Battery Life': '6 hours (24 hours with case)',
        'Water Resistance': 'IPX4 sweat and weather resistant',
        'Modes': 'Quiet, Aware, and Immersion',
        'Bluetooth': 'v5.3 with aptX Adaptive',
      },
      variants: [
        { id: 'v-bse-blk', name: 'Black', sku: 'BSE-QC-BLK', price: 279.00, stock: 20, attributes: { color: 'Black' } },
        { id: 'v-bse-wht', name: 'White Smoke', sku: 'BSE-QC-WHT', price: 279.00, stock: 15, attributes: { color: 'White Smoke' } },
      ],
      createdAt: '2026-08-22T09:00:00Z',
    },
    {
      id: 'prod-5',
      title: 'Breville Barista Touch Impress Espresso Machine',
      slug: 'breville-barista-touch-impress',
      sku: 'BRV-BES881BSS',
      categoryId: 'cat-home',
      subCategoryId: 'sub-kitchen',
      brandId: 'brand-breville',
      price: 1499.95,
      compareAtPrice: 1699.95,
      discountPercentage: 12,
      stock: 12,
      lowStockThreshold: 4,
      rating: 4.9,
      reviewCount: 78,
      isFeatured: true,
      isBestSeller: true,
      isTrending: false,
      isDeal: true,
      dealEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      shortDescription: 'Touchscreen espresso maker with assisted tamping, automated milk microfoam and ThermoJet 3s heat-up.',
      description: 'Step-by-step barista guidance at your fingertips with real-time feedback and intelligent dosing. The Impress Puck system reduces mess and finishes with a 22lb tamp with a 7º barista twist. Create velvety microfoam for custom latte art automatically.',
      tags: ['espresso', 'coffee', 'kitchen', 'breville', 'barista'],
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1000&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&q=80',
      ],
      specs: {
        'Heating System': 'ThermoJet (Ready in 3 seconds)',
        'Bean Hopper': '340g / 12oz capacity',
        'Water Tank': '2L / 68 fl. oz',
        'Display': 'Color Touch Screen with automated presets',
        'Material': 'Brushed Stainless Steel',
      },
      variants: [
        { id: 'v-brv-ss', name: 'Brushed Stainless Steel', sku: 'BRV-TOUCH-SS', price: 1499.95, stock: 8, attributes: { color: 'Stainless Steel' } },
        { id: 'v-brv-blk', name: 'Black Truffle', sku: 'BRV-TOUCH-BLK', price: 1549.95, stock: 4, attributes: { color: 'Black Truffle' } },
      ],
      createdAt: '2026-08-25T11:00:00Z',
    },
    {
      id: 'prod-6',
      title: 'Dyson V15 Detect Absolute Cordless Smart Vacuum',
      slug: 'dyson-v15-detect-absolute-vacuum',
      sku: 'DYS-V15-ABS',
      categoryId: 'cat-home',
      subCategoryId: 'sub-kitchen',
      brandId: 'brand-dyson',
      price: 649.99,
      compareAtPrice: 749.99,
      discountPercentage: 13,
      stock: 22,
      lowStockThreshold: 6,
      rating: 4.88,
      reviewCount: 165,
      isFeatured: false,
      isBestSeller: true,
      isTrending: true,
      isDeal: false,
      shortDescription: 'Laser reveal technology with piezo sensor scientific proof of a deep clean on an LCD screen.',
      description: 'Dyson’s most powerful, intelligent cordless vacuum. A precisely-angled laser illuminates invisible microscopic dust on hard floors. An acoustic piezo sensor counts and sizes particles, automatically adapting suction power when high debris is detected.',
      tags: ['dyson', 'vacuum', 'cleaning', 'smart-home'],
      images: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=1000&q=80',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1000&q=80',
      ],
      specs: {
        'Suction Power': '240 AW in Boost mode',
        'Run Time': 'Up to 60 minutes',
        'Filtration': 'Whole-machine HEPA captures 99.99% particles down to 0.1 microns',
        'Bin Volume': '0.77 Liters with clean-eject mechanism',
      },
      variants: [
        { id: 'v-dys-gold', name: 'Yellow / Iron', sku: 'DYS-V15-GLD', price: 649.99, stock: 22, attributes: { color: 'Yellow/Iron' } },
      ],
      createdAt: '2026-08-26T16:00:00Z',
    },
    {
      id: 'prod-7',
      title: 'Logitech MX Master 3S Wireless Performance Mouse',
      slug: 'logitech-mx-master-3s-mouse',
      sku: 'LOG-MXM3S-GRY',
      categoryId: 'cat-gadgets',
      subCategoryId: 'sub-peripherals',
      brandId: 'brand-logitech',
      price: 99.99,
      compareAtPrice: 119.99,
      discountPercentage: 17,
      stock: 80,
      lowStockThreshold: 20,
      rating: 4.92,
      reviewCount: 312,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      isDeal: true,
      dealEndsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
      shortDescription: 'Quiet clicks, 8K DPI track-on-glass sensor, and electromagnetic MagSpeed scrolling.',
      description: 'An icon remastered. Feel every moment of your workflow with even more precision and performance. Quiet Clicks deliver a tactile feel with 90% less click noise. Plus, track anywhere—even on glass—with the 8000 DPI sensor.',
      tags: ['ergonomic', 'mouse', 'logitech', 'productivity', 'desk'],
      images: [
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1000&q=80',
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1000&q=80',
      ],
      specs: {
        'Sensor': 'Darkfield 8000 DPI optical',
        'Scroll Wheel': 'MagSpeed electromagnetic ultra-fast',
        'Battery': '500 mAh rechargeable Li-Po (Up to 70 days)',
        'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB',
      },
      variants: [
        { id: 'v-log-graphite', name: 'Graphite', sku: 'LOG-MXM3S-GPH', price: 99.99, stock: 50, attributes: { color: 'Graphite' } },
        { id: 'v-log-gray', name: 'Pale Grey', sku: 'LOG-MXM3S-PGR', price: 99.99, stock: 30, attributes: { color: 'Pale Grey' } },
      ],
      createdAt: '2026-08-28T10:00:00Z',
    },
    {
      id: 'prod-8',
      title: 'Samsung Galaxy S24 Ultra Titanium AI Smartphone',
      slug: 'samsung-galaxy-s24-ultra-5g',
      sku: 'SMG-S24U-512-TI',
      categoryId: 'cat-electronics',
      subCategoryId: 'sub-phones',
      brandId: 'brand-samsung',
      price: 1199.99,
      compareAtPrice: 1299.99,
      discountPercentage: 8,
      stock: 28,
      lowStockThreshold: 8,
      rating: 4.89,
      reviewCount: 180,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      isDeal: false,
      shortDescription: 'Galaxy AI, 200MP camera with 100x Space Zoom, built-in S Pen, and indestructible Titanium shield.',
      description: 'Unleash new levels of creativity and productivity with Galaxy AI. Circle to Search, live call translation, transcript assist, and pro-grade photo enhancement. Shielded in premium aerospace titanium with flat 6.8" Dynamic AMOLED 2X 2600 nits display.',
      tags: ['samsung', 'galaxy', 'smartphone', '5g', 'ai'],
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&q=80',
      ],
      specs: {
        'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
        'Camera': '200MP Main + 50MP 5x Periscope + 10MP 3x Tele + 12MP Ultra-wide',
        'Display': '6.8-inch QHD+ Dynamic AMOLED 2X 120Hz Corning Gorilla Armor',
        'Battery': '5000 mAh with 45W fast charging',
      },
      variants: [
        { id: 'v-s24-gray-256', name: 'Titanium Gray / 256GB', sku: 'SMG-S24-GRY-256', price: 1199.99, stock: 15, attributes: { color: 'Titanium Gray', storage: '256GB' } },
        { id: 'v-s24-black-512', name: 'Titanium Black / 512GB', sku: 'SMG-S24-BLK-512', price: 1319.99, stock: 13, attributes: { color: 'Titanium Black', storage: '512GB' } },
      ],
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'prod-9',
      title: 'Waterproof Alpine Tactical Shell Parka',
      slug: 'waterproof-alpine-tactical-shell-parka',
      sku: 'ALP-PARKA-09',
      categoryId: 'cat-fashion',
      subCategoryId: 'sub-jackets',
      brandId: 'brand-nike',
      price: 249.50,
      compareAtPrice: 320.00,
      discountPercentage: 22,
      stock: 30,
      lowStockThreshold: 10,
      rating: 4.75,
      reviewCount: 64,
      isFeatured: false,
      isBestSeller: false,
      isTrending: true,
      isDeal: true,
      dealEndsAt: new Date(Date.now() + 86400000 * 6).toISOString(),
      shortDescription: 'GORE-TEX 3-layer membrane waterproof technical jacket with seam-sealed taped zips and storm hood.',
      description: 'Engineered for relentless mountain storms and urban squalls. Featuring 3-layer waterproof-breathable GORE-TEX membrane, pit ventilation zippers, internal magnetic cargo pockets, and adjustable helmet-compatible hood.',
      tags: ['jacket', 'outerwear', 'waterproof', 'gore-tex', 'streetwear'],
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&q=80',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&q=80',
      ],
      specs: {
        'Membrane': '3-Layer GORE-TEX Pro',
        'Waterproof Rating': '28,000mm hydrostatic head',
        'Zippers': 'YKK AquaGuard sealed',
        'Pockets': '6 exterior weather-proof, 2 interior stash',
      },
      variants: [
        { id: 'v-parka-m-blk', name: 'Stealth Black / M', sku: 'ALP-BLK-M', price: 249.50, stock: 10, attributes: { size: 'Medium', color: 'Stealth Black' } },
        { id: 'v-parka-l-blk', name: 'Stealth Black / L', sku: 'ALP-BLK-L', price: 249.50, stock: 12, attributes: { size: 'Large', color: 'Stealth Black' } },
        { id: 'v-parka-l-olv', name: 'Olive Drab / L', sku: 'ALP-OLV-L', price: 249.50, stock: 8, attributes: { size: 'Large', color: 'Olive Drab' } },
      ],
      createdAt: '2026-09-05T12:00:00Z',
    },
    {
      id: 'prod-10',
      title: 'Aura Studio Minimalist Acoustic Smart Lamp',
      slug: 'aura-studio-minimalist-acoustic-smart-lamp',
      sku: 'AUR-LMP-01',
      categoryId: 'cat-home',
      subCategoryId: 'sub-decor',
      brandId: 'brand-philips',
      price: 179.00,
      compareAtPrice: 219.00,
      discountPercentage: 18,
      stock: 40,
      lowStockThreshold: 10,
      rating: 4.82,
      reviewCount: 88,
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
      isDeal: false,
      shortDescription: 'Ambient gradient lighting system with integrated 360-degree high-fidelity Bluetooth audio driver.',
      description: 'Transform your room into an oasis of tranquility. The Aura Studio lamp produces dynamic natural sunlight rhythms to support healthy circadian cycles while delivering crystal-clear 360-degree ambient acoustic sound.',
      tags: ['smart-home', 'lighting', 'speaker', 'decor', 'minimalist'],
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&q=80',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&q=80',
      ],
      specs: {
        'Luminosity': '1200 Lumens (Adjustable 2200K - 6500K)',
        'Audio': '25W Neodymium speaker with passive bass radiator',
        'Smart Control': 'Matter, Apple Home, Google Assistant compatible',
        'Finish': 'Anodized brushed aluminum and frosted opalescent glass',
      },
      variants: [
        { id: 'v-aura-alu', name: 'Lunar Silver', sku: 'AUR-SLV-01', price: 179.00, stock: 25, attributes: { color: 'Lunar Silver' } },
        { id: 'v-aura-gld', name: 'Champagne Brass', sku: 'AUR-BRS-01', price: 189.00, stock: 15, attributes: { color: 'Champagne Brass' } },
      ],
      createdAt: '2026-09-08T15:00:00Z',
    },
  ];

  const coupons: Coupon[] = [
    {
      id: 'cp-welcome10',
      code: 'WELCOME10',
      description: '10% off on your entire first order!',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 40,
      maxDiscount: 50,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      usageLimit: 10000,
      timesUsed: 142,
      isActive: true,
    },
    {
      id: 'cp-flat50',
      code: 'FLAT50',
      description: 'Flat $50 off on orders over $250',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 250,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      usageLimit: 500,
      timesUsed: 67,
      isActive: true,
    },
    {
      id: 'cp-super20',
      code: 'SUPER20',
      description: 'Exclusive 20% discount on orders over $150',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 150,
      maxDiscount: 100,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      usageLimit: 2000,
      timesUsed: 215,
      isActive: true,
    },
    {
      id: 'cp-mega100',
      code: 'MEGA100',
      description: 'Huge $100 off on premium purchases above $800',
      discountType: 'fixed',
      discountValue: 100,
      minOrderValue: 800,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      usageLimit: 1000,
      timesUsed: 89,
      isActive: true,
    },
  ];

  const users: User[] = [
    {
      id: 'usr-admin',
      email: 'admin@shopkart.com',
      passwordHash: adminPasswordHash,
      name: 'Shopkart Operations Admin',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      isVerified: true,
      addresses: [
        {
          id: 'addr-admin-1',
          fullName: 'Shopkart Headquarters',
          phone: '+1 (555) 019-2834',
          street: '100 Innovation Way, Suite 800',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94105',
          country: 'United States',
          isDefault: true,
        },
      ],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr-customer',
      email: 'john@example.com',
      passwordHash: userPasswordHash,
      name: 'Johnathan Miller',
      role: 'customer',
      phone: '+1 (555) 847-1920',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      isVerified: true,
      addresses: [
        {
          id: 'addr-cust-1',
          fullName: 'Johnathan Miller',
          phone: '+1 (555) 847-1920',
          street: '742 Evergreen Terrace, Apt 4B',
          city: 'Seattle',
          state: 'Washington',
          postalCode: '98101',
          country: 'United States',
          isDefault: true,
        },
        {
          id: 'addr-cust-2',
          fullName: 'Johnathan Miller (Office)',
          phone: '+1 (555) 847-1920',
          street: '500 Pine Street, Floor 12',
          city: 'Seattle',
          state: 'Washington',
          postalCode: '98104',
          country: 'United States',
          isDefault: false,
        },
      ],
      createdAt: '2026-02-14T10:30:00Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'SK-2026-8910',
      userId: 'usr-customer',
      customerName: 'Johnathan Miller',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 847-1920',
      items: [
        {
          productId: 'prod-1',
          variantId: 'v-sny-blk',
          title: 'Sony WH-1000XM5 Wireless Headphones (Matte Black)',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          price: 349.99,
          quantity: 1,
          total: 349.99,
          attributes: { color: 'Matte Black' },
        },
      ],
      shippingAddress: users[1].addresses[0],
      shippingMethod: {
        id: 'ship-std',
        name: 'Express Priority Courier',
        estimatedDays: '1-2 Business Days',
        cost: 0,
      },
      subtotal: 349.99,
      discount: 35.00,
      couponCode: 'WELCOME10',
      shippingFee: 0,
      tax: 25.20,
      total: 340.19,
      paymentMethod: 'card',
      paymentStatus: 'completed',
      paymentTransactionId: 'txn_live_981248019481',
      status: 'delivered',
      trackingCarrier: 'FedEx Express',
      trackingNumber: 'FX-829104820US',
      timeline: [
        { status: 'pending', title: 'Order Placed', description: 'Your order was received and payment authorization completed.', timestamp: '2026-09-28T14:20:00Z' },
        { status: 'confirmed', title: 'Order Confirmed', description: 'Items verified and reserved in the fulfilment hub.', timestamp: '2026-09-28T14:25:00Z' },
        { status: 'processing', title: 'Packed & Quality Checked', description: 'Packed in eco-friendly protective packaging.', timestamp: '2026-09-28T17:40:00Z' },
        { status: 'shipped', title: 'Dispatched via FedEx', description: 'Departed Seattle distribution hub.', timestamp: '2026-09-29T08:15:00Z' },
        { status: 'out_for_delivery', title: 'Out for Delivery', description: 'Courier is in transit to your destination.', timestamp: '2026-09-30T09:30:00Z' },
        { status: 'delivered', title: 'Delivered', description: 'Package safely delivered at front door.', timestamp: '2026-09-30T13:45:00Z' },
      ],
      createdAt: '2026-09-28T14:20:00Z',
    },
    {
      id: 'ord-1002',
      orderNumber: 'SK-2026-9042',
      userId: 'usr-customer',
      customerName: 'Johnathan Miller',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 847-1920',
      items: [
        {
          productId: 'prod-7',
          variantId: 'v-log-graphite',
          title: 'Logitech MX Master 3S Wireless Performance Mouse',
          image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
          price: 99.99,
          quantity: 1,
          total: 99.99,
          attributes: { color: 'Graphite' },
        },
      ],
      shippingAddress: users[1].addresses[0],
      shippingMethod: {
        id: 'ship-std',
        name: 'Standard Insured Delivery',
        estimatedDays: '3-4 Business Days',
        cost: 0,
      },
      subtotal: 99.99,
      discount: 0,
      shippingFee: 0,
      tax: 8.00,
      total: 107.99,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      paymentTransactionId: 'upi_ref_774910284719',
      status: 'shipped',
      trackingCarrier: 'UPS Logistics',
      trackingNumber: 'UPS-91820491823',
      timeline: [
        { status: 'pending', title: 'Order Placed', description: 'Order created and UPI payment confirmed.', timestamp: '2026-10-02T11:00:00Z' },
        { status: 'confirmed', title: 'Confirmed by Warehouse', description: 'Stock reserved and manifest generated.', timestamp: '2026-10-02T11:15:00Z' },
        { status: 'processing', title: 'Packed', description: 'Item securely boxed with tamper-evident seal.', timestamp: '2026-10-02T15:30:00Z' },
        { status: 'shipped', title: 'In Transit', description: 'Carrier collected package. On schedule for arrival.', timestamp: '2026-10-03T09:00:00Z' },
      ],
      createdAt: '2026-10-02T11:00:00Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev-1',
      productId: 'prod-1',
      userId: 'usr-customer',
      userName: 'Johnathan Miller',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      rating: 5,
      title: 'Best ANC Headphones I Have Ever Owned',
      comment: 'The noise cancellation is miraculous. I use these on daily flights and in bustling coffee shops—total silence. The microphone clarity during conference calls is phenomenal as well.',
      isVerifiedPurchase: true,
      helpfulCount: 38,
      createdAt: '2026-10-01T15:00:00Z',
    },
    {
      id: 'rev-2',
      productId: 'prod-1',
      userId: 'usr-2',
      userName: 'Elena Rostova',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
      title: 'Comfortable for 8+ hour work sessions',
      comment: 'Super lightweight and the padding does not squeeze your skull like other brands. Battery life lasts all week on a single quick charge.',
      isVerifiedPurchase: true,
      helpfulCount: 19,
      createdAt: '2026-09-15T09:20:00Z',
    },
    {
      id: 'rev-3',
      productId: 'prod-7',
      userId: 'usr-customer',
      userName: 'Johnathan Miller',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      rating: 5,
      title: 'A productivity powerhouse mouse',
      comment: 'The electromagnetic scroll wheel is magical. You can flick through thousands of lines in code or huge spreadsheets instantly. The quiet click buttons are so satisfying.',
      isVerifiedPurchase: true,
      helpfulCount: 24,
      createdAt: '2026-09-20T11:45:00Z',
    },
  ];

  const banners: SiteBanner[] = [
    {
      id: 'ban-1',
      title: 'Sonic Mastery Remastered',
      subtitle: 'Experience spatial acoustic perfection with flagship active noise-cancellation',
      tag: 'NEW ARRIVAL',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80',
      link: '/product/sony-wh-1000xm5-wireless-headphones',
      buttonText: 'Explore Flagship Audio',
      badge: 'Save $50 Today',
      isActive: true,
    },
    {
      id: 'ban-2',
      title: 'Uncompromised Pro Power',
      subtitle: 'Apple M3 Max Architecture with Liquid Retina XDR displays',
      tag: 'FLAGSHIP COMPUTING',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80',
      link: '/product/apple-macbook-pro-16-m3-max',
      buttonText: 'Shop Pro Series',
      badge: 'Exclusive Tech Deals',
      isActive: true,
    },
    {
      id: 'ban-3',
      title: 'Elevate Your Kinetic Potential',
      subtitle: 'Nike Air VaporMax Flyknit running precision engineered for speed',
      tag: 'PERFORMANCE FASHION',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80',
      link: '/product/nike-air-vapormax-flyknit-precision',
      buttonText: 'Shop Active Footwear',
      badge: 'Limited Stock',
      isActive: true,
    },
  ];

  const settings: SiteSettings = {
    storeName: 'Shopkart Marketplace',
    storeTagline: 'Curated premium commerce, seamless checkout, and rapid delivery worldwide.',
    contactEmail: 'support@shopkart.com',
    contactPhone: '+1 (800) 555-KART',
    address: '100 Innovation Way, Suite 800, San Francisco, CA 94105, USA',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0.08,
    freeShippingThreshold: 50.00,
    standardShippingFee: 5.99,
    expressShippingFee: 14.99,
  };

  const supportTickets: SupportTicket[] = [
    {
      id: 'tkt-1',
      ticketNumber: 'TKT-9182',
      userId: 'usr-customer',
      customerName: 'Johnathan Miller',
      customerEmail: 'john@example.com',
      subject: 'Inquiry regarding extended warranty on Sony headphones',
      category: 'Warranty & Care',
      message: 'Hello Shopkart support, I ordered the Sony WH-1000XM5 headphones and want to confirm if the 2-year manufacturer warranty is automatically activated or requires registration?',
      status: 'resolved',
      priority: 'medium',
      replies: [
        {
          id: 'rep-1',
          sender: 'support',
          senderName: 'Sarah Jenkins (Shopkart Care)',
          message: 'Hi Johnathan! Your order invoice doubles as official proof of purchase for Sony authorized service centers globally. We also register your serial number automatically with the distributor. You are fully covered for 24 months!',
          createdAt: '2026-09-29T10:15:00Z',
        },
      ],
      createdAt: '2026-09-29T09:00:00Z',
    },
  ];

  const blogPosts: BlogPost[] = [
    {
      id: 'blog-1',
      slug: 'noise-canceling-audio-guide-2026',
      title: 'The Ultimate Noise-Canceling Audio Guide: ANC vs Spatial Sound in 2026',
      excerpt: 'Explore how dual-processor acoustics, adaptive noise canceling, and personalized spatial audio are transforming immersive daily listening.',
      content: `Modern acoustic engineering has reached unprecedented heights. Whether you are traveling on long-haul flights or seeking deep focus in bustling open-plan offices, active noise cancellation (ANC) paired with binaural spatial algorithms delivers unprecedented fidelity.

Key Innovations to Consider:
1. Dual Integrated Processors: Chipsets like Sony's V1 and Apple's H2 analyze ambient sound at over 48,000 times per second, nullifying high-frequency commuter clamor.
2. Custom Acoustic Tailoring: Microphones inside the ear canal measure ear canal resonance, calculating personalized EQ curves in real-time.
3. Spatial Immersion with Head Tracking: Gyroscopic accelerometers anchor audio sources in virtual 3D space, creating a front-row concert atmosphere.

Choosing Between In-Ear and Over-Ear:
Over-ear designs like the Sony WH-1000XM5 offer superior passive isolation, broader dynamic range, and extended 30-hour battery life. Meanwhile, compact wireless earbuds like the Bose QuietComfort Ultra provide unmatched portability and sweat resistance for high-intensity training.`,
      category: 'Audio & Tech',
      tags: ['audio', 'headphones', 'anc', 'guide'],
      coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80',
      author: 'Marcus Vance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      readTime: '5 min read',
      isPublished: true,
      publishedAt: '2026-09-15T10:00:00Z',
    },
    {
      id: 'blog-2',
      slug: 'ergonomic-workspace-productivity-setup',
      title: 'Architecting the High-Performance Workspace: Monitors, Keyboards & Ergonomics',
      excerpt: 'How investing in tactile mechanical switches, color-accurate displays, and orthopedic furniture compounds your daily output.',
      content: `The modern knowledge worker spends upwards of 2,000 hours per year at their desk. Crafting an intentional workspace is not merely an aesthetic endeavor—it is a direct investment in your health, posture, and cognitive stamina.

The Essential Pillars of a Pro Workspace:
• Display Calibration & Height: Position your primary monitor at arm's length with the top third of the panel aligned directly with your natural eye gaze.
• Mechanical Keyboards with Hot-Swappable Switches: Gasket-mounted frames damp vibrational shock, reducing finger fatigue across marathon coding sessions.
• Dynamic Lighting: Ambient bias lighting positioned behind screens softens contrast, preventing eye strain during late-night projects.

Elevate your productivity today with Shopkart curated studio accessories and computing essentials.`,
      category: 'Productivity & Work',
      tags: ['workspace', 'desk', 'gadgets', 'ergonomics'],
      coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80',
      author: 'Elena Rostova',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      readTime: '4 min read',
      isPublished: true,
      publishedAt: '2026-09-22T14:30:00Z',
    },
    {
      id: 'blog-3',
      slug: 'espresso-masterclass-barista-touch',
      title: 'The Home Barista Masterclass: Dialing in Extraction & Velvety Microfoam',
      excerpt: 'From grind micron consistency to 9-bar pressure profiling and silky latte art: mastering third-wave coffee at home.',
      content: `Crafting cafe-caliber espresso in your kitchen requires balancing three fundamental variables: dose, yield, and extraction time.

The Golden Espresso Ratio:
Start with an 18g dose of freshly roasted specialty beans (7–21 days post-roast date). Target a 36g liquid yield in 26 to 30 seconds at 9 bars of pressure.

The Microfoam Secret:
Position your steam wand tip just below the surface of the milk at a 45-degree angle. Inject air for 3 to 4 seconds until the pitcher feels body temperature, then plunge deeper to create a rapid vortex. The outcome should mirror wet gloss paint.`,
      category: 'Lifestyle & Gourmet',
      tags: ['coffee', 'espresso', 'kitchen', 'lifestyle'],
      coverImage: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=1000&q=80',
      author: 'Julian Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      readTime: '6 min read',
      isPublished: true,
      publishedAt: '2026-09-28T08:00:00Z',
    },
  ];

  const notifications: UserNotification[] = [
    {
      id: 'notif-1',
      userId: 'usr-customer',
      title: 'Order Dispatched with Priority Tracking',
      message: 'Your order SK-2026-108291 has departed our logistics hub via FedEx Express.',
      type: 'order',
      link: 'account/orders',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'usr-customer',
      title: 'VIP Reward: 10% Welcome Coupon',
      message: 'Apply WELCOME10 at checkout on any order above $40.',
      type: 'promo',
      link: 'shop',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'notif-3',
      userId: 'usr-customer',
      title: 'Account Security Verified',
      message: 'Two-factor verification PIN security update enabled successfully.',
      type: 'security',
      link: 'account/security',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  return {
    users,
    categories,
    subCategories,
    brands,
    products,
    carts: [],
    coupons,
    orders,
    reviews,
    stockMovements: [],
    wishlists: {
      'usr-customer': ['prod-2', 'prod-5'],
    },
    supportTickets,
    contactMessages: [],
    newsletterSubscribers: [
      { id: 'sub-1', email: 'john@example.com', subscribedAt: '2026-08-01T00:00:00Z', isActive: true },
    ],
    banners,
    settings,
    blogPosts,
    notifications,
  };
}

export function loadDatabase(): DatabaseSchema {
  ensureDirExists();
  if (dbData) return dbData;

  const initial = getInitialData();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
      // Auto-migrate new schema collections if absent
      let modified = false;
      if (!dbData!.blogPosts) {
        dbData!.blogPosts = initial.blogPosts;
        modified = true;
      }
      if (!dbData!.notifications) {
        dbData!.notifications = initial.notifications;
        modified = true;
      }
      if (modified) {
        saveDatabase(dbData!);
      }
      return dbData!;
    } catch (e) {
      console.error('Failed reading shopkart database file, reinitializing default seed:', e);
    }
  }

  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDirExists();
  dbData = data;
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

// Database helper operations
export const db = {
  get: () => loadDatabase(),
  save: (data: DatabaseSchema) => saveDatabase(data),
  
  // Quick mutation runner with automatic persistence
  mutate: <T>(mutator: (current: DatabaseSchema) => T): T => {
    const current = loadDatabase();
    const result = mutator(current);
    saveDatabase(current);
    return result;
  },
};
