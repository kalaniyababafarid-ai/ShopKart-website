import { Category, SubCategory } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    description: 'Immersive sound systems, audiophile headphones, wireless earbuds, soundbars, and smart audio equipment.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    icon: 'Headphones',
    banner: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-mobiles',
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    description: 'Flagship 5G smartphones, foldable devices, high-refresh tablets, styluses, and mobile accessories.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    icon: 'Smartphone',
    banner: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-computers',
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    description: 'Ultrabooks, powerhouse workstations, gaming rigs, 4K monitors, and desktop systems.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    icon: 'Laptop',
    banner: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-computer-acc',
    name: 'Computer Accessories',
    slug: 'computer-accessories',
    description: 'Mechanical keyboards, ergonomic mice, NVMe SSDs, USB-C docks, and ultra-wide monitor stands.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    icon: 'Keyboard',
    banner: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-smart-acc',
    name: 'Smart Accessories',
    slug: 'smart-accessories',
    description: 'Smartwatches, fitness bands, smart rings, wireless charging stations, and IoT smart trackers.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    icon: 'Watch',
    banner: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-mens-fashion',
    name: "Men's Fashion",
    slug: 'mens-fashion',
    description: 'Designer shirts, premium denim, formal blazers, casual polos, jackets, and tailored trousers.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80',
    icon: 'Shirt',
    banner: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-womens-fashion',
    name: "Women's Fashion",
    slug: 'womens-fashion',
    description: 'Contemporary dresses, ethnic kurtas, casual tops, designer sarees, trousers, and outer layers.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    icon: 'ShoppingBag',
    banner: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-kids-fashion',
    name: 'Kids Fashion',
    slug: 'kids-fashion',
    description: 'Comfortable cotton wear, cheerful party outfits, denim dungarees, and active playwear for boys & girls.',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
    icon: 'Sparkles',
    banner: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-footwear',
    name: 'Footwear',
    slug: 'footwear',
    description: 'High-performance running sneakers, formal leather shoes, comfort loafers, boots, and casual slides.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    icon: 'Footprints',
    banner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Luxury bedding, ambient lighting, architectural accents, storage organizers, and artistic home decor.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
    icon: 'Home',
    banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-home-appliances',
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Air purifiers, robotic vacuums, smart inverters, washing machines, microwaves, and climate systems.',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80',
    icon: 'Wind',
    banner: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-kitchen',
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Espresso machines, tri-ply cookware, air fryers, precision chef knives, and ceramic dinnerware.',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    icon: 'UtensilsCrossed',
    banner: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-furniture-decor',
    name: 'Furniture & Decor',
    slug: 'furniture-decor',
    description: 'Solid teak dining tables, ergonomic office chairs, velvet accent armchairs, and minimalist sofas.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    icon: 'Armchair',
    banner: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Botanical skincare serums, dermatologist sunscreens, sonic hair dryers, perfumes, and grooming kits.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    icon: 'Sparkle',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-sports',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Adjustable dumbbells, yoga mats, cycling gear, camping tents, trekking bags, and sports nutrition.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    icon: 'Dumbbell',
    banner: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-health',
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Digital blood pressure monitors, infrared thermometers, orthopedic supports, and herbal supplements.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    icon: 'HeartPulse',
    banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-grocery',
    name: 'Grocery & Gourmet',
    slug: 'grocery-gourmet',
    description: 'Artisanal single-origin coffee, organic cold-pressed oils, dry fruits, seeds, and imported chocolates.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    icon: 'Apple',
    banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-toys',
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'STEM robotics kits, wooden puzzle boards, remote control vehicles, action figures, and card games.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
    icon: 'Gamepad2',
    banner: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-books',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Bestselling paperbacks, fountain pens, handcrafted leather journals, and desk organizers.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    icon: 'BookOpen',
    banner: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-automotive',
    name: 'Automotive Accessories',
    slug: 'automotive-accessories',
    description: 'Dashcams, wireless tire inflators, car vacuum cleaners, high-density microfiber kits, and car mounts.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    icon: 'Car',
    banner: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-travel',
    name: 'Travel & Luggage',
    slug: 'travel-luggage',
    description: 'Polycarbonate trolley bags, anti-theft backpacks, passport wallets, and water-resistant duffels.',
    image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80',
    icon: 'Luggage',
    banner: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-jewelry',
    name: 'Jewelry & Watches',
    slug: 'jewelry-watches',
    description: 'Automatic chronographs, 925 sterling silver bracelets, pearl necklaces, and titanium cufflinks.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    icon: 'Gem',
    banner: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&q=80',
    isFeatured: true,
  },
  {
    id: 'cat-pets',
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    description: 'Orthopedic pet beds, grain-free dog food, interactive cat scratching posts, and grooming trimmers.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
    icon: 'PawPrint',
    banner: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1600&q=80',
    isFeatured: false,
  },
  {
    id: 'cat-gaming',
    name: 'Gaming & Consoles',
    slug: 'gaming-consoles',
    description: 'Wireless gaming controllers, ultra-low latency headsets, RGB mouse pads, and gaming consoles.',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80',
    icon: 'Gamepad',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&q=80',
    isFeatured: true,
  },
];

export const SUB_CATEGORIES: SubCategory[] = [
  // Electronics & Audio
  { id: 'sub-headphones', categoryId: 'cat-electronics', name: 'Over-Ear Headphones', slug: 'over-ear-headphones' },
  { id: 'sub-earbuds', categoryId: 'cat-electronics', name: 'True Wireless Earbuds', slug: 'true-wireless-earbuds' },
  { id: 'sub-speakers', categoryId: 'cat-electronics', name: 'Bluetooth Portable Speakers', slug: 'bluetooth-speakers' },
  { id: 'sub-soundbars', categoryId: 'cat-electronics', name: 'Home Theater Soundbars', slug: 'soundbars' },
  { id: 'sub-neckbands', categoryId: 'cat-electronics', name: 'Wireless Neckbands', slug: 'wireless-neckbands' },

  // Mobiles & Tablets
  { id: 'sub-smartphones', categoryId: 'cat-mobiles', name: 'Smartphones', slug: 'smartphones' },
  { id: 'sub-tablets', categoryId: 'cat-mobiles', name: 'Tablets & iPads', slug: 'tablets-ipads' },
  { id: 'sub-chargers', categoryId: 'cat-mobiles', name: 'Fast Chargers & Cables', slug: 'fast-chargers-cables' },
  { id: 'sub-powerbanks', categoryId: 'cat-mobiles', name: 'High Capacity Powerbanks', slug: 'powerbanks' },

  // Computers & Laptops
  { id: 'sub-laptops-thin', categoryId: 'cat-computers', name: 'Ultrabooks & Thin Laptops', slug: 'ultrabooks' },
  { id: 'sub-laptops-gaming', categoryId: 'cat-computers', name: 'Gaming Laptops', slug: 'gaming-laptops' },
  { id: 'sub-monitors', categoryId: 'cat-computers', name: 'Monitors & Displays', slug: 'monitors-displays' },
  { id: 'sub-workstations', categoryId: 'cat-computers', name: 'Desktop Workstations', slug: 'desktop-workstations' },

  // Computer Accessories
  { id: 'sub-keyboards', categoryId: 'cat-computer-acc', name: 'Mechanical Keyboards', slug: 'mechanical-keyboards' },
  { id: 'sub-mice', categoryId: 'cat-computer-acc', name: 'Wireless & Gaming Mice', slug: 'wireless-gaming-mice' },
  { id: 'sub-storage', categoryId: 'cat-computer-acc', name: 'External SSDs & Flash Drives', slug: 'external-ssds' },
  { id: 'sub-docks', categoryId: 'cat-computer-acc', name: 'USB-C Docks & Hubs', slug: 'usb-c-docks' },

  // Smart Accessories
  { id: 'sub-smartwatches', categoryId: 'cat-smart-acc', name: 'Smartwatches', slug: 'smartwatches' },
  { id: 'sub-fitness-trackers', categoryId: 'cat-smart-acc', name: 'Fitness Bands & Trackers', slug: 'fitness-trackers' },
  { id: 'sub-watch-bands', categoryId: 'cat-smart-acc', name: 'Smartwatch Straps & Bands', slug: 'smartwatch-bands' },

  // Men's Fashion
  { id: 'sub-mens-shirts', categoryId: 'cat-mens-fashion', name: 'Casual & Formal Shirts', slug: 'mens-shirts' },
  { id: 'sub-mens-tshirts', categoryId: 'cat-mens-fashion', name: 'T-Shirts & Polos', slug: 'mens-tshirts' },
  { id: 'sub-mens-jeans', categoryId: 'cat-mens-fashion', name: 'Jeans & Trousers', slug: 'mens-jeans' },
  { id: 'sub-mens-jackets', categoryId: 'cat-mens-fashion', name: 'Jackets & Hoodies', slug: 'mens-jackets' },

  // Women's Fashion
  { id: 'sub-womens-dresses', categoryId: 'cat-womens-fashion', name: 'Dresses & Jumpsuits', slug: 'womens-dresses' },
  { id: 'sub-womens-ethnic', categoryId: 'cat-womens-fashion', name: 'Ethnic Kurta Sets & Sarees', slug: 'womens-ethnic' },
  { id: 'sub-womens-tops', categoryId: 'cat-womens-fashion', name: 'Tops, Tees & Blouses', slug: 'womens-tops' },
  { id: 'sub-womens-bottoms', categoryId: 'cat-womens-fashion', name: 'Pants, Jeans & Skirts', slug: 'womens-bottoms' },

  // Kids Fashion
  { id: 'sub-kids-boys', categoryId: 'cat-kids-fashion', name: 'Boys Clothing', slug: 'boys-clothing' },
  { id: 'sub-kids-girls', categoryId: 'cat-kids-fashion', name: 'Girls Dresses & Sets', slug: 'girls-dresses' },
  { id: 'sub-kids-infant', categoryId: 'cat-kids-fashion', name: 'Infants & Toddlers Wear', slug: 'infants-wear' },

  // Footwear
  { id: 'sub-shoes-running', categoryId: 'cat-footwear', name: 'Running & Training Sneakers', slug: 'running-shoes' },
  { id: 'sub-shoes-casual', categoryId: 'cat-footwear', name: 'Casual Sneakers & Loafers', slug: 'casual-sneakers' },
  { id: 'sub-shoes-formal', categoryId: 'cat-footwear', name: 'Formal Leather Shoes', slug: 'formal-shoes' },
  { id: 'sub-shoes-sandals', categoryId: 'cat-footwear', name: 'Sandals & Comfort Slides', slug: 'sandals-slides' },

  // Home & Living
  { id: 'sub-bedding', categoryId: 'cat-home-living', name: 'Bed Sheets & Comforters', slug: 'bedding-comforters' },
  { id: 'sub-lighting', categoryId: 'cat-home-living', name: 'Ambient Lamps & Smart Bulbs', slug: 'ambient-lighting' },
  { id: 'sub-curtains', categoryId: 'cat-home-living', name: 'Curtains & Rugs', slug: 'curtains-rugs' },
  { id: 'sub-decor-accents', categoryId: 'cat-home-living', name: 'Vases & Wall Art', slug: 'wall-art-decor' },

  // Home Appliances
  { id: 'sub-air-purifiers', categoryId: 'cat-home-appliances', name: 'Air Purifiers & Dehumidifiers', slug: 'air-purifiers' },
  { id: 'sub-vacuums', categoryId: 'cat-home-appliances', name: 'Robot & Stick Vacuum Cleaners', slug: 'vacuum-cleaners' },
  { id: 'sub-irons', categoryId: 'cat-home-appliances', name: 'Steam Irons & Garment Steamers', slug: 'steam-irons' },

  // Kitchen & Dining
  { id: 'sub-cookware', categoryId: 'cat-kitchen', name: 'Tri-Ply Stainless Cookware', slug: 'cookware-sets' },
  { id: 'sub-appliances-small', categoryId: 'cat-kitchen', name: 'Air Fryers, Blenders & Toasters', slug: 'small-kitchen-appliances' },
  { id: 'sub-coffee-tea', categoryId: 'cat-kitchen', name: 'Espresso Makers & Kettles', slug: 'espresso-makers-kettles' },
  { id: 'sub-dinnerware', categoryId: 'cat-kitchen', name: 'Ceramic Plates & Cutlery Sets', slug: 'dinnerware-cutlery' },

  // Furniture & Decor
  { id: 'sub-chairs', categoryId: 'cat-furniture-decor', name: 'Ergonomic & Accent Chairs', slug: 'ergonomic-chairs' },
  { id: 'sub-tables', categoryId: 'cat-furniture-decor', name: 'Study & Coffee Tables', slug: 'study-coffee-tables' },
  { id: 'sub-sofas', categoryId: 'cat-furniture-decor', name: 'Sofas & Loungers', slug: 'sofas-loungers' },

  // Beauty & Personal Care
  { id: 'sub-skincare', categoryId: 'cat-beauty', name: 'Serums, Cleansers & Sunscreens', slug: 'skincare' },
  { id: 'sub-haircare', categoryId: 'cat-beauty', name: 'Hair Dryers, Stylers & Oils', slug: 'haircare-styling' },
  { id: 'sub-fragrance', categoryId: 'cat-beauty', name: 'Perfumes & Eau De Parfum', slug: 'perfumes-fragrance' },
  { id: 'sub-grooming', categoryId: 'cat-beauty', name: 'Beard Trimmers & Shavers', slug: 'beard-trimmers-grooming' },

  // Sports & Outdoors
  { id: 'sub-fitness-gear', categoryId: 'cat-sports', name: 'Dumbbells, Resistance & Yoga', slug: 'fitness-gear-yoga' },
  { id: 'sub-outdoor-camping', categoryId: 'cat-sports', name: 'Tents, Trekking & Hydration', slug: 'outdoor-camping' },
  { id: 'sub-sports-apparel', categoryId: 'cat-sports', name: 'Quick-Dry Sportswear & Shorts', slug: 'sports-apparel' },

  // Health & Wellness
  { id: 'sub-health-monitors', categoryId: 'cat-health', name: 'BP Monitors & Pulse Oximeters', slug: 'bp-monitors-health' },
  { id: 'sub-massagers', categoryId: 'cat-health', name: 'Deep Tissue Massage Guns', slug: 'massage-guns' },
  { id: 'sub-supplements', categoryId: 'cat-health', name: 'Vitamins & Protein Nutrition', slug: 'vitamins-supplements' },

  // Grocery & Gourmet
  { id: 'sub-coffee-beans', categoryId: 'cat-grocery', name: 'Gourmet Roasted Coffee & Tea', slug: 'coffee-tea-beans' },
  { id: 'sub-dry-fruits', categoryId: 'cat-grocery', name: 'Premium Nuts & Seeds', slug: 'dry-fruits-nuts' },
  { id: 'sub-gourmet-snacks', categoryId: 'cat-grocery', name: 'Artisan Chocolates & Spreads', slug: 'chocolates-spreads' },

  // Toys & Games
  { id: 'sub-building-toys', categoryId: 'cat-toys', name: 'Building Blocks & STEM Sets', slug: 'building-blocks-stem' },
  { id: 'sub-board-games', categoryId: 'cat-toys', name: 'Board Games & Strategy Cards', slug: 'board-games' },
  { id: 'sub-rc-toys', categoryId: 'cat-toys', name: 'Remote Control Cars & Drones', slug: 'rc-cars-drones' },

  // Books & Stationery
  { id: 'sub-books-fiction', categoryId: 'cat-books', name: 'Bestselling Fiction & Non-Fiction', slug: 'bestselling-books' },
  { id: 'sub-stationery-pens', categoryId: 'cat-books', name: 'Luxury Pens, Journals & Notebooks', slug: 'pens-journals' },

  // Automotive Accessories
  { id: 'sub-car-gadgets', categoryId: 'cat-automotive', name: 'Dash Cams & Phone Mounts', slug: 'dash-cams-mounts' },
  { id: 'sub-car-care', categoryId: 'cat-automotive', name: 'Tire Inflators & Car Wash Kits', slug: 'tire-inflators-cleaning' },

  // Travel & Luggage
  { id: 'sub-trolleys', categoryId: 'cat-travel', name: 'Hard-Sided Trolley Bags', slug: 'hard-sided-trolleys' },
  { id: 'sub-backpacks', categoryId: 'cat-travel', name: 'Laptop Travel Backpacks', slug: 'laptop-backpacks' },
  { id: 'sub-duffels', categoryId: 'cat-travel', name: 'Gym & Weekend Duffel Bags', slug: 'duffel-bags' },

  // Jewelry & Watches
  { id: 'sub-watches-analog', categoryId: 'cat-jewelry', name: 'Automatic & Chronograph Watches', slug: 'automatic-watches' },
  { id: 'sub-jewelry-silver', categoryId: 'cat-jewelry', name: '925 Sterling Silver Jewelry', slug: 'sterling-silver-jewelry' },

  // Pet Supplies
  { id: 'sub-pet-beds', categoryId: 'cat-pets', name: 'Orthopedic Pet Beds & Blankets', slug: 'pet-beds' },
  { id: 'sub-pet-food', categoryId: 'cat-pets', name: 'Nutritional Food & Treats', slug: 'pet-food-treats' },
  { id: 'sub-pet-toys', categoryId: 'cat-pets', name: 'Interactive Chew Toys & Collars', slug: 'pet-toys-collars' },

  // Gaming & Consoles
  { id: 'sub-controllers', categoryId: 'cat-gaming', name: 'Wireless Gamepads & Controllers', slug: 'gaming-controllers' },
  { id: 'sub-headsets-gaming', categoryId: 'cat-gaming', name: 'Surround Sound Gaming Headsets', slug: 'gaming-headsets' },
  { id: 'sub-gaming-chairs', categoryId: 'cat-gaming', name: 'RGB Gaming Chairs & Desks', slug: 'gaming-chairs-desks' },
];
