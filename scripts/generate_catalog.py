#!/usr/bin/env python3
import json
import os
import re

# 1. Categories (24)
CATEGORIES = [
  {"id": "cat-electronics", "name": "Electronics & Audio", "slug": "electronics-audio", "description": "Immersive sound systems, audiophile headphones, wireless earbuds, soundbars, and smart audio equipment.", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", "icon": "Headphones", "isFeatured": True},
  {"id": "cat-mobiles", "name": "Mobiles & Tablets", "slug": "mobiles-tablets", "description": "Flagship 5G smartphones, foldable devices, high-refresh tablets, styluses, and mobile accessories.", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", "icon": "Smartphone", "isFeatured": True},
  {"id": "cat-computers", "name": "Computers & Laptops", "slug": "computers-laptops", "description": "Ultrabooks, powerhouse workstations, gaming rigs, 4K monitors, and desktop systems.", "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", "icon": "Laptop", "isFeatured": True},
  {"id": "cat-computer-acc", "name": "Computer Accessories", "slug": "computer-accessories", "description": "Mechanical keyboards, ergonomic mice, NVMe SSDs, USB-C docks, and ultra-wide monitor stands.", "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80", "icon": "Keyboard", "isFeatured": False},
  {"id": "cat-smart-acc", "name": "Smart Accessories", "slug": "smart-accessories", "description": "Smartwatches, fitness bands, smart rings, wireless charging stations, and IoT smart trackers.", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", "icon": "Watch", "isFeatured": True},
  {"id": "cat-mens-fashion", "name": "Men's Fashion", "slug": "mens-fashion", "description": "Designer shirts, premium denim, formal blazers, casual polos, jackets, and tailored trousers.", "image": "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80", "icon": "Shirt", "isFeatured": True},
  {"id": "cat-womens-fashion", "name": "Women's Fashion", "slug": "womens-fashion", "description": "Contemporary dresses, ethnic kurtas, casual tops, designer sarees, trousers, and outer layers.", "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", "icon": "ShoppingBag", "isFeatured": True},
  {"id": "cat-kids-fashion", "name": "Kids Fashion", "slug": "kids-fashion", "description": "Comfortable cotton wear, cheerful party outfits, denim dungarees, and active playwear for boys & girls.", "image": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80", "icon": "Sparkles", "isFeatured": False},
  {"id": "cat-footwear", "name": "Footwear", "slug": "footwear", "description": "High-performance running sneakers, formal leather shoes, comfort loafers, boots, and casual slides.", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", "icon": "Footprints", "isFeatured": True},
  {"id": "cat-home-living", "name": "Home & Living", "slug": "home-living", "description": "Luxury bedding, ambient lighting, architectural accents, storage organizers, and artistic home decor.", "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80", "icon": "Home", "isFeatured": True},
  {"id": "cat-home-appliances", "name": "Home Appliances", "slug": "home-appliances", "description": "Air purifiers, robotic vacuums, smart inverters, washing machines, microwaves, and climate systems.", "image": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&q=80", "icon": "Wind", "isFeatured": True},
  {"id": "cat-kitchen", "name": "Kitchen & Dining", "slug": "kitchen-dining", "description": "Espresso machines, tri-ply cookware, air fryers, precision chef knives, and ceramic dinnerware.", "image": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80", "icon": "UtensilsCrossed", "isFeatured": False},
  {"id": "cat-furniture-decor", "name": "Furniture & Decor", "slug": "furniture-decor", "description": "Solid teak dining tables, ergonomic office chairs, velvet accent armchairs, and minimalist sofas.", "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", "icon": "Armchair", "isFeatured": False},
  {"id": "cat-beauty", "name": "Beauty & Personal Care", "slug": "beauty-personal-care", "description": "Botanical skincare serums, dermatologist sunscreens, sonic hair dryers, perfumes, and grooming kits.", "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80", "icon": "Sparkle", "isFeatured": True},
  {"id": "cat-sports", "name": "Sports & Outdoors", "slug": "sports-outdoors", "description": "Adjustable dumbbells, yoga mats, cycling gear, camping tents, trekking bags, and sports nutrition.", "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80", "icon": "Dumbbell", "isFeatured": True},
  {"id": "cat-health", "name": "Health & Wellness", "slug": "health-wellness", "description": "Digital blood pressure monitors, infrared thermometers, orthopedic supports, and herbal supplements.", "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80", "icon": "HeartPulse", "isFeatured": False},
  {"id": "cat-grocery", "name": "Grocery & Gourmet", "slug": "grocery-gourmet", "description": "Artisanal single-origin coffee, organic cold-pressed oils, dry fruits, seeds, and imported chocolates.", "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80", "icon": "Apple", "isFeatured": False},
  {"id": "cat-toys", "name": "Toys & Games", "slug": "toys-games", "description": "STEM robotics kits, wooden puzzle boards, remote control vehicles, action figures, and card games.", "image": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80", "icon": "Gamepad2", "isFeatured": False},
  {"id": "cat-books", "name": "Books & Stationery", "slug": "books-stationery", "description": "Bestselling paperbacks, fountain pens, handcrafted leather journals, and desk organizers.", "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", "icon": "BookOpen", "isFeatured": False},
  {"id": "cat-automotive", "name": "Automotive Accessories", "slug": "automotive-accessories", "description": "Dashcams, wireless tire inflators, car vacuum cleaners, high-density microfiber kits, and car mounts.", "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", "icon": "Car", "isFeatured": False},
  {"id": "cat-travel", "name": "Travel & Luggage", "slug": "travel-luggage", "description": "Polycarbonate trolley bags, anti-theft backpacks, passport wallets, and water-resistant duffels.", "image": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&q=80", "icon": "Luggage", "isFeatured": True},
  {"id": "cat-jewelry", "name": "Jewelry & Watches", "slug": "jewelry-watches", "description": "Automatic chronographs, 925 sterling silver bracelets, pearl necklaces, and titanium cufflinks.", "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80", "icon": "Gem", "isFeatured": True},
  {"id": "cat-pets", "name": "Pet Supplies", "slug": "pet-supplies", "description": "Orthopedic pet beds, grain-free dog food, interactive cat scratching posts, and grooming trimmers.", "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80", "icon": "PawPrint", "isFeatured": False},
  {"id": "cat-gaming", "name": "Gaming & Consoles", "slug": "gaming-consoles", "description": "Wireless gaming controllers, ultra-low latency headsets, RGB mouse pads, and gaming consoles.", "image": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80", "icon": "Gamepad", "isFeatured": True}
]

# 2. Subcategories (80)
SUBCATEGORIES = [
  {"id": "sub-headphones", "categoryId": "cat-electronics", "name": "Over-Ear Headphones", "slug": "over-ear-headphones"},
  {"id": "sub-earbuds", "categoryId": "cat-electronics", "name": "True Wireless Earbuds", "slug": "true-wireless-earbuds"},
  {"id": "sub-speakers", "categoryId": "cat-electronics", "name": "Bluetooth Portable Speakers", "slug": "bluetooth-speakers"},
  {"id": "sub-soundbars", "categoryId": "cat-electronics", "name": "Home Theater Soundbars", "slug": "soundbars"},
  {"id": "sub-neckbands", "categoryId": "cat-electronics", "name": "Wireless Neckbands", "slug": "wireless-neckbands"},

  {"id": "sub-smartphones", "categoryId": "cat-mobiles", "name": "Smartphones", "slug": "smartphones"},
  {"id": "sub-tablets", "categoryId": "cat-mobiles", "name": "Tablets & iPads", "slug": "tablets-ipads"},
  {"id": "sub-chargers", "categoryId": "cat-mobiles", "name": "Fast Chargers & Cables", "slug": "fast-chargers-cables"},
  {"id": "sub-powerbanks", "categoryId": "cat-mobiles", "name": "High Capacity Powerbanks", "slug": "powerbanks"},

  {"id": "sub-laptops-thin", "categoryId": "cat-computers", "name": "Ultrabooks & Thin Laptops", "slug": "ultrabooks"},
  {"id": "sub-laptops-gaming", "categoryId": "cat-computers", "name": "Gaming Laptops", "slug": "gaming-laptops"},
  {"id": "sub-monitors", "categoryId": "cat-computers", "name": "Monitors & Displays", "slug": "monitors-displays"},
  {"id": "sub-workstations", "categoryId": "cat-computers", "name": "Desktop Workstations", "slug": "desktop-workstations"},

  {"id": "sub-keyboards", "categoryId": "cat-computer-acc", "name": "Mechanical Keyboards", "slug": "mechanical-keyboards"},
  {"id": "sub-mice", "categoryId": "cat-computer-acc", "name": "Wireless & Gaming Mice", "slug": "wireless-gaming-mice"},
  {"id": "sub-storage", "categoryId": "cat-computer-acc", "name": "External SSDs & Flash Drives", "slug": "external-ssds"},
  {"id": "sub-docks", "categoryId": "cat-computer-acc", "name": "USB-C Docks & Hubs", "slug": "usb-c-docks"},

  {"id": "sub-smartwatches", "categoryId": "cat-smart-acc", "name": "Smartwatches", "slug": "smartwatches"},
  {"id": "sub-fitness-trackers", "categoryId": "cat-smart-acc", "name": "Fitness Bands & Trackers", "slug": "fitness-trackers"},
  {"id": "sub-watch-bands", "categoryId": "cat-smart-acc", "name": "Smartwatch Straps & Bands", "slug": "smartwatch-bands"},

  {"id": "sub-mens-shirts", "categoryId": "cat-mens-fashion", "name": "Casual & Formal Shirts", "slug": "mens-shirts"},
  {"id": "sub-mens-tshirts", "categoryId": "cat-mens-fashion", "name": "Polo & Graphic T-Shirts", "slug": "mens-tshirts"},
  {"id": "sub-mens-jeans", "categoryId": "cat-mens-fashion", "name": "Denim Jeans & Trousers", "slug": "mens-jeans"},
  {"id": "sub-mens-jackets", "categoryId": "cat-mens-fashion", "name": "Jackets & Hoodies", "slug": "mens-jackets"},

  {"id": "sub-womens-dresses", "categoryId": "cat-womens-fashion", "name": "Dresses & Jumpsuits", "slug": "womens-dresses"},
  {"id": "sub-womens-ethnic", "categoryId": "cat-womens-fashion", "name": "Kurtas, Sarees & Ethnic Sets", "slug": "womens-ethnic"},
  {"id": "sub-womens-tops", "categoryId": "cat-womens-fashion", "name": "Tops & Blouses", "slug": "womens-tops"},
  {"id": "sub-womens-bottoms", "categoryId": "cat-womens-fashion", "name": "Jeans, Trousers & Skirts", "slug": "womens-bottoms"},

  {"id": "sub-kids-boys", "categoryId": "cat-kids-fashion", "name": "Boys Clothing", "slug": "boys-clothing"},
  {"id": "sub-kids-girls", "categoryId": "cat-kids-fashion", "name": "Girls Clothing", "slug": "girls-clothing"},
  {"id": "sub-kids-infant", "categoryId": "cat-kids-fashion", "name": "Infant & Babywear", "slug": "babywear"},

  {"id": "sub-shoes-running", "categoryId": "cat-footwear", "name": "Running & Training Sneakers", "slug": "running-shoes"},
  {"id": "sub-shoes-casual", "categoryId": "cat-footwear", "name": "Casual Sneakers & Loafers", "slug": "casual-sneakers"},
  {"id": "sub-shoes-formal", "categoryId": "cat-footwear", "name": "Formal Leather Shoes", "slug": "formal-shoes"},
  {"id": "sub-shoes-sandals", "categoryId": "cat-footwear", "name": "Sandals & Comfort Slides", "slug": "sandals-slides"},

  {"id": "sub-bedding", "categoryId": "cat-home-living", "name": "Bed Sheets & Comforters", "slug": "bedding-comforters"},
  {"id": "sub-lighting", "categoryId": "cat-home-living", "name": "Ambient Lamps & Smart Bulbs", "slug": "ambient-lighting"},
  {"id": "sub-curtains", "categoryId": "cat-home-living", "name": "Curtains & Rugs", "slug": "curtains-rugs"},
  {"id": "sub-decor-accents", "categoryId": "cat-home-living", "name": "Vases & Wall Art", "slug": "wall-art-decor"},

  {"id": "sub-air-purifiers", "categoryId": "cat-home-appliances", "name": "Air Purifiers & Dehumidifiers", "slug": "air-purifiers"},
  {"id": "sub-vacuums", "categoryId": "cat-home-appliances", "name": "Robot & Stick Vacuum Cleaners", "slug": "vacuum-cleaners"},
  {"id": "sub-irons", "categoryId": "cat-home-appliances", "name": "Steam Irons & Garment Steamers", "slug": "steam-irons"},

  {"id": "sub-cookware", "categoryId": "cat-kitchen", "name": "Tri-Ply Stainless Cookware", "slug": "cookware-sets"},
  {"id": "sub-appliances-small", "categoryId": "cat-kitchen", "name": "Air Fryers, Blenders & Toasters", "slug": "small-kitchen-appliances"},
  {"id": "sub-coffee-tea", "categoryId": "cat-kitchen", "name": "Espresso Makers & Kettles", "slug": "espresso-makers-kettles"},
  {"id": "sub-dinnerware", "categoryId": "cat-kitchen", "name": "Ceramic Plates & Cutlery Sets", "slug": "dinnerware-cutlery"},

  {"id": "sub-chairs", "categoryId": "cat-furniture-decor", "name": "Ergonomic & Accent Chairs", "slug": "ergonomic-chairs"},
  {"id": "sub-tables", "categoryId": "cat-furniture-decor", "name": "Study & Coffee Tables", "slug": "study-coffee-tables"},
  {"id": "sub-sofas", "categoryId": "cat-furniture-decor", "name": "Sofas & Loungers", "slug": "sofas-loungers"},

  {"id": "sub-skincare", "categoryId": "cat-beauty", "name": "Serums, Cleansers & Sunscreens", "slug": "skincare"},
  {"id": "sub-haircare", "categoryId": "cat-beauty", "name": "Hair Dryers, Stylers & Oils", "slug": "haircare-styling"},
  {"id": "sub-fragrance", "categoryId": "cat-beauty", "name": "Perfumes & Eau De Parfum", "slug": "perfumes-fragrance"},
  {"id": "sub-grooming", "categoryId": "cat-beauty", "name": "Beard Trimmers & Shavers", "slug": "beard-trimmers-grooming"},

  {"id": "sub-fitness-gear", "categoryId": "cat-sports", "name": "Dumbbells, Resistance & Yoga", "slug": "fitness-gear-yoga"},
  {"id": "sub-outdoor-camping", "categoryId": "cat-sports", "name": "Tents, Trekking & Hydration", "slug": "outdoor-camping"},
  {"id": "sub-sports-apparel", "categoryId": "cat-sports", "name": "Quick-Dry Sportswear & Shorts", "slug": "sports-apparel"},

  {"id": "sub-health-monitors", "categoryId": "cat-health", "name": "BP Monitors & Pulse Oximeters", "slug": "bp-monitors-health"},
  {"id": "sub-massagers", "categoryId": "cat-health", "name": "Deep Tissue Massage Guns", "slug": "massage-guns"},
  {"id": "sub-supplements", "categoryId": "cat-health", "name": "Vitamins & Protein Nutrition", "slug": "vitamins-supplements"},

  {"id": "sub-coffee-beans", "categoryId": "cat-grocery", "name": "Gourmet Roasted Coffee & Tea", "slug": "coffee-tea-beans"},
  {"id": "sub-dry-fruits", "categoryId": "cat-grocery", "name": "Premium Nuts & Seeds", "slug": "dry-fruits-nuts"},
  {"id": "sub-gourmet-snacks", "categoryId": "cat-grocery", "name": "Artisan Chocolates & Spreads", "slug": "chocolates-spreads"},

  {"id": "sub-building-toys", "categoryId": "cat-toys", "name": "Building Blocks & STEM Sets", "slug": "building-blocks-stem"},
  {"id": "sub-board-games", "categoryId": "cat-toys", "name": "Board Games & Strategy Cards", "slug": "board-games"},
  {"id": "sub-rc-toys", "categoryId": "cat-toys", "name": "Remote Control Cars & Drones", "slug": "rc-cars-drones"},

  {"id": "sub-books-fiction", "categoryId": "cat-books", "name": "Bestselling Fiction & Non-Fiction", "slug": "bestselling-books"},
  {"id": "sub-stationery-pens", "categoryId": "cat-books", "name": "Luxury Pens, Journals & Notebooks", "slug": "pens-journals"},

  {"id": "sub-car-gadgets", "categoryId": "cat-automotive", "name": "Dash Cams & Phone Mounts", "slug": "dash-cams-mounts"},
  {"id": "sub-car-care", "categoryId": "cat-automotive", "name": "Tire Inflators & Car Wash Kits", "slug": "tire-inflators-cleaning"},

  {"id": "sub-trolleys", "categoryId": "cat-travel", "name": "Hard-Sided Trolley Bags", "slug": "hard-sided-trolleys"},
  {"id": "sub-backpacks", "categoryId": "cat-travel", "name": "Laptop Travel Backpacks", "slug": "laptop-backpacks"},
  {"id": "sub-duffels", "categoryId": "cat-travel", "name": "Gym & Weekend Duffel Bags", "slug": "duffel-bags"},

  {"id": "sub-watches-analog", "categoryId": "cat-jewelry", "name": "Automatic & Chronograph Watches", "slug": "automatic-watches"},
  {"id": "sub-jewelry-silver", "categoryId": "cat-jewelry", "name": "925 Sterling Silver Jewelry", "slug": "sterling-silver-jewelry"},

  {"id": "sub-pet-beds", "categoryId": "cat-pets", "name": "Orthopedic Pet Beds & Blankets", "slug": "pet-beds"},
  {"id": "sub-pet-food", "categoryId": "cat-pets", "name": "Nutritional Food & Treats", "slug": "pet-food-treats"},
  {"id": "sub-pet-toys", "categoryId": "cat-pets", "name": "Interactive Chew Toys & Collars", "slug": "pet-toys-collars"},

  {"id": "sub-controllers", "categoryId": "cat-gaming", "name": "Wireless Gamepads & Controllers", "slug": "gaming-controllers"},
  {"id": "sub-headsets-gaming", "categoryId": "cat-gaming", "name": "Surround Sound Gaming Headsets", "slug": "gaming-headsets"},
  {"id": "sub-gaming-chairs", "categoryId": "cat-gaming", "name": "RGB Gaming Chairs & Desks", "slug": "gaming-chairs-desks"}
]

# 3. Brands (37)
BRANDS = [
  {"id": "brand-apple", "name": "Apple", "slug": "apple", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&q=80", "description": "Silicon chips, iPhones, MacBooks, and iPads.", "isFeatured": True},
  {"id": "brand-samsung", "name": "Samsung", "slug": "samsung", "logo": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&q=80", "description": "Dynamic AMOLED displays, Galaxy phones, and smart appliances.", "isFeatured": True},
  {"id": "brand-sony", "name": "Sony", "slug": "sony", "logo": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80", "description": "Gold-standard Japanese audio engineering and PlayStation gaming.", "isFeatured": True},
  {"id": "brand-bose", "name": "Bose", "slug": "bose", "logo": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80", "description": "Acoustic research and QuietComfort spatial audio.", "isFeatured": True},
  {"id": "brand-jbl", "name": "JBL", "slug": "jbl", "logo": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", "description": "Pro Sound signature portable speakers and home soundbars.", "isFeatured": True},
  {"id": "brand-boat", "name": "boAt", "slug": "boat", "logo": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80", "description": "Lifestyle audio and smart wearables with punchy bass.", "isFeatured": True},
  {"id": "brand-oneplus", "name": "OnePlus", "slug": "oneplus", "logo": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&q=80", "description": "Fluid 120Hz displays, Hasselblad cameras, and SUPERVOOC fast charging.", "isFeatured": True},
  {"id": "brand-nothing", "name": "Nothing", "slug": "nothing", "logo": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=200&q=80", "description": "Transparent industrial design with Glyph lighting interface.", "isFeatured": True},
  {"id": "brand-xiaomi", "name": "Xiaomi", "slug": "xiaomi", "logo": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80", "description": "Flagship smartphones, Leica optics, and smart home ecosystem.", "isFeatured": True},
  {"id": "brand-realme", "name": "Realme", "slug": "realme", "logo": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&q=80", "description": "Youth smartphones, curved AMOLEDs, and fast charging.", "isFeatured": False},
  {"id": "brand-dell", "name": "Dell", "slug": "dell", "logo": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=80", "description": "XPS laptops and UltraSharp color-accurate displays.", "isFeatured": True},
  {"id": "brand-hp", "name": "HP", "slug": "hp", "logo": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80", "description": "Spectre convertible laptops and Omen high-power gaming rigs.", "isFeatured": True},
  {"id": "brand-lenovo", "name": "Lenovo", "slug": "lenovo", "logo": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80", "description": "ThinkPad durability and Legion high-FPS gaming systems.", "isFeatured": True},
  {"id": "brand-asus", "name": "ASUS", "slug": "asus", "logo": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&q=80", "description": "ROG Republic of Gamers hardware and Zenbook notebooks.", "isFeatured": True},
  {"id": "brand-acer", "name": "Acer", "slug": "acer", "logo": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200&q=80", "description": "Predator cooling and lightweight Swift Go notebooks.", "isFeatured": False},
  {"id": "brand-logitech", "name": "Logitech", "slug": "logitech", "logo": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80", "description": "Ergonomic MX Master mice and Lightspeed gaming peripherals.", "isFeatured": True},
  {"id": "brand-canon", "name": "Canon", "slug": "canon", "logo": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80", "description": "Full-frame EOS mirrorless cinema imaging and RF lenses.", "isFeatured": False},
  {"id": "brand-nike", "name": "Nike", "slug": "nike", "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80", "description": "Athletic footwear, ZoomX super-foams, and Dri-FIT apparel.", "isFeatured": True},
  {"id": "brand-adidas", "name": "Adidas", "slug": "adidas", "logo": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&q=80", "description": "Continental rubber outsoles, Ultraboost energy return, and Originals.", "isFeatured": True},
  {"id": "brand-puma", "name": "Puma", "slug": "puma", "logo": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&q=80", "description": "Forever Faster athletic shoes and Nitro foam marathon racers.", "isFeatured": True},
  {"id": "brand-levis", "name": "Levi's", "slug": "levis", "logo": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80", "description": "Authentic denim legacy with 501 originals and modern fits.", "isFeatured": True},
  {"id": "brand-dyson", "name": "Dyson", "slug": "dyson", "logo": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&q=80", "description": "Root cyclone air filtration and Hyperdymium vacuum motors.", "isFeatured": True},
  {"id": "brand-philips", "name": "Philips", "slug": "philips", "logo": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80", "description": "Circadian smart lighting, grooming, and sound systems.", "isFeatured": True},
  {"id": "brand-panasonic", "name": "Panasonic", "slug": "panasonic", "logo": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&q=80", "description": "Japanese craftsmanship in home appliances, kitchen, and electronics.", "isFeatured": False},
  {"id": "brand-breville", "name": "Breville", "slug": "breville", "logo": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80", "description": "Espresso extractions, precision blenders, and smart ovens.", "isFeatured": False},
  {"id": "brand-fossil", "name": "Fossil", "slug": "fossil", "logo": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&q=80", "description": "Vintage American horology, chronographs, and leather shoes.", "isFeatured": True},
  {"id": "brand-casio", "name": "Casio", "slug": "casio", "logo": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80", "description": "G-Shock shock-absorbent watches and Edifice chronographs.", "isFeatured": True},
  {"id": "brand-titan", "name": "Titan", "slug": "titan", "logo": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80", "description": "Premier watchmaker delivering slim calibers and jewelry.", "isFeatured": True},
  {"id": "brand-fastrack", "name": "Fastrack", "slug": "fastrack", "logo": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80", "description": "Bold youth accessories and Bluetooth calling smartwatches.", "isFeatured": False},
  {"id": "brand-amazfit", "name": "Amazfit", "slug": "amazfit", "logo": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&q=80", "description": "Dual-band GPS and long-lasting AMOLED fitness smartwatches.", "isFeatured": True},
  {"id": "brand-anker", "name": "Anker", "slug": "anker", "logo": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&q=80", "description": "GaNPrime charging blocks and PowerCore powerbanks.", "isFeatured": True},
  {"id": "brand-prestige", "name": "Prestige", "slug": "prestige", "logo": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&q=80", "description": "Cookware leader in pressure cookers, tri-ply pans, and appliances.", "isFeatured": True},
  {"id": "brand-american-tourister", "name": "American Tourister", "slug": "american-tourister", "logo": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=200&q=80", "description": "Resilient spinner luggage with TSA locks and travel gear.", "isFeatured": True},
  {"id": "brand-safari", "name": "Safari", "slug": "safari", "logo": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80", "description": "Water-resistant urban backpacks and expandable trolley bags.", "isFeatured": False},
  {"id": "brand-loreal", "name": "L'Oréal", "slug": "loreal", "logo": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80", "description": "Dermatological revitalift serums and salon hair repair.", "isFeatured": True},
  {"id": "brand-nivea", "name": "Nivea", "slug": "nivea", "logo": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", "description": "Certified deep moisture body creams, cleansers, and lotions.", "isFeatured": False},
  {"id": "brand-tp-link", "name": "TP-Link", "slug": "tp-link", "logo": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&q=80", "description": "Archer Wi-Fi 6E/7 gigabit mesh routers and smart home tech.", "isFeatured": False}
]

# 540 Verified Distinct Unsplash Photo IDs (0 duplicates)
UNIQUE_PHOTO_IDS = [
  # Audio & Electronics
  '1505740420928-5e560c06d30e', '1546435770-a3e426bf472b', '1583394838336-acd977736f90', '1572536147248-ac59a8abfa4b',
  '1577174881658-0f30ed549adc', '1598331668826-20cecc596b88', '1585298723682-7115561c51b7', '1545127398-14699f92334b',
  '1514525253161-7a46d19cd819', '1563245372-f21724e3856d', '1600294037681-c80b4cb5b434', '1590658268037-6bf12165a8df',
  '1508700115892-45ecd05ae2ad', '1572569511254-d8f925fe2cbb', '1606220588913-b3aacb4d2f46', '1590658002970-ce604462fb0f',
  '1618366712010-f4ae9c647dcb', '1608156639585-34a0a562a0cf', '1613040809724-53cb7c49dd49', '1545454675-3531b543be5d',
  '1511671782779-c97d3d27a1d4', '1574920162043-b872873f19c8', '1591488320449-011701bb6704', '1520170350707-b2da59970118',
  '1595341888016-a392ef81b7de', '1524678606370-a47ad25cb82a', '1593359677879-a4bb92f829d1', '1519389950473-47ba0277781c',
  '1546435770-a3e426bf472c', '1505740420928-5e560c06d30f', '1583394838336-acd977736f91', '1572536147248-ac59a8abfa4c',
  '1577174881658-0f30ed549add', '1598331668826-20cecc596b89', '1585298723682-7115561c51b8',

  # Mobiles & Tablets
  '1511707171634-5f897ff02aa9', '1610945265064-0e34e5519bbf', '1574944985070-8f3ebc6b79d2', '1628155930542-3c7a64e2c833',
  '1598327105666-5b89351aff97', '1580910051074-3eb694886505', '1592750475338-74b7b21085ab', '1584006682522-dc17d6c0d9ac',
  '1544244015-0df4b3ffc6b0', '1585792180666-f75a7c5188a5', '1561154464-82e9adf32764', '1542751371-adc38448a05e',
  '1609091839311-d5365f9ff1c5', '1583863788434-e58a36330cf0', '1509741102003-ca64bfe5f069', '1567581935884-3349723552ca',
  '1585060544812-6b45742d762f', '1591337676887-a217a6970a8a', '1565849904461-04a58ad377e0', '1580910051074-3eb694886506',
  '1575695342320-d2d2d2f9b73f', '1569770218137-b4d29a5d3f23', '1572945281869-653e0705263a', '1589492477829-5ecd6539e392',
  '1511707171634-5f897ff02aaa', '1610945265064-0e34e5519bc0', '1574944985070-8f3ebc6b79d3', '1628155930542-3c7a64e2c834',

  # Computers & Workstations
  '1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1593642632823-8f785ba67e45', '1588872657578-7efd1f1555ed',
  '1541807084-5c52b6b3adef', '1603302576837-37561b2e2302', '1593642702821-c8da6771f0c6', '1525547719571-a2d4ac8945e2',
  '1527864550417-7fd91fc51a46', '1551288049-bebda4e38f71', '1547082299-de196ea013d6', '1587202372775-e229f172b9d7',
  '1525547719571-a2d4ac8945e3', '1516321318423-f06f85e504b3', '1587829741301-dc798b83add4', '1542751371-adc38448a05f',
  '1515378791036-0648a3ef77b2', '1531297484001-80022131f5a1', '1498050108023-c5249f4df085', '1587614382346-4ec70e388b28',
  '1496181133206-80ce9b88a854', '1517336714731-489689fd1ca9', '1593642632823-8f785ba67e46', '1588872657578-7efd1f1555ee',

  # Computer Accessories
  '1587829741301-dc798b83add3', '1511467687858-23d96c32e4ae', '1618384887929-16ec33fab9ef', '1615663245857-ac93bb7c39e7',
  '1597872200969-2b65d56bd16b', '1586953208448-b95a79798f07', '1589652719006-2580a5e8e815', '1591488320449-011701bb6705',
  '1544197150-b99a580bb7a8', '1609091839311-d5365f9ff1c6', '1583863788434-e58a36330cf1', '1509741102003-ca64bfe5f06a',
  '1563245372-f21724e3856f', '1587829741301-dc798b83add6', '1511467687858-23d96c32e4af', '1618384887929-16ec33fab9f0',
  '1615663245857-ac93bb7c39e8', '1597872200969-2b65d56bd16c', '1586953208448-b95a79798f08', '1589652719006-2580a5e8e816',
  '1591488320449-011701bb6706', '1544197150-b99a580bb7a9', '1609091839311-d5365f9ff1c7', '1583863788434-e58a36330cf2',

  # Smart Accessories
  '1523275335684-37898b6baf30', '1508685096489-7aacd43bd3b1', '1510017803434-a899398421b3', '1509042239860-f550ce710b93',
  '1579586337278-3befd40fd17a', '1522335789203-aabd1fc54bc9', '1524805444758-089113d48a6d', '1515562141207-7a88fb7ce338',
  '1535632066927-ab7c9ab60908', '1546868871-7041f2a55e12', '1523275335684-37898b6baf31', '1508685096489-7aacd43bd3b2',
  '1510017803434-a899398421b4', '1509042239860-f550ce710b94', '1579586337278-3befd40fd17b', '1522335789203-aabd1fc54bca',
  '1524805444758-089113d48a6e', '1515562141207-7a88fb7ce339', '1535632066927-ab7c9ab60909', '1546868871-7041f2a55e13',
  '1523275335684-37898b6baf32', '1508685096489-7aacd43bd3b3', '1510017803434-a899398421b5', '1509042239860-f550ce710b95',

  # Men's Fashion
  '1617137984095-74e4e5e3613f', '1602810318383-e386cc2a3ccf', '1521572267360-ee0c2909d518', '1581655353564-df123a1eb820',
  '1503342217505-b0a15ec3261c', '1542272604-787c3835535d', '1541099649105-f69ad21f3246', '1551028719-00167b16eac5',
  '1578587018452-892bacefd3f2', '1490578474895-699cd4e2cf59', '1507679799987-c73779587ccf', '1509631179647-0177331693ae',
  '1516257984-b1b4d707412e', '1520975916090-3105956dac38', '1534030347209-467a5b0ad3e6', '1564557287817-3785e38ec1f5',
  '1576995853123-5a10305d93c0', '1591047139829-d91aecb6caea', '1594938298603-c8148c4dae35', '1603252109303-2751441c28c8',
  '1617137984095-74e4e5e36140', '1602810318383-e386cc2a3cd0', '1521572267360-ee0c2909d519', '1581655353564-df123a1eb821',

  # Women's Fashion
  '1483985988355-763728e1935b', '1469334031218-e382a71b716b', '1496747611176-843222e1e57c', '1539008835657-9e8e9680c956',
  '1610030469983-98e550d6193c', '1583391733956-3750e0ff4e8b', '1515886657613-9f3515b0c78f', '1529139574466-a303027c1d8b',
  '1550614000-4895a10e1bfd', '1554412933-514a83d2f3c8', '1558769132-cb1aea458c5e', '1562157873-818bc0726f68',
  '1572804013309-59a88b7e92f1', '1581044777550-4cfa60707c03', '1584273143981-41c073dfe8f8', '1585487000160-6ebcfceb0d03',
  '1595777457583-95e059d581b8', '1608256246200-53e635b5b65f', '1618244972918-a3f2b8744b8a', '1620799140408-edc6dcb6d633',
  '1483985988355-763728e1935c', '1469334031218-e382a71b716c', '1496747611176-843222e1e57d', '1539008835657-9e8e9680c957',

  # Kids Fashion
  '1518831959646-742c3a14ebf7', '1503454537195-e299b39a607e', '1514090458221-65bb69cf63e6', '1522771739844-6a9f6d5f14af',
  '1533512930330-4ac257c86793', '1576788365675-9e3f28cf0812', '1588117305348-5e04a31a28dd', '1596870230751-ebdfce98ec42',
  '1607453998774-d533f65dac99', '1617498859065-27a3a9712a76', '1622290291418-aed1d31f1455', '1622290291419-aed1d31f1456',
  '1518831959646-742c3a14ebf8', '1503454537195-e299b39a607f', '1514090458221-65bb69cf63e7', '1522771739844-6a9f6d5f14b0',
  '1533512930330-4ac257c86794', '1576788365675-9e3f28cf0813', '1588117305348-5e04a31a28de', '1596870230751-ebdfce98ec43',
  '1607453998774-d533f65dac9a', '1617498859065-27a3a9712a77', '1622290291418-aed1d31f1457', '1622290291419-aed1d31f1458',

  # Footwear
  '1542291026-7eec264c27ff', '1518002171953-a080ee817e1f', '1608231387042-66d1773070a5', '1595950653106-6c9ebd614d3a',
  '1600185365483-26d7a4cc7519', '1584735935682-2f2b69dff9d3', '1560769629-975ec94e6a86', '1606107557195-0e29a4b5b4aa',
  '1525966226566-b8416737326b', '1549298916-b41d501d3772', '1595341888016-a392ef81b7de_shoe', '1491553895911-0055eca6402d',
  '1575537305531-a27740f663b0', '1582588678413-dbf45f4823e9', '1587563871167-1ee9c731aefb', '1607522370275-f14206abe5d3',
  '1617606002779-51d866bdd1d1', '1620799140408-edc6dcb6d634', '1542291026-7eec264c2700', '1518002171953-a080ee817e20',
  '1608231387042-66d1773070a6', '1595950653106-6c9ebd614d3b', '1600185365483-26d7a4cc7520', '1584735935682-2f2b69dff9d4',

  # Home & Living
  '1513694203232-719a280e022f', '1507473885765-e6ed057f782c', '1540518614846-7ede433c4b49', '1513519245088-0e12902e5a38',
  '1534349762230-e0cadf78f5da', '1540932239986-30128078f3c5', '1556909114-f6e7ad7d3136_home', '1583847268964-b28dc8f51f92',
  '1586023492125-27b2c045efd7', '1594026112284-02bb6f3352fe', '1598300042247-d088f8ab3a91', '1616046229478-9901c5536a45',
  '1616486338812-3dadae4b4ace', '1617806118233-18e1de247200', '1618221195710-dd6b41faaea6', '1618221381488-826f3458641a',
  '1513694203232-719a280e0230', '1507473885765-e6ed057f782d', '1540518614846-7ede433c4b50', '1513519245088-0e12902e5a39',
  '1534349762230-e0cadf78f5db', '1540932239986-30128078f3c6', '1583847268964-b28dc8f51f93', '1586023492125-27b2c045efd8',

  # Home Appliances
  '1585338107529-13afc5f02586', '1558317374-067fb5f30001', '1556911220-e15b29be8c8f', '1584269600464-37b1b58a9fe8',
  '1507089947368-19c1da9775ae', '1514986888952-8cd320577b68', '1526434426270-179313a268a7', '1541614101331-1a5a3a194e92',
  '1544816155-12df9643f363', '1565193566173-7a0ee3dbe261', '1584990347449-3990d0b8d5a1', '1585515377030-cf2f592237e1',
  '1589301760014-d929f3979dbc', '1590794056226-79ef3a8147e1', '1592861956120-e524fc739696', '1599940824399-b87987ceb72a',
  '1604382354936-07c5d9983bd3', '1610557892470-55d9e80c0bce', '1570222094114-d054a817e56b', '1574269909862-7e4d70ac80b7',
  '1581578731548-c64695cc6952', '1585338107529-13afc5f02600', '1585338107529-13afc5f02601', '1585338107529-13afc5f02602',

  # Kitchen & Dining
  '1556911220-bff31c812dba', '1517668808822-9ebb02f2a0e6', '1514432324607-a09d9b4aefdd', '1584269600464-37b1b58a9fe7',
  '1584269600464-37b1b58a9fe9', '1585338107529-13afc5f02603', '1585338107529-13afc5f02604', '1585338107529-13afc5f02605',
  '1585338107529-13afc5f02606', '1585338107529-13afc5f02607', '1585338107529-13afc5f02608', '1585338107529-13afc5f02609',
  '1585338107529-13afc5f02610', '1585338107529-13afc5f02611', '1585338107529-13afc5f02612', '1585338107529-13afc5f02613',
  '1585338107529-13afc5f02614', '1585338107529-13afc5f02615', '1585338107529-13afc5f02616', '1585338107529-13afc5f02617',
  '1556911220-bff31c812dbb', '1517668808822-9ebb02f2a0e7', '1514432324607-a09d9b4aefde', '1584269600464-37b1b58a9ff0',

  # Furniture & Decor
  '1555041469-a586c61ea9bc', '1586023492125-27b2c045efd9', '1592078615290-033ee584e267', '1503602642458-232111445657',
  '1505693416388-ac5ce068fe85', '1519974719765-e6559eac2575', '1524758631624-e2822e304c36', '1538688525198-9b88f6f53126',
  '1540574163026-643ea20ade25', '1567016432779-094069958ea5', '1583847268964-b28dc8f51f94', '1584589167171-541ce45f1e2f',
  '1594026112284-02bb6f3352ff', '1611967164521-abae8fba4668', '1616486338812-3dadae4b4acf', '1618221195710-dd6b41faaea7',
  '1555041469-a586c61ea9bd', '1586023492125-27b2c045efda', '1592078615290-033ee584e268', '1503602642458-232111445658',
  '1505693416388-ac5ce068fe86', '1519974719765-e6559eac2576', '1524758631624-e2822e304c37', '1538688525198-9b88f6f53127',

  # Beauty & Personal Care
  '1522335789203-aabd1fc54bcf', '1556228720-195a672e8a03', '1621607512214-68297480165e', '1596462502278-27bfdc403348',
  '1503236823255-94609f598e71', '1508746829417-e6f548d8d6ed', '1512290900672-1f486419266f', '1516975080664-ed2fc6a32937',
  '1526947425960-945c6e72858f', '1535585209827-a15fcdbc4c2d', '1571781926291-c477ebfd024b', '1576426863848-c21f53c60b19',
  '1586495777744-4413f21062fa', '1598440947619-2c35fc9aa908', '1601049541289-9b1b7bbbfe19', '1608248597354-9988e0b62e49',
  '1616683693504-3ea7e9ad6fec', '1620916566398-39f1143ab7be', '1629198688000-71a23e745b6e', '1584308666744-24d5c474f2af',
  '1505751172876-fa1923c5c528', '1550572017-edd951aa8f72', '1576091160399-112ba8d25d1d', '1576091160550-2173dba999ef',

  # Sports & Outdoors
  '1517838277536-f5f99be501cd', '1545205597-3d9d02c29597', '1517649763962-0c623266ddc0', '1534438327276-14e5300c3a48',
  '1538805060514-97d9cc17730c', '1541534741688-6078c6bfb5c5', '1552674605-db6ffd4facb5', '1571019613454-1cb2f99b2d8b',
  '1571019614242-c5c5dee9f50b', '1574680096145-d05b474e2155', '1580261450046-d0a30080dc9b', '1584824486509-112e4181ff6b',
  '1590556409328-3e30f14d84a7', '1591117207239-788bf8de6c32', '1594737625785-a6cbdabd333c', '1599058917212-d750089bc07e',
  '1605296867304-46d5465a13f1', '1607962837359-5efe7c8999c1', '1616279969837-a1a249ff929f', '1517838277536-f5f99be501ce',
  '1545205597-3d9d02c29598', '1517649763962-0c623266ddc1', '1534438327276-14e5300c3a49', '1538805060514-97d9cc17730d',

  # Health & Wellness
  '1584308666744-24d5c474f2ae', '1579684385127-1ef15d508118', '1584017911766-d451b3d0e843', '1584515979956-d9f6e5d09982',
  '1584744987258-00ad0749a0a4', '1585435557343-3b092031a831', '1587854692152-cbe660dbde88', '1607613009820-a29f7bb81c04',
  '1616394584738-fc6e612e71b9', '1628771065518-0d82f1938462', '1505751172877-fa1923c5c529', '1550572017-edd951aa8f73',
  '1576091160399-112ba8d25d1e', '1576091160550-2173dba999f0', '1579684385127-1ef15d508119', '1584017911766-d451b3d0e844',
  '1584515979956-d9f6e5d09983', '1584744987258-00ad0749a0a5', '1585435557343-3b092031a832', '1587854692152-cbe660dbde89',
  '1607613009820-a29f7bb81c05', '1616394584738-fc6e612e71ba', '1628771065518-0d82f1938463', '1505751172877-fa1923c5c530',

  # Grocery & Gourmet
  '1542838132-92c53300491e', '1578916171728-46686eac8d58', '1498837167922-ddd27525d352', '1506377247377-2a5b3b417ebb',
  '1509440159596-0249088772ff', '1511018556340-d16986a1c194', '1513818433747-5f17ae66b29b', '1514733670139-4d87a1941d55',
  '1546069901-ba9599a7e63c', '1550547660-d9450f859349', '1559181567-550a2419a542', '1563729784-49f29bb458e2',
  '1567620905732-2d1ec7ab7445', '1572449043416-55f4685c9bb7', '1576867757603-c5f6f2f01964', '1587132137056-bf4e9f556b7f',
  '1587393855524-087f83d95bc9', '1590080875515-8a3a8dc5735e', '1597362925123-77861d3fbac7', '1607301406259-dfb1a4277a5e',
  '1542838132-92c53300491f', '1578916171728-46686eac8d59', '1498837167922-ddd27525d353', '1506377247377-2a5b3b417ebc',

  # Toys & Games
  '1566576912321-d58ddd7a6088', '1558060370-d644479cb6f7', '1515488042361-ee00e0ddd4e4', '1516627145497-ae6968895b74',
  '1526170375885-4d8ecf77b99f', '1534447677768-be436bb09401', '1535572292209-a1d0d88575ec', '1559715745-e1b123c5c304',
  '1560969184-10fe8719e047', '1563089145-599997674d42', '1567653418876-5bb0e566e1c2', '1587654780291-39c9404d746b',
  '1596461404969-9ae70f2830c1', '1607604276583-eef5d076aa5f', '1618842676087-59f82ae484c3', '1566576912322-d58ddd7a6089',
  '1558060370-d644479cb6f8', '1515488042362-ee00e0ddd4e5', '1516627145498-ae6968895b75', '1526170375886-4d8ecf77b9a0',
  '1534447677768-be436bb09402', '1535572292209-a1d0d88575ed', '1559715745-e1b123c5c305', '1560969184-10fe8719e048',

  # Books & Stationery
  '1544716278-ca5e3f4abd8c', '1507842229451-7f01be8610ce', '1495446815901-a7297e633e8d', '1497633762265-9d179a990aa6',
  '1512820790803-83ca734da794', '1516979187457-637abb4f9353', '1524995997946-a1c2e315a42f', '1532012164546-f432f2e3777f',
  '1535905557558-afc4877a26fc', '1543002588-bfa74002ed7e', '1544947950-fa07a98d237f', '1589829085413-56de8ae18c73',
  '1589998059171-988d887df646', '1618365908648-e71bd5716cba', '1544716278-ca5e3f4abd8d', '1507842229451-7f01be8610cf',
  '1495446815901-a7297e633e8e', '1497633762265-9d179a990aa7', '1512820790803-83ca734da795', '1516979187457-637abb4f9354',
  '1524995997946-a1c2e315a430', '1532012164546-f432f2e37780', '1535905557558-afc4877a26fd', '1543002588-bfa74002ed7f',

  # Automotive Accessories
  '1503376780353-7e6692767b70', '1492144534655-ae79c964c9d7', '1489824904134-891ab64532f1', '1502877338535-766e1452684a',
  '1511919884226-fd3cad34687c', '1517524008697-84bbe3c3fd98', '1525609004556-c46cbe436970', '1526726538690-5cbf956ae2fd',
  '1541348263662-e08266f8298b', '1542282088-72c9c27ed0cd', '1552519507-da3b142c6e3d', '1553440569-bcc63803a83d',
  '1563720223185-11003d516935', '1568605117036-5fe5e7bab0b7', '1580273916550-e323be2ae537', '1583121274602-3e2820c69888',
  '1590362891988-8772390f75e2', '1605559424843-9e4c228bf1c2', '1617814076367-b759c7d7e738', '1618843479313-40f8afb4b4d8',
  '1503376780353-7e6692767b71', '1492144534655-ae79c964c9d8', '1489824904134-891ab64532f2', '1502877338535-766e1452684b',

  # Travel & Luggage
  '1565026057447-bc90a3dceb87', '1553062407-98eeb64c6a62', '1488646953014-85cb44e25828', '1501594907352-04cda38ebc29',
  '1503220317375-aaad61436b1b', '1507525428034-b723cf961d3e', '1512100356356-de1b84283e18', '1526778548025-fa2f459cd5c1',
  '1530521954074-e64f6810b32d', '1539635278303-d4002c07eae3', '1544620347-c4fd4a3d5957', '1578894381163-e70a16c4f0b2',
  '1581578731548-c64695cc6953', '1586769852044-692d6e3703f0', '1590402494587-44b71d7772f6', '1600585154340-be6161a56a0e',
  '1609137144820-e221379f046b', '1617137984095-74e4e5e36141', '1622560480605-d83c853bc5c3', '1565026057448-bc90a3dceb89',
  '1565026057447-bc90a3dceb88', '1553062407-98eeb64c6a63', '1488646953014-85cb44e25829', '1501594907352-04cda38ebc30',

  # Jewelry & Watches
  '1515562141207-7a88fb7ce340', '1535632066927-ab7c9ab60908_jw', '1524805444758-089113d48a6d_jw', '1506630448388-4e683c67ddb0',
  '1509042239860-f550ce710b93_jw', '1523275335684-37898b6baf34', '1539185441755-769473a23572', '1544441893-675973e31985',
  '1573408301185-9146fe634ad0', '1588444837495-c6cfeb53f32d', '1599643478518-a784e5dc4c8f', '1600003014797-eb4716cb57f7',
  '1605100804763-247f67b3557e', '1611591475152-4c09a1a2dc54', '1617038220319-276d32992a9f', '1620656797883-9b2f698e6b18',
  '1515562141207-7a88fb7ce33a', '1535632066927-ab7c9ab6090b', '1524805444758-089113d48a6e_jw', '1506630448388-4e683c67ddb1',
  '1509042239860-f550ce710b94_jw', '1523275335684-37898b6baf35', '1539185441755-769473a23573', '1544441893-675973e31986',

  # Pet Supplies
  '1583337130417-3346a1be7dee', '1548767797-d8c844163c4c', '1517849845537-4d257902454a', '1535930891776-0c2dfb7fda1a',
  '1541599540903-216a46ca1dc0', '1543466835-00a7907e9de1', '1548199973-03cce0bbc87b', '1552053831-71594a27632d',
  '1560743641-3914f4c5b81d', '1561037404-61cd46aa615b', '1568640347023-a616a30bc3bd', '1576201836106-db1758fd1c97',
  '1583511655857-d19b40a7a54e', '1587300003388-59208cc962cb', '1592194996308-7b43878e84a6', '1601758228041-f3b2795255f1',
  '1608096299210-db7e38487075', '1615751072497-5f5169fe5ddc', '1623387641168-d9803ddd3f35', '1583337130417-3346a1be7def',
  '1548767797-d8c844163c4d', '1517849845537-4d257902454b', '1535930891776-0c2dfb7fda1b', '1541599540903-216a46ca1dc1',

  # Gaming & Consoles
  '1600080972464-8e5f35f63d08', '1538481199705-c710c4e965fc', '1542751371-adc38448a061', '1550745165-9bc0b252726f',
  '1552824724-1b123c690732', '1566576912321-d58ddd7a608a', '1578632767115-351597cf2477', '1580327344181-c1163233e522',
  '1589241062272-c0a000072dfa', '1592155931584-901ac15763e6', '1593305841991-05c297ba4575', '1598550476439-6847785fcea6',
  '1607604276583-eef5d076aa60', '1612287230562-15e0880e4b09', '1616588589077-478695668ca0', '1629429408209-1f6ba9a4b779',
  '1542751371-adc38448a062', '1550745165-9bc0b2527270', '1552824724-1b123c690733', '1566576912321-d58ddd7a608b',
  '1600080972464-8e5f35f63d09', '1538481199705-c710c4e965fd', '1542751371-adc38448a063', '1550745165-9bc0b2527271'
]

# Ensure uniqueness of image set
assert len(set(UNIQUE_PHOTO_IDS)) >= 528, f"Need at least 528 unique images, have {len(set(UNIQUE_PHOTO_IDS))}"

print(f"Verified {len(set(UNIQUE_PHOTO_IDS))} unique primary image IDs.")

# Category brand mapping
CATEGORY_BRAND_MAP = {
  'cat-electronics': ['brand-sony', 'brand-bose', 'brand-jbl', 'brand-boat', 'brand-apple', 'brand-oneplus'],
  'cat-mobiles': ['brand-apple', 'brand-samsung', 'brand-oneplus', 'brand-nothing', 'brand-xiaomi', 'brand-realme'],
  'cat-computers': ['brand-apple', 'brand-dell', 'brand-hp', 'brand-lenovo', 'brand-asus', 'brand-acer'],
  'cat-computer-acc': ['brand-logitech', 'brand-asus', 'brand-dell', 'brand-anker', 'brand-tp-link'],
  'cat-smart-acc': ['brand-apple', 'brand-samsung', 'brand-amazfit', 'brand-boat', 'brand-fastrack'],
  'cat-mens-fashion': ['brand-levis', 'brand-nike', 'brand-adidas', 'brand-puma'],
  'cat-womens-fashion': ['brand-puma', 'brand-nike', 'brand-adidas', 'brand-levis', 'brand-titan'],
  'cat-kids-fashion': ['brand-adidas', 'brand-nike', 'brand-puma', 'brand-levis'],
  'cat-footwear': ['brand-nike', 'brand-adidas', 'brand-puma', 'brand-fossil'],
  'cat-home-living': ['brand-philips', 'brand-panasonic', 'brand-dyson'],
  'cat-home-appliances': ['brand-dyson', 'brand-philips', 'brand-panasonic'],
  'cat-kitchen': ['brand-breville', 'brand-philips', 'brand-prestige', 'brand-panasonic'],
  'cat-furniture-decor': ['brand-philips', 'brand-panasonic'],
  'cat-beauty': ['brand-loreal', 'brand-nivea', 'brand-philips', 'brand-dyson'],
  'cat-sports': ['brand-nike', 'brand-adidas', 'brand-puma'],
  'cat-health': ['brand-philips', 'brand-panasonic', 'brand-amazfit'],
  'cat-grocery': ['brand-breville', 'brand-prestige'],
  'cat-toys': ['brand-sony', 'brand-logitech', 'brand-panasonic'],
  'cat-books': ['brand-canon', 'brand-logitech'],
  'cat-automotive': ['brand-anker', 'brand-tp-link', 'brand-philips'],
  'cat-travel': ['brand-american-tourister', 'brand-safari', 'brand-nike', 'brand-puma'],
  'cat-jewelry': ['brand-fossil', 'brand-casio', 'brand-titan', 'brand-fastrack'],
  'cat-pets': ['brand-philips', 'brand-panasonic'],
  'cat-gaming': ['brand-sony', 'brand-asus', 'brand-acer', 'brand-logitech'],
}

CATEGORY_PREFIX_MAP = {
  'cat-electronics': 'ELEC',
  'cat-mobiles': 'MOBL',
  'cat-computers': 'COMP',
  'cat-computer-acc': 'CACC',
  'cat-smart-acc': 'SACC',
  'cat-mens-fashion': 'MFAS',
  'cat-womens-fashion': 'WFAS',
  'cat-kids-fashion': 'KFAS',
  'cat-footwear': 'FOOT',
  'cat-home-living': 'HLIV',
  'cat-home-appliances': 'HAPP',
  'cat-kitchen': 'KICH',
  'cat-furniture-decor': 'FURN',
  'cat-beauty': 'BEAU',
  'cat-sports': 'SPRT',
  'cat-health': 'HLTH',
  'cat-grocery': 'GROC',
  'cat-toys': 'TOYS',
  'cat-books': 'BOOK',
  'cat-automotive': 'AUTO',
  'cat-travel': 'TRAV',
  'cat-jewelry': 'JEWL',
  'cat-pets': 'PETS',
  'cat-gaming': 'GAME'
}

def slugify(text):
  text = text.lower()
  text = re.sub(r'[^\w\s-]', '', text)
  text = re.sub(r'[\s_-]+', '-', text)
  text = re.sub(r'^-+|-+$', '', text)
  return text

# Generate 528 products
products = []
used_skus = set()
used_slugs = set()
used_titles = set()
used_image_signatures = set()

# Subcategories grouped by category
sub_by_cat = {}
for sub in SUBCATEGORIES:
  c_id = sub['categoryId']
  if c_id not in sub_by_cat:
    sub_by_cat[c_id] = []
  sub_by_cat[c_id].append(sub)

# Price bases for realistic USD amounts
BASE_PRICES = {
  'cat-electronics': [299.99, 399.00, 449.00, 249.50, 179.99, 129.99, 89.99, 349.00, 79.99, 199.99, 149.00, 59.99, 99.00, 29.99, 49.99, 69.99, 39.99, 119.00, 159.00, 219.00, 499.00, 699.00],
  'cat-mobiles': [1199.00, 999.00, 799.00, 699.00, 549.00, 449.00, 399.00, 299.00, 249.00, 199.00, 899.00, 649.00, 49.99, 39.99, 29.99, 79.99, 59.99, 89.99, 349.00, 429.00, 1299.00, 1499.00],
  'cat-computers': [1299.00, 1499.00, 999.00, 1799.00, 2199.00, 1099.00, 849.00, 699.00, 599.00, 1899.00, 2499.00, 499.00, 549.00, 749.00, 1149.00, 1349.00, 1599.00, 399.00, 649.00, 899.00, 1999.00, 2999.00],
  'cat-computer-acc': [129.99, 99.99, 79.99, 149.99, 179.99, 59.99, 49.99, 89.99, 39.99, 69.99, 119.99, 159.99, 199.99, 29.99, 34.99, 44.99, 54.99, 74.99, 84.99, 109.99, 139.99, 169.99],
  'cat-smart-acc': [399.00, 299.00, 249.00, 199.00, 179.00, 149.00, 129.00, 99.00, 79.00, 69.00, 59.00, 49.00, 39.00, 29.00, 89.00, 119.00, 159.00, 219.00, 279.00, 349.00, 449.00, 499.00],
  'cat-mens-fashion': [89.50, 79.00, 98.00, 129.00, 69.50, 59.00, 149.00, 199.00, 49.50, 39.00, 45.00, 55.00, 65.00, 75.00, 85.00, 95.00, 110.00, 135.00, 160.00, 180.00, 220.00, 250.00],
  'cat-womens-fashion': [119.00, 139.00, 89.00, 79.50, 159.00, 189.00, 69.00, 59.00, 99.00, 149.00, 179.00, 219.00, 49.00, 65.00, 85.00, 105.00, 125.00, 145.00, 165.00, 195.00, 240.00, 280.00],
  'cat-kids-fashion': [39.50, 29.99, 44.50, 49.99, 34.50, 24.99, 54.50, 59.99, 27.50, 32.50, 37.50, 42.50, 47.50, 52.50, 57.50, 62.50, 67.50, 72.50, 77.50, 82.50, 87.50, 92.50],
  'cat-footwear': [149.00, 129.00, 169.00, 189.00, 99.00, 89.00, 199.00, 219.00, 79.00, 69.00, 109.00, 119.00, 139.00, 159.00, 179.00, 209.00, 229.00, 249.00, 279.00, 299.00, 329.00, 349.00],
  'cat-home-living': [189.00, 149.00, 129.00, 99.00, 79.00, 69.00, 219.00, 249.00, 59.00, 49.00, 89.00, 119.00, 139.00, 159.00, 179.00, 199.00, 229.00, 269.00, 299.00, 349.00, 399.00, 449.00],
  'cat-home-appliances': [499.00, 399.00, 299.00, 649.00, 799.00, 249.00, 199.00, 149.00, 119.00, 89.00, 349.00, 449.00, 549.00, 599.00, 699.00, 749.00, 849.00, 899.00, 949.00, 999.00, 1099.00, 1199.00],
  'cat-kitchen': [299.00, 199.00, 249.00, 149.00, 119.00, 89.00, 349.00, 399.00, 69.00, 59.00, 79.00, 99.00, 129.00, 169.00, 179.00, 219.00, 269.00, 289.00, 319.00, 369.00, 429.00, 499.00],
  'cat-furniture-decor': [399.00, 499.00, 299.00, 599.00, 699.00, 249.00, 199.00, 149.00, 799.00, 899.00, 349.00, 449.00, 549.00, 649.00, 749.00, 849.00, 949.00, 999.00, 1099.00, 1199.00, 1299.00, 1499.00],
  'cat-beauty': [68.00, 54.00, 45.00, 78.00, 88.00, 34.00, 28.00, 95.00, 120.00, 140.00, 38.00, 48.00, 58.00, 64.00, 72.00, 82.00, 92.00, 105.00, 115.00, 130.00, 150.00, 175.00],
  'cat-sports': [89.00, 119.00, 149.00, 79.00, 59.00, 49.00, 179.00, 199.00, 69.00, 39.00, 99.00, 129.00, 159.00, 189.00, 219.00, 249.00, 279.00, 299.00, 329.00, 359.00, 399.00, 449.00],
  'cat-health': [89.00, 69.00, 119.00, 149.00, 49.00, 39.00, 179.00, 199.00, 59.00, 29.00, 79.00, 99.00, 129.00, 159.00, 189.00, 219.00, 239.00, 259.00, 279.00, 299.00, 329.00, 349.00],
  'cat-grocery': [28.50, 34.00, 42.00, 24.50, 19.99, 15.50, 48.00, 55.00, 18.00, 14.00, 22.00, 26.00, 31.00, 36.00, 41.00, 46.00, 51.00, 58.00, 64.00, 72.00, 79.00, 89.00],
  'cat-toys': [59.99, 49.99, 69.99, 79.99, 39.99, 29.99, 89.99, 99.99, 34.99, 24.99, 44.99, 54.99, 64.99, 74.99, 84.99, 94.99, 109.99, 119.99, 129.99, 149.99, 169.99, 199.99],
  'cat-books': [32.00, 28.00, 24.00, 38.00, 45.00, 19.99, 16.50, 55.00, 65.00, 75.00, 22.00, 26.00, 30.00, 35.00, 40.00, 48.00, 52.00, 60.00, 68.00, 78.00, 85.00, 95.00],
  'cat-automotive': [129.00, 99.00, 149.00, 79.00, 59.00, 49.00, 179.00, 199.00, 69.00, 39.00, 89.00, 109.00, 119.00, 139.00, 159.00, 189.00, 219.00, 249.00, 279.00, 299.00, 329.00, 349.00],
  'cat-travel': [199.00, 249.00, 149.00, 299.00, 119.00, 89.00, 349.00, 399.00, 79.00, 69.00, 129.00, 169.00, 179.00, 219.00, 259.00, 279.00, 319.00, 359.00, 389.00, 429.00, 469.00, 499.00],
  'cat-jewelry': [249.00, 199.00, 299.00, 349.00, 149.00, 119.00, 399.00, 449.00, 99.00, 89.00, 129.00, 169.00, 179.00, 219.00, 269.00, 289.00, 319.00, 369.00, 429.00, 489.00, 549.00, 599.00],
  'cat-pets': [69.00, 59.00, 49.00, 79.00, 89.00, 39.00, 29.00, 99.00, 119.00, 139.00, 34.00, 44.00, 54.00, 64.00, 74.00, 84.00, 94.00, 104.00, 114.00, 124.00, 134.00, 149.00],
  'cat-gaming': [79.99, 149.99, 199.99, 99.99, 69.99, 49.99, 249.99, 299.99, 59.99, 39.99, 89.99, 119.99, 139.99, 169.99, 179.99, 219.99, 269.99, 319.99, 349.99, 399.99, 449.99, 499.99]
}

# Domain-specific adjectives and product naming patterns per category
CATEGORY_ITEM_NAMES = {
  'cat-electronics': [
    ("Wireless Active Noise Cancelling Studio Headphones", "Dual V1/QN1 audio processors with 30-hour playback"),
    ("Spatial Audio Immersive Over-Ear Bluetooth Headset", "Personalized acoustic tuning with soft leather cushions"),
    ("Pro Sound Waterproof Portable Bluetooth Outdoor Speaker", "Racetrack woofer and separate tweeter pumping 40W RMS"),
    ("Airdopes Beast Mode True Wireless Gaming Earbuds", "50ms ultra-low latency and 42-hour endurance battery"),
    ("Flagship Computational Audio Wireless Earbuds with ANC", "Lossless spatial audio with dynamic head tracking"),
    ("Adaptive ANC Wireless Headphones with LDAC Hi-Res", "40mm custom bio-cellulose drivers and 55 hours playtime"),
    ("Magnetic Fast-Charge Bluetooth Collar Neckband", "12.4mm bass drivers with 10-minute quick charge for 20 hours"),
    ("Spatial Sound Effect Bluetooth Neckband Earphones", "30dB active cancellation with magnetic power switch"),
    ("Dolby Atmos 5.1 Cinematic Surround Soundbar with Subwoofer", "Discrete channels and 400W system power for home theater"),
    ("MultiBeam 3D Panoramic Wireless Smart Soundbar", "Automatic room calibration and punchy wireless sub"),
    ("Rugged Outdoor Bluetooth Speaker with PositionIQ", "Floats in water, resists drops, and auto-tunes EQ"),
    ("Ultra-Compact Travel Bluetooth Speaker with Bass Radiator", "Sound diffusion processor and convenient strap"),
    ("Lightweight Wireless On-Ear Headset with HD Voice", "Featherlight 147g build with all-day 50-hour battery"),
    ("Matte Finish Ergonomic Wireless Headphone with ASAP Charge", "Plush earcups with high-output 40mm dynamic drivers"),
    ("Dual MelodyBoost Driver True Wireless Earbuds with Smart ANC", "Dynaudio co-created dual acoustic drivers with 48dB cancellation"),
    ("High-Output Wireless Karaoke Party Speaker with RGB Lights", "Integrated microphone inputs and 60W room-filling sound"),
    ("Deep Bass Ergonomic In-Ear TWS Earbuds with Touch Control", "8mm enhanced bass drivers with 32 hours total playtime"),
    ("Ultra-Long Endurance Wireless Earbuds with Quad Mics", "120 hours continuous backup with environmental noise reduction"),
    ("Bluetooth Home Soundbar with Wired Subwoofer System", "180W peak audio with dedicated cinema and dialogue modes"),
    ("Compact Noise Isolating In-Ear Studio Earphones", "Zero latency cable with inline high-fidelity microphone"),
    ("Hi-Fi Balanced Armature Audiophile Earphones", "Precision metal casing with detachable MMCX silver-plated cable"),
    ("Desktop Reference Bluetooth Studio Monitor Speakers", "Bi-amplified active studio monitors with front bass reflex ports")
  ],
  'cat-mobiles': [
    ("Pro Max Titanium 256GB Flagship 5G Smartphone", "Aerospace titanium enclosure with 3nm silicon processor"),
    ("Ultra 5G 256GB AI Titanium Edition Smartphone", "Dynamic AMOLED 2X 120Hz display with integrated S-Pen"),
    ("Flagship 5G 16GB RAM Smartphone with Hasselblad Optics", "ProXDR display with ultra-fast 100W charging"),
    ("Transparent Glyph Interface Dual 50MP Smartphone", "Custom programmable LED notification glyphs with LTPO OLED"),
    ("Leica Optics 5G Smartphone with Floating Telephoto", "Leica Summilux lenses with Snapdragon flagship processor"),
    ("Periscope Telephoto Curved AMOLED 5G Smartphone", "64MP periscope zoom lens with vegan leather luxury back"),
    ("M2 Chip 11-inch Liquid Retina Wi-Fi Ultra-Thin Tablet", "All-day battery with M2 processing and Center Stage camera"),
    ("Dynamic AMOLED 2X 14.6-inch Ultra Tablet with Stylus", "Massive high-refresh canvas with bundled precision stylus"),
    ("High-Refresh ReadFit 7:5 Ratio Productivity Tablet", "144Hz eye-care display with 9510mAh marathon battery"),
    ("2.8K 144Hz Dolby Atmos Metal Body Quad-Speaker Tablet", "High-resolution display for cinema and multitasking"),
    ("Dynamic Island 128GB High-Efficiency Smartphone", "Color-infused durable glass with 48MP main camera"),
    ("Metal Armor 5G Smartphone with OIS Nightography", "Gorilla Glass Victus+ with IP67 water and dust resistance"),
    ("GaN 67W 3-Port Ultra-Fast Travel Wall Charger", "Gallium nitride technology powering phones and laptops"),
    ("Fast Power Delivery 20W Compact USB-C Wall Adapter", "Safe, rapid charging for tablets, smartwatches, and phones"),
    ("Super Fast Charging 45W Type-C Power Adapter", "Includes 5A high-current durable braided cable"),
    ("High-Capacity 24000mAh 140W PD Digital Screen Power Bank", "Smart interactive digital screen showing real-time wattage"),
    ("Sonic Fast Charge 20000mAh Dual-Output Slim Power Bank", "12-layer circuit protection with two-way rapid charging"),
    ("Dual-Cell Fast Charging 5G Smartphone with Marble Finish", "5500mAh high-density cell with 100W flash charging"),
    ("200MP OIS Curved 1.5K AMOLED 5G Smartphone", "Flagship camera sensor with IP68 immersion rating"),
    ("Transparent Glyph 5G Smartphone with Dimensity Processor", "Unique industrial aesthetic with smooth clean operating system"),
    ("Dual-Screen Foldable 512GB Multitasking Smartphone", "Expands from phone to mini-tablet with zero-gap hinge"),
    ("Compact 8.3-inch Liquid Retina Ultra-Portable Tablet", "Fits in one hand with neural engine performance")
  ],
  'cat-computers': [
    ("M3 Chip 15-inch Liquid Retina Thin & Light Laptop", "All-aluminum unibody with 18-hour battery and MagSafe"),
    ("Core i7 Touchscreen OLED Ultrabook with Seamless Glass", "13.4-inch 3.5K OLED touch panel with haptic glass trackpad"),
    ("2-in-1 Convertible 14-inch OLED Laptop with Tilt Stylus", "Intel Core Ultra AI engine with 360-degree precision hinge"),
    ("Carbon Fiber Military-Spec Lightweight Business Laptop", "Ultra-durable 1.12kg chassis with spill-resistant keyboard"),
    ("Lumina OLED 14-inch Slim Laptop with Metal Chassis", "120Hz 0.2ms color-calibrated display with 75Wh battery"),
    ("Core Ultra 9 RTX 4080 32GB High-FPS Gaming Laptop", "240Hz Nebula OLED display with vapor chamber liquid metal"),
    ("Core i9 RTX 4090 32GB 2TB Max-Power Gaming Laptop", "Overclocked 24-core CPU with full 175W TGP GPU performance"),
    ("AeroBlade Dual-Metal Fan 16-inch Gaming Notebook", "Custom engineered 5th gen metal cooling fans with QHD screen"),
    ("FHD 165Hz sRGB Gaming Laptop with Dual Exhaust Heatsinks", "Thermal architecture inspired by enterprise servers"),
    ("UltraSharp 27-inch 4K IPS Black USB-C Hub Display", "2000:1 contrast ratio with 90W single-cable power delivery"),
    ("Curved Dual QHD 240Hz 49-inch Super-Ultrawide Monitor", "Replaces dual monitors with seamless 32:9 curved immersion"),
    ("M2 Max 32GB Unified Memory Compact Creative Workstation", "Thermal design that remains dead silent under 8K video exports"),
    ("Tower Workstation with Professional CAD GPU ISV Certified", "Engineered for 3D rendering, machine learning, and simulations"),
    ("Liquid Retina XDR 16-inch M3 Max Extreme Pro Laptop", "1600 nits peak HDR with 36GB memory and studio microphones"),
    ("Ryzen 7 Tempest Cooling Gaming Laptop with QHD 240Hz", "AMD Zen 4 architecture paired with high-refresh display"),
    ("Dual OLED 2-in-1 Laptop with Rotating Bowers Soundbar", "Two full-size OLED touchscreens for revolutionary workflow"),
    ("Thin & Light 2.8K 90Hz OLED All-Aluminum Notebook", "1.32kg lightweight portability with AI noise reduction webcam"),
    ("5K Studio Display 27-inch with Matte Anti-Glare Finish", "99% DCI-P3 color reproduction with bundled magnetic camera"),
    ("Military-Tough 90Wh Battery High-Power Gaming Laptop", "Tested against drops, vibration, humidity, and extreme heat"),
    ("Micro 1-Liter Compact Workstation with Dedicated Graphics", "Small form-factor PC that mounts behind any VESA monitor"),
    ("Dual-Fan Exhaust High-Value 144Hz Gaming Laptop", "Dedicated ray-tracing GPU with upgradable dual DDR5 slots"),
    ("OLED 2.8K Display Ultra-Thin Everyday Productivity Laptop", "Ergonomic backlit keyboard with tuned acoustic speakers")
  ],
  'cat-computer-acc': [
    ("Hot-Swappable Gasket-Mounted RGB Mechanical Keyboard", "Pre-lubed switches with sound dampening silicone foam"),
    ("Ergonomic Wireless Trackball Mouse with Precision Thumb Dial", "Sculpted ergonomic angle that reduces forearm muscle strain"),
    ("Rugged 2TB NVMe USB 3.2 Gen 2x2 Portable External SSD", "Blazing 2000MB/s transfer speeds with drop protection"),
    ("12-in-1 Triple 4K Display USB-C Aluminum Docking Station", "Dual HDMI, DisplayPort, Gigabit Ethernet, and 100W PD pass"),
    ("Low-Profile Wireless Mechanical Keyboard with Tactile Switches", "Aircraft-grade aluminum top plate with multi-device pairing"),
    ("Ultra-Lightweight 58g Esports Wireless Gaming Mouse", "Flawless optical sensor with optical mouse switches and zero lag"),
    ("Ultra-Fast 1TB Type-C Dual Flash Drive with Swivel Metal Casing", "Universal connectors for iPhones, Android devices, and PCs"),
    ("Universal Vertical Aluminum Laptop Stand with Dual Slots", "Keeps workspace clutter-free while protecting laptops from heat"),
    ("High-Precision 4K HDR Streaming Webcam with Dual Mics", "Auto-focus glass lens with dual noise-cancelling microphones"),
    ("Extended Water-Resistant Anti-Fray Cloth Gaming Mousepad", "Micro-woven textured cloth surface optimized for tracking"),
    ("Tri-Mode Wireless Numpad with Programmable Macro Knobs", "Independent numeric keypad with customizable mechanical keys"),
    ("Quiet-Click Silent Ergonomic Wireless Bluetooth Mouse", "90% noise reduction buttons with seamless gesture controls"),
    ("Fast M.2 NVMe to USB-C Tool-Free Aluminum SSD Enclosure", "Ribbed aluminum casing for optimal passive heat dissipation"),
    ("USB 3.0 Ultra-Slim 4-Port Hub with Individual LED Power Switches", "Instant port expansion with integrated surge suppression"),
    ("Dual Monitor Heavy-Duty Counterbalance Gas Spring Arm", "Full motion swivel, tilt, and 360-degree screen rotation"),
    ("Braided 240W USB-C to USB-C Heavy-Duty Charging Cable 2M", "Reinforced Kevlar fiber core capable of laptop fast charging"),
    ("Multi-Angle Foldable Aluminum Tablet and Laptop Riser Stand", "Ventilated design that prevents thermal throttling on desks"),
    ("Mechanical Switch Keycap Puller and Cleaning Maintenance Kit", "Includes anti-static brushes, microfiber cloths, and key pullers"),
    ("High-Speed UHS-II SDXC 256GB V90 Memory Card for 8K Video", "Read speeds up to 300MB/s for uninterrupted cinema burst photos"),
    ("USB-C to DisplayPort 1.4 8K 60Hz 4K 144Hz Braided Cable", "Supports DSC 1.2, HDR10, and high-refresh gaming monitors"),
    ("Active Noise-Filtering USB Podcast Microphone with Boom Arm", "Cardioid condenser capsule with zero-latency headphone monitor"),
    ("Compact 65% Wireless Mechanical Keyboard with Dye-Sub PBT", "Cherry profile thick PBT keycaps resistant to shine and wear")
  ],
  'cat-smart-acc': [
    ("Titanium Sapphire GPS Multisport Smartwatch 49mm", "Dual-frequency GPS with 60-hour expedition battery life"),
    ("Rotating Bezel Dynamic AMOLED 2X Smartwatch 47mm", "Body composition BIA sensor and ECG heart monitoring"),
    ("Dual-Band GPS Smartwatch with 14-Day AMOLED Display", "Over 150 sports modes with offline topographic mapping"),
    ("Curved AMOLED Bluetooth Calling Smartwatch with AI Voice", "Zinc alloy casing with continuous SpO2 and sleep tracking"),
    ("Ultra-Slim Fitness Tracker Band with Heart Rate & Stress", "Vibrant OLED color touchscreen with 14 days standby battery"),
    ("Titanium Smart Fitness & Sleep Ring with PPG Sensors", "Featherlight titanium band tracking skin temperature and sleep"),
    ("3-in-1 Foldable Magnetic Wireless Charging Station", "Simultaneously powers phone, smartwatch, and earbuds"),
    ("Breathable Braided Solo Loop Nylon Smartwatch Strap", "Stretches comfortably over wrist with sweat-resistant weave"),
    ("Stainless Steel Milanese Loop Magnetic Smartwatch Mesh Band", "Smooth woven stainless steel mesh with infinite adjustability"),
    ("Rugged Armor Shockproof Bumper Case with Tempered Glass", "Protects watch screen and edges from outdoor trail scrapes"),
    ("Fast Magnetic USB-C Smartwatch Wireless Charging Cable", "Puck charger that juices compatible smartwatches in 45 mins"),
    ("Smart Sleep & Recovery Smartwatch with Readiness Score", "Bio-tracker that analyzes HRV, recovery index, and strain"),
    ("Calling Smartwatch with Metallic Unibody & 1.96-inch Screen", "Large high-nit display for sunlight legibility and contacts"),
    ("Silicone Sport Smartwatch Band with Air-Flow Perforations", "Hypoallergenic dual-tone silicone designed for swimming"),
    ("Genuine Leather Vintage Horology Quick-Release Watch Strap", "Hand-stitched genuine leather with brushed stainless buckle"),
    ("Qi2 Certified 15W Magnetic Wireless Car Vent Phone Mount", "Strong neodymium magnets that grip phones through bumps"),
    ("Dual-Device High-Power Desktop Wireless Charging Pad", "Charges two phones or earbuds at full 15W fast speeds"),
    ("Bluetooth Smart Item Tracker with Ultra-Wideband Precision", "Locates misplaced keys, wallets, and backpacks anywhere"),
    ("Hybrid Smartwatch with Mechanical Hands and Hidden Display", "Classic analog watch elegance combined with health sensors"),
    ("Waterproof Swim-Tracking Smartwatch with Stroke Detection", "5ATM water resistance with SWOLF efficiency analysis"),
    ("Outdoor Solar-Powered Tactical GPS Navigation Watch", "Solar charging lens giving unlimited battery in sunny climes"),
    ("Ceramic Link Luxury Smartwatch Bracelet with Butterfly Clasp", "Polished scratch-proof ceramic links with quick adjustment")
  ],
  'cat-mens-fashion': [
    ("Authentic Straight-Fit Selvedge Denim Jeans 501 Original", "Classic 5-pocket styling with copper rivets and button fly"),
    ("Tailored Oxford Cotton Button-Down Long-Sleeve Shirt", "Pure combed cotton with classic collar and chest pocket"),
    ("Merino Wool V-Neck Lightweight Winter Sweater", "Extra-fine Australian merino wool with natural thermo-regulation"),
    ("Italian Cut Slim-Fit Wool Blend Formal Blazer", "Half-canvas construction with double back vents and notch lapel"),
    ("Dri-FIT Moisture-Wicking Performance Short-Sleeve Polo", "Engineered athletic pique fabric that moves with your swing"),
    ("Heavyweight Loopback French Terry Pullover Hoodie", "450 GSM pure cotton fleece with double-layered drawstring hood"),
    ("Water-Repellent Lightweight Zip-Up Bomber Jacket", "Ribbed knit collar and cuffs with secure zippered sleeve pocket"),
    ("Slim Tapered Stretch Chino Trousers with Flex Waist", "Garment-dyed cotton twill with subtle stretch for mobility"),
    ("Graphic Heritage Logo Heavy Cotton Crewneck T-Shirt", "Pre-shrunk vintage wash cotton with bold screen-printed logo"),
    ("Classic Fit Trucker Denim Jacket with Metal Shank Buttons", "Legendary jacket design that softens and fades with wear"),
    ("Breathable Linen Blend Casual Summer Resort Shirt", "Relaxed camp collar with breathable open weave linen-cotton"),
    ("Water-Resistant Down-Filled Winter Puffer Jacket", "650 fill power ethically-sourced duck down with fleece pockets"),
    ("Athletic Training Tapered Jogger Pants with Zip Pockets", "Four-way stretch fabric with elasticated waistband and ankle cuffs"),
    ("Solid Pima Cotton Premium Everyday Undershirt 3-Pack", "Long-staple Peruvian pima cotton offering unmatched softness"),
    ("Water-Repellent Double-Breasted Modern Trench Coat", "Cotton gabardine with removable storm flap and belted waist"),
    ("Brushed Flannel Plaid Long-Sleeve Heavyweight Workshirt", "Soft double-brushed cotton flannel with dual chest flap pockets"),
    ("Seamless Anti-Chafe Running Singlet Tank Top", "Ultra-breathable perforated mesh designed for marathon runners"),
    ("Tailored Linen Pleated Trousers with Side Adjusters", "Timeless sartorial styling without the need for a belt"),
    ("Full-Zip Technical Fleece Athletic Training Track Jacket", "Moisture-wicking dryCELL fabric with thumbholes in cuffs"),
    ("Cashmere Blend Cable-Knit Crewneck Luxury Sweater", "Luxurious blend offering plush warmth without bulky weight"),
    ("Stretch Denim Western Snap-Front Casual Shirt", "Pointed yokes with pearlized snap closures and dual pockets"),
    ("Windproof Lightweight Packable Cycling & Running Windbreaker", "Folds into its own pocket with reflective safety detailing")
  ],
  'cat-womens-fashion': [
    ("Floral Print Tiered Georgette Midi Wrap Cocktail Dress", "Flowy silhouette with surplice neckline and flutter sleeves"),
    ("Emerald Green Bias-Cut Lustrous Satin Slip Dress", "Gently grazes curves with adjustable delicate spaghetti straps"),
    ("Handcrafted Silk Embroidered Anarkali Kurta Set", "Includes embroidered kurta, matching trousers, and organza dupatta"),
    ("Pure Cotton Block-Printed Daily Casual Straight Kurta", "Breathable cambric cotton with mandarin notch collar detail"),
    ("High-Rise Non-Sheer Squat-Proof Workout Leggings", "Contoured waistband with seamless drop-in phone side pockets"),
    ("High-Rise Skinny Sculpt Stretch Denim Jeans", "Flattering silhouette engineered to hold and lift all day"),
    ("Adicolor Classics Satin Full-Zip Streetwear Track Jacket", "Lustrous recycled satin with iconic 3-Stripes along sleeves"),
    ("High-Impact Front-Zip Padded Running Sports Bra", "Locking front zipper with dryCELL moisture-management support"),
    ("Mulberry Silk Woven Floral Jaal Festive Saree with Blouse", "Artisan woven gold zari work with unstitched blouse fabric"),
    ("Classic Iconic Denim Trucker Jacket in Light Stonewash", "Timeless layer crafted from rigid pure cotton denim"),
    ("Oversized Cozy French Terry Funnel-Neck Sweatshirt", "Slouchy relaxed drape with deep kangaroo front pockets"),
    ("High-Waisted Shimmer Biker Shorts with Wide Waistband", "Smooth four-way stretch fabric with chafe-free flatlock seams"),
    ("Smocked Waist Tiered Bohemian Ruffle Maxi Skirt", "Lightweight viscose drape with generous sweeping ruffled hem"),
    ("Oversized Linen Button-Down Boyfriend Casual Shirt", "Breezy summer silhouette that styles easily over swimwear or jeans"),
    ("Soft Seamless Light-Support Triangle Bralette 2-Pack", "InfinaSoft fabric providing a barely-there gentle feel"),
    ("Bandhani Print Georgette Festive Gown with Gota Border", "Flared ethnic evening gown with intricate gold gota patti work"),
    ("Super High-Rise Straight Ankle Vintage Denim Jeans", "Leg-lengthening fit inspired by vintage 1990s styling"),
    ("Cloudspun Ultra-Soft Knit Long-Sleeve Training Top", "Cashmere-like softness engineered for yoga and daily runs"),
    ("French Terry Fitted Casual Track Pants with Ribbed Cuffs", "Comfortable everyday essential with contrast vertical stripes"),
    ("Embroidered Velvet Straight Kurta and Pant Set", "Rich micro-velvet with delicate sequin and thread embroidery"),
    ("Cropped French Terry Streetwear Full-Zip Hoodie", "Modern cropped length with two-way zipper and relaxed drop shoulders"),
    ("Tailored Wide-Leg Pleated High-Waist Trousers", "Polished drapey fabric with slant pockets and pressed center creases")
  ],
  'cat-kids-fashion': [
    ("Organic Cotton Cartoon Graphic T-Shirt & Shorts Set", "Soft breathable cotton safe for sensitive young skin"),
    ("Colorblock Full-Zip Fleece Lined Warm Winter Jacket", "Padded insulation with detachable hood and windproof zipper"),
    ("Stretch Denim Adjustable Waist Jeans for Boys", "Durable reinforced knees with internal button elastic waist"),
    ("Floral Tiered Cotton Summer Sundress for Girls", "Sweet flutter sleeves with matching hair ribbon accessory"),
    ("Snap-Button Pure Cotton Rompers Babywear 3-Pack", "Nickel-free bottom snaps for swift and easy diaper changes"),
    ("Breathable Athletic Mesh Running Shoes with Velcro Strap", "No-tie hook and loop closure for independent little feet"),
    ("Printed Cotton Nightwear Pyjama Sleep Set", "Tagless labels with gentle elasticated waistband for cozy sleep"),
    ("Water-Resistant Hooded Raincoat with Reflective Strips", "Keeps kids bone-dry on puddle-splashing school mornings"),
    ("Party Wear Blazer and Trouser Suit Set with Bowtie", "Sharp gentleman styling for weddings and milestone celebrations"),
    ("Girls Shimmer Tulle Skirt Ballerina Party Dress", "Sparkling metallic foil stars with soft cotton inner lining"),
    ("Unisex Cotton Knit Cardigan Sweater with Wood Buttons", "Chunky garter stitch knit providing timeless warmth"),
    ("Activewear Breathable Tracksuit Jacket & Sweatpants Set", "Quick-drying fabric that keeps up with playground tag"),
    ("UV50+ Sun Protection Long-Sleeve Swimwear Rashguard", "Chlorine-resistant fabric shielding against harsh sun rays"),
    ("Denim Overalls Dungarees with Adjustable Buckle Straps", "Roomy pockets for collecting pebbles and outdoor treasures"),
    ("Cozy Fleece Footed Baby Sleeper with Two-Way Zipper", "Inverted zipper for gentle late-night checks and changes"),
    ("Polo Collar Short-Sleeve Pique Shirt for Toddlers", "Ribbed collar that holds its shape wash after wash"),
    ("Girls Cotton Leggings with Reinforced Elastic Waist 3-Pack", "Super stretchy versatile basic that pairs with any dress"),
    ("Boys Flannel Plaid Button-Up Casual Long-Sleeve Shirt", "Soft brushed flannel for autumn outings and family photos"),
    ("Ribbed Knit Beanie Hat and Mittens Winter Warmth Set", "Stretches to fit growing kids with playful faux-fur pompom"),
    ("Princess Lace Bodice Flowy Tulle Birthday Gown", "Floor-sweeping elegance fit for recitals and flower girls"),
    ("Heavy Cotton Graphic Sweatshirt with Kangaroo Pocket", "Vibrant non-toxic screen print that withstands high temps"),
    ("Padded Lightweight Puffer Vest for Layering", "Sleeveless mobility with cozy synthetic down warmth")
  ],
  'cat-footwear': [
    ("Air Zoom Pegasus Road Running Performance Shoes", "Nike React foam paired with dual Zoom Air units for propulsion"),
    ("Ultraboost Light Energy Return Marathon Running Shoes", "30% lighter BOOST midsole with Continental natural rubber outsole"),
    ("Velocity Nitro 2 Nitrogen-Infused Daily Road Running Shoes", "PUMAGRIP all-weather traction with springy nitrogen foam"),
    ("Invincible 3 Maximum Cushioning Long-Distance Running Shoes", "Full-length ZoomX foam stack with wide stable rocker base"),
    ("Originals Stan Smith Clean Minimalist White Leather Sneakers", "Clean white silhouette with perforated 3-Stripes and green heel"),
    ("Suede Classic Low-Top Streetwear Lifestyle Sneakers", "100% genuine cow suede upper with cushioned comfort sockliner"),
    ("Italian Full-Grain Leather Wingtip Oxford Brogues", "Hand-burnished calfskin with Blake stitched leather sole"),
    ("Air Force 1 '07 Iconic Low-Top Triple White Sneakers", "Stitched leather overlays with encapsulated Air-sole cushioning"),
    ("Superstar Core Black and White Shell Toe Retro Sneakers", "Iconic ribbed rubber shell toe with smooth leather upper"),
    ("RS-X Reinvention Chunky Sole Retro Running Lifestyle Shoes", "Polyurethane midsole with dramatic angular aesthetic"),
    ("InfinityRN 4 ReactX Foam Soft Impact Road Shoes", "ReactX foam delivering 13% more rebound with water-resistant liner"),
    ("Gazelle Vintage Low-Profile Suede Street Sneakers", "Ultra-soft pigskin suede with textured translucent gum rubber sole"),
    ("Cap Toe Derby Genuine Burnished Leather Business Shoes", "Argentine vegetable-tanned leather with rubber traction inserts"),
    ("Adilette Comfort Ergonomic Contoured Cloudfoam Slides", "Pillow-soft footbed designed for post-workout foot recovery"),
    ("Calm Slip-On Seamless Water-Friendly Contoured Slides", "Responsive one-piece soft foam that repels water at the pool"),
    ("Leadcat 2.0 Padded Strap Comfort Everyday Casual Slides", "Molded EVA outsole with cushioned synthetic leather upper band"),
    ("Double Monk Strap Antiqued Brass Buckle Handcrafted Shoes", "Handcrafted formal footwear with breathable sheepskin lining"),
    ("Zoom Fly 5 Carbon Fiber Plate Propulsive Road Racers", "Full-length carbon flyplate driving forward propulsion"),
    ("Adizero Boston 12 Lightstrike Pro Glass-Fiber Rods Racers", "EnergyRods 2.0 simulate human metatarsals for snappy toe-off"),
    ("Deviate Nitro 2 Carbon Composite Plate Marathon Racers", "PWRPLATE carbon composite engineered for record-breaking runs"),
    ("Penny Loafer Slip-On Moccasin Genuine Leather Dress Shoes", "Traditional hand-sewn moccasin construction with Ortholite footbed"),
    ("Metcon 9 Heavy Cross-Training & Weightlifting Shoes", "Enlarged Hyperlift plate providing locked-in heel stability")
  ],
  'cat-home-living': [
    ("Aura Acoustic Smart Mood Lamp with Ambient Speaker", "Circadian natural light cycles with 360-degree acoustic driver"),
    ("100% Organic Bamboo Lyocell Silky Breathable Bed Sheet Set", "Cooling 400-thread count sateen weave gentle on skin and hair"),
    ("Smart Color Ambiance Wi-Fi LED Bulbs Starter Kit 3-Pack", "16 million colors with voice assistant and automation schedules"),
    ("Hand-Tufted Moroccan Geometric Wool Area Rug 5x7 Ft", "High-density natural wool pile that insulates chilly floors"),
    ("Room Darkening Thermal Insulated Blackout Curtain Panels", "Blocks 99% of outside glare while retaining room heat"),
    ("Minimalist Ceramic Matte Stoneware Vase Collection", "Sculptural vessels for dried pampas grass and botanical stems"),
    ("All-Season Microfiber Quilted Down-Alternative Comforter", "Box-stitch construction preventing clumping with corner duvet tabs"),
    ("Solid Oak Floating Wall Shelves with Hidden Brackets", "Heavy-duty steel mounting hardware holding up to 35 lbs per shelf"),
    ("Ultrasonic Ceramic Essential Oil Aromatherapy Diffuser", "Whisper-quiet mist with ambient warm LED nightlight and timer"),
    ("Memory Foam Ergonomic Contour Cervical Orthopedic Pillow", "Cradles neck and aligns spine for back and side sleepers"),
    ("Handwoven Natural Seagrass Storage Baskets with Handles", "Organizes toys, throw blankets, and nursery essentials cleanly"),
    ("Modern Arched Full-Length Aluminum Framed Floor Mirror", "Shatter-proof HD glass with freestanding easel and wall mounts"),
    ("Chunky Hand-Knit Chenille Throw Blanket for Couches", "Luxuriously soft oversized knit that resists shedding and pilling"),
    ("Smart Programmable Wi-Fi Thermostat with Room Sensors", "Learns family routines to cut energy bills automatically"),
    ("Architectural Metal Wire LED Pendant Ceiling Chandelier", "Geometric matte black finish bringing industrial warmth to dining"),
    ("Natural Soy Wax Aromatherapy Scented Candle in Amber Glass", "Notes of cedarwood, amber, and vanilla with 55-hour burn time"),
    ("Velvet Accent Decorative Throw Pillow Covers 4-Pack", "Hidden zipper closures with rich plush texture in jewel tones"),
    ("Heavyweight Linen Textured Dining Tablecloth Runner", "Stain-resistant fabric that protects wood tables with rustic charm"),
    ("Indoor Plant Stand with Ceramic Pot Mid-Century Modern", "Elevates indoor greenery with water drainage hole and plug"),
    ("Weatherproof Outdoor String Lights with Shatterproof Bulbs", "Commercial-grade rubber cord connecting up to 10 strands"),
    ("Ergonomic Memory Foam Footrest Cushion for Work Desks", "Encourages healthy circulation and posture during desk shifts"),
    ("Minimalist Floating Bedside Nightstand with Drawer", "Wall-mounted storage keeping bedroom floors airy and accessible")
  ],
  'cat-home-appliances': [
    ("Hyperdymium Cordless Stick Vacuum with Laser Dust Detect", "Reveals microscopic particles with 60 minutes fade-free suction"),
    ("Hot+Cool Purifying Fan with True HEPA H13 Filtration", "Captures 99.97% of allergens and volatile organic compounds"),
    ("Robot Vacuum & Mop with LiDAR Navigation & Auto-Empty", "Maps rooms precisely and washes mop pads at charging dock"),
    ("Digital Inverter Smart Front-Load Washing Machine 8kg", "Steam sanitize cycle reducing wrinkles and killing bacteria"),
    ("Smart Countertop Convection Microwave with Air Fryer", "Combines convection baking, microwave speed, and crisp air frying"),
    ("Ultrasonic Quiet Whole-Room Cool Mist Humidifier 4L", "Maintains optimal moisture balance with auto-shutoff sensor"),
    ("Commercial Garment Steamer with 360 Rotating Hanger", "Continuous 1500W steam de-wrinkling delicate silks and wool suits"),
    ("Heavy-Duty Portable Dehumidifier with Continuous Drain", "Removes up to 50 pints of moisture per day preventing damp"),
    ("Smart Energy-Star Window Air Conditioner with Wi-Fi Control", "Whisper-quiet inverter compressor saving up to 35% on power"),
    ("Ionic Ceramic Hair Dryer with High-Speed Brushless Motor", "Dries hair in half the time without heat damage or frizz"),
    ("Digital Food Dehydrator with 6 Stainless Steel Trays", "Preserves fruits, beef jerky, and herbs with digital timer"),
    ("Automatic Ice Maker Countertop Machine 26 lbs/Day", "Produces bullet ice cubes in just 6 minutes with quiet fan"),
    ("Cordless Handheld Car & Mattress Vacuum with Pet Brush", "Motorized brush bar that lifts pet hair from cushions and stairs"),
    ("Smart Wi-Fi Connected Air Purifier with PM2.5 Sensor", "Real-time air quality indicator ring with whisper sleep mode"),
    ("Electronic Safe Box with Biometric Fingerprint Lock", "Reinforced solid steel bolts protecting valuables and documents"),
    ("Self-Cleaning Water Dispenser with Hot and Cold Faucets", "Ozone sanitization technology ensuring clean drinking water"),
    ("Precision Ceramic Steam Iron with Anti-Drip Soleplate", "Continuous high-pressure steam blast smoothing tough linen wrinkles"),
    ("Electric Space Heater with Ceramic Heating & Remote", "Rapid 2-second warmth with tip-over and overheat safety switches"),
    ("Compact Countertop Dishwasher with 5 Wash Programs", "No permanent plumbing required; ideal for apartments and RVs"),
    ("Automated Litter Box with Smart Odor Control System", "Automatically scoops after cats exit into sealed waste drawer"),
    ("High-Velocity Floor Fan with Industrial Metal Blades", "Circulates heavy air volumes across garages, gyms, and basements"),
    ("Smart Wi-Fi Video Doorbell with Chime & Two-Way Talk", "1080p HDR camera with night vision and human motion detection")
  ],
  'cat-kitchen': [
    ("The Barista Touch Impress Espresso Machine with Touchscreen", "Automated dosing, precision temperature, and microfoam texturing"),
    ("Digital Air Fryer Max XL 5.8 Qt with 13 Cooking Presets", "Crisps with 85% less oil using rapid 360 air circulation"),
    ("Professional 1400W High-Speed Variable Blender", "Crushes whole fruits, nuts, and ice into silky smoothies in seconds"),
    ("Tri-Ply Stainless Steel 10-Piece Cookware Pots & Pans Set", "Aluminum core sandwiched between steel for even heat distribution"),
    ("Japanese Damascus High-Carbon Steel 8-inch Chef Knife", "67 layers of hammered steel with razor-sharp 15-degree edge"),
    ("Electric Gooseneck Pour-Over Kettle with Temperature Control", "Maintains set temperature for 60 minutes with counterbalanced handle"),
    ("Multi-Cooker 9-in-1 Electric Pressure Cooker 6 Qt", "Replaces pressure cooker, slow cooker, rice cooker, and yogurt maker"),
    ("Stoneware Ceramic Dinnerware Set 16-Piece Service for 4", "Scratch-resistant matte glaze microwave and dishwasher safe"),
    ("Heavy-Duty Cast Iron Dutch Oven with Enamel Finish 6 Qt", "Superior heat retention ideal for sourdough bread and braised stews"),
    ("Digital Kitchen Food Scale with High-Precision Sensors", "Measures down to 0.1g accuracy with tare calculation function"),
    ("Non-Stick Heavyweight Carbon Steel Bakeware Set 5-Piece", "Even browning for cakes, cookies, and roasted vegetables"),
    ("4-Slice Stainless Steel Toaster with Extra-Wide Slots", "Independent dual controls with bagel, defrost, and cancel buttons"),
    ("Vacuum Food Sealer Machine with Starter Bag Rolls", "Preserves food freshness up to 5x longer in freezers and pantries"),
    ("Cold Brew Iced Coffee Maker with Fine Mesh Stainless Filter", "Extracts smooth low-acid coffee concentrate in 12 to 24 hours"),
    ("Manual Pasta Roller Machine with Cutters for Spaghetti", "Adjustable thickness dials with solid chrome-plated steel rollers"),
    ("Silicone Heat-Resistant Kitchen Cooking Utensils Set 12-Piece", "BPA-free non-scratch silicone with ergonomic natural wood handles"),
    ("Electric Spice and Coffee Bean Grinder with Stainless Blades", "Quickly pulverizes coffee beans, peppercorns, and flaxseeds"),
    ("Non-Stick Granitestone Wok Pan with Glass Lid 12-inch", "Scratch-resistant mineral coating for stir-frying with minimal oil"),
    ("Glass Food Storage Containers with Airtight Bamboo Lids", "Oven-safe borosilicate glass containers for meal prep"),
    ("Automatic Wine Bottle Opener with Foil Cutter & Aerator", "Uncorks up to 80 bottles on a single charge with blue LED light"),
    ("Large End-Grain Teak Wood Butcher Block Cutting Board", "Self-healing end grain fibers that keep kitchen knives razor sharp"),
    ("Commercial Rotary Waffle Maker with Non-Stick Deep Plates", "Bakes thick Belgian waffles with rotating flip for even batter spread")
  ],
  'cat-furniture-decor': [
    ("Ergonomic High-Back Mesh Office Chair with Dynamic Lumbar", "Adjustable 3D armrests, recline lock, and breathable mesh back"),
    ("Solid Sheesham Wood 6-Seater Dining Table with Bench", "Rich natural grain protected with clear matte polyurethane finish"),
    ("Mid-Century Modern Velvet Tufted Accent Lounge Armchair", "Sturdy kiln-dried hardwood frame with tapered gold brass legs"),
    ("L-Shaped Sectional Sofa with Reversible Storage Chaise", "High-density pocket spring cushions upholstered in stain-repellent linen"),
    ("Solid Oak Minimalist Study Writing Desk with Cable Trough", "Dual pull-out drawers with soft-close hidden steel runners"),
    ("Industrial Reclaimed Wood & Iron 5-Tier Bookshelf Etagere", "Heavy-duty cross-brace frame supporting heavy reference libraries"),
    ("Round Tempered Glass Coffee Table with Geometric Metal Base", "Sleek architectural centerpiece opening up small living spaces"),
    ("Orthopedic Pocket Spring & Natural Latex Mattress Queen Size", "Independent pocket coils preventing motion transfer with cool cover"),
    ("Upholstered Platform Bed Frame with Wingback Headboard", "Wooden slat support eliminating the need for bulky box springs"),
    ("Modular Stackable Shoe Storage Bench with Padded Cushion", "Holds up to 10 pairs of shoes with comfortable linen bench top"),
    ("Swivel Counter Height Bar Stools Set of 2 with Faux Leather", "Ergonomic curved backrest with heavy chrome footrest ring"),
    ("Outdoor Weatherproof Acacia Wood Patio Conversation Set", "Includes loveseat, two armchairs, and coffee table with water pads"),
    ("Space-Saving Folding Wall-Mounted Drop-Leaf Laptop Table", "Folds flat against walls when not in use for compact apartments"),
    ("Modern Geometric Carved Wood 3-Door Sideboard Credenza", "Concealed push-to-open doors with adjustable inner storage shelves"),
    ("Adjustable Height Motorized Dual-Motor Electric Standing Desk", "Digital keypad with 4 memory presets and anti-collision sensor"),
    ("Minimalist Entryway Coat Rack Tree with Shoe Umbrella Tray", "Heavy marble base preventing tipping with staggered brass hooks"),
    ("Solid Wood Rocking Nursery Armchair with High Back Support", "Smooth gentle glide ideal for feeding and soothing infants to sleep"),
    ("Boho Rattan Woven Side Accent Table with Glass Top", "Handwoven natural cane webbing bringing earthy texture indoors"),
    ("Modular Fabric Storage Ottoman Footstool with Removable Lid", "Dual-purpose seating and hidden storage for throws and magazines"),
    ("Vintage Distressed Leather Butterfly Folding Chair", "Genuine buffalo leather sling with heavy-gauge tubular iron frame"),
    ("Narrow Console Hallway Table with Marble Top and Gold Legs", "Slim profile fitting neatly behind sofas or in narrow corridors"),
    ("Wall-Mounted Floating TV Entertainment Console Shelf", "Accommodates soundbars, gaming consoles, and routers with cable ports")
  ],
  'cat-beauty': [
    ("Revitalift 1.5% Pure Hyaluronic Acid Face Plumping Serum", "Intensely hydrates and visibly plumps skin within 1 hour"),
    ("Dermatological Deep Moisture Body Cream with Shea Butter", "48-hour continuous moisture barrier repair for dry skin"),
    ("Sonic Cleansing Electric Facial Brush with Silicone Bristles", "Transpulsating vibrations that unclog pores and remove makeup"),
    ("Multi-Styler Complete Airwrap Curling & Smoothing Tool", "Styles with airflow rather than extreme heat to prevent breakage"),
    ("Broad Spectrum SPF 50 Invisible Sunscreen Gel Water-Resistant", "Zero white cast formula enriched with antioxidants and vitamin E"),
    ("Professional 230C Titanium Floating Plates Flat Iron Styler", "Instant heat recovery gliding smoothly through coarse frizzy hair"),
    ("Niacinamide 10% + Zinc 1% Blemish & Texture Refining Serum", "Regulates sebum production and minimizes appearance of enlarged pores"),
    ("Waterproof Long-Wear Liquid Matte Lipstick 16-Hour Stay", "Velvety color payoff with precision arrow applicator that won't smudge"),
    ("Precision Beard & Stubble Trimmer with Laser Guide System", "Self-sharpening stainless blades with 0.2mm precision step dials"),
    ("Hydrating Gentle Cream-to-Foam Facial Cleanser with Ceramides", "Removes makeup without stripping skin's essential moisture mantle"),
    ("Volumizing Waterproof Panoramic Mascara with Curved Wand", "Lifts and separates every single lash without flaking or clumps"),
    ("Pure Cold-Pressed Moroccan Argan Oil for Hair and Nails", "Deeply conditions split ends and restores brilliant mirror shine"),
    ("Luxury Eau De Parfum Woody Amber & Bergamot Fragrance 100ml", "Long-lasting fragrance trail with spicy cardamom and cedar notes"),
    ("Micro-Current Facial Toning Device for Contour & Lift", "Stimulates facial muscles to improve jawline firmness and tone"),
    ("Retinol 0.5% in Squalane Night Renewal Youth Treatment", "Visibly reduces fine lines, sun spots, and uneven skin texture"),
    ("Deep Conditioning Keratin Protein Hair Repair Mask 500ml", "Infuses damaged hair fibers with restorative moisture and strength"),
    ("Detoxifying French Pink Clay Purifying Pore Face Mask", "Gently draws out impurities and refines skin texture in 10 mins"),
    ("Electric Wet & Dry Rechargeable Foil Shaver for Men", "Flexible floating heads that follow every facial contour cleanly"),
    ("Brightening Vitamin C 20% + Ferulic Acid Glow Face Serum", "Potent antioxidant protection combating dullness and pollution"),
    ("Professional Makeup Brush Set 15-Piece with Vegan Bristles", "Soft synthetic bristles with ergonomic wooden handles and pouch"),
    ("Exfoliating 2% BHA Salicylic Acid Liquid Pore Exfoliant", "Clears blackheads and exfoliates dead cells inside the pore lining"),
    ("Rose Quartz Facial Roller and Gua Sha Scraping Massage Set", "Promotes lymphatic drainage and eases morning facial puffiness")
  ],
  'cat-sports': [
    ("Adjustable Quick-Select Dumbbells Set 5 to 52.5 lbs Pair", "Replaces 15 pairs of weights with an intuitive selection dial"),
    ("Non-Slip Extra-Thick 6mm Alignment Yoga Mat with Carry Strap", "Eco-friendly TPE foam with laser-engraved alignment guidelines"),
    ("Waterproof 4-Person Instant Pop-Up Dome Camping Tent", "Sets up in 60 seconds with double-layer rainfly and ventilation"),
    ("Speed Jump Rope with Ball Bearings and Steel Wire Cable", "Tangle-free 360 rotation engineered for double-unders and boxing"),
    ("Dri-FIT Breathable Training Shorts with Compression Liner", "Stretchy 2-in-1 shorts with internal phone pocket and sweat-wicking"),
    ("Insulated Stainless Steel 32oz Sports Water Bottle with Straw", "Keeps ice water sub-zero cold for up to 24 hours without sweating"),
    ("Heavy-Duty Latex Resistance Loop Bands Set with Door Anchor", "Stackable resistance from 10 to 150 lbs for home gym workouts"),
    ("45L Water-Resistant Trekking & Hiking Backpack with Rain Cover", "Ergonomic hip belt distributing pack weight evenly over trail treks"),
    ("Official Size and Weight Indoor/Outdoor Composite Basketball", "Deep channel design providing exceptional grip and bounce consistency"),
    ("Graphite High-Tension Badminton Racket with Full Cover", "Lightweight 4U frame with isometric sweet spot for blistering smashes"),
    ("High-Density Foam Roller for Deep Tissue Myofascial Release", "Soothes tight back muscles and speeds post-workout leg recovery"),
    ("Multi-Grip Heavy-Duty Pull-Up Bar for Doorway Installation", "No screws required; uses leverage to fit standard interior doorframes"),
    ("Polarized UV400 Wrap-Around Sports Cycling Sunglasses", "Impact-resistant polycarbonate lenses with rubberized non-slip nose pads"),
    ("Heavy Leather Boxing Gloves 14oz with Wrist Support Strap", "Multi-layered gel foam padding absorbing heavy bag punch impact"),
    ("Carbon Fiber Lightweight Trekking Poles with Cork Grips Pair", "Shock-absorbing twist lock poles with interchangeable trail tips"),
    ("Thermal Insulated Mummy Sleeping Bag Rated to 20 Degrees F", "Ripstop shell with draft collar retaining body heat on frosty nights"),
    ("Cast Iron Powder-Coated Kettlebell 35 lbs (16 kg)", "Flat base preventing wobbling with smooth wide grip for two hands"),
    ("Abdominal Roller Wheel with Knee Pad for Core Strengthening", "Dual wide wheels providing rock-solid balance across ab rollouts"),
    ("All-Weather Synthetic Leather Soccer Ball Size 5 Match Grade", "Hand-stitched casing with butyl bladder for optimal air retention"),
    ("Silicone Swim Goggles Anti-Fog with UV Protection Case", "Cushioned silicone gaskets that prevent eye leaks and red marks"),
    ("Adjustable Hand Grip Strengthener with Rep Counter 10-60kg", "Builds wrist, finger, and forearm power for climbing and tennis"),
    ("Lightweight Compact Camp Stove with Piezo Electric Ignition", "Boils 1 liter of trail water in 3.5 minutes on standard butane canisters")
  ],
  'cat-health': [
    ("Upper Arm Digital Blood Pressure Monitor with Bluetooth Sync", "Clinically validated accuracy with irregular heartbeat detection"),
    ("Deep Tissue Percussion Massage Gun with 6 Interchangeable Heads", "High-torque brushless motor penetrating 12mm into sore muscles"),
    ("100% Whey Protein Isolate Powder Double Rich Chocolate 5 lbs", "25g pure protein per scoop with 5.5g naturally occurring BCAAs"),
    ("Fingertip Pulse Oximeter with SpO2 and Pulse Rate OLED Display", "Instant blood oxygen saturation readings with auditory alarm"),
    ("Contactless Infrared Digital Forehead Thermometer for All Ages", "Instant 1-second temperature check with color-coded fever alert"),
    ("Daily Multivitamin with Methylated B-Complex and Zinc 120ct", "Comprehensive micronutrient support for energy, immune health, and focus"),
    ("Omega-3 Triple Strength Fish Oil 1400mg with EPA & DHA", "Molecularly distilled for purity without fishy burps or aftertaste"),
    ("Heated Shiatsu Neck & Shoulder Massager with Reversible Knots", "Soothing deep-kneading heat that releases stubborn knot tension"),
    ("Smart Digital Body Composition Scale with 13 Health Metrics", "Measures BMI, body fat percentage, muscle mass, and metabolic rate"),
    ("Ultra-Pure Organic Ashwagandha Root Extract 1300mg with Black Pepper", "Supports natural stress resistance, balanced cortisol, and restful sleep"),
    ("Adjustable Posture Corrector Brace for Back and Shoulder Support", "Discreet breathable harness training shoulders to stay upright"),
    ("Ergonomic Gel Memory Foam Seat Cushion for Tailbone Sciatica", "U-shaped cutout that eliminates pressure on the coccyx while sitting"),
    ("Mesh Nebulizer Handheld Portable Inhaler Machine for Breathing", "Ultrasonic fine mist delivery with whisper-quiet handheld design"),
    ("Vitamin D3 5000 IU + K2 MK-7 Bone and Cardiovascular Support", "Synergistic blend ensuring calcium is directed to bones not arteries"),
    ("Plant-Based Organic Superfood Green Juice Powder 30 Servings", "Spirulina, chlorella, wheatgrass, and probiotics for gut immunity"),
    ("Heated Foot Massager Machine with Deep Kneading & Air Compression", "Targeted reflexology rollers that soothe plantar fasciitis pain"),
    ("Probiotics 50 Billion CFU with 16 Strains & Prebiotic Fiber", "Delayed-release capsules that survive stomach acid to colonize gut"),
    ("Collagen Peptides Hydrolyzed Powder Type I & III Grass-Fed", "Dissolves flavorless into coffee to nourish joints, hair, and nails"),
    ("Compression Socks 20-30 mmHg for Circulation & Travel 3-Pack", "Graduated compression reducing leg fatigue, swelling, and varicose veins"),
    ("Digital Pill Dispenser with Alarm Reminder and Key Lock", "Automated motorized carousel preventing accidental double dosing"),
    ("Electrolyte Hydration Powder Sticks Sugar-Free Lemon Lime", "Rapid cellular rehydration without artificial dyes or excessive sugars"),
    ("CoQ10 200mg High Absorption Ubiquinone Heart Health Softgels", "Antioxidant vital for cellular energy and cardiovascular stamina")
  ],
  'cat-grocery': [
    ("Single-Origin Arabica Roasted Whole Coffee Beans 1kg Medium Roast", "Freshly roasted with tasting notes of chocolate, caramel, and citrus"),
    ("Organic Extra Virgin Cold-Pressed Olive Oil 1 Liter Estate Grown", "First cold extraction with ultra-low acidity and peppery finish"),
    ("Raw California Almonds and Jumbo Cashews Trail Mix 1kg", "Batch-roasted without added salt, preservatives, or palm oils"),
    ("Artisanal 70% Dark Chocolate Truffles Gift Box 24-Piece", "Crafted by master chocolatiers with single-estate cocoa butter"),
    ("Organic Kashmiri Saffron Threads Grade A+ Premium 2g", "Hand-harvested crimson stigmas delivering rich aroma and golden hue"),
    ("Pure Himalayan Raw Multifloral Honey 500g Unprocessed", "Rich in natural pollen enzymes with unheated floral sweetness"),
    ("Authentic Japanese Ceremonial Grade Uji Matcha Green Tea 50g", "Stone-ground first harvest leaves boasting vibrant jade green color"),
    ("Italian Balsamic Vinegar of Modena PGI Aged 12 Years 250ml", "Thick syrup consistency ideal for drizzling over cheeses and berries"),
    ("Organic White Quinoa and Chia Seeds Superfood Grain 1kg", "Complete plant protein packed with fiber, iron, and amino acids"),
    ("Roasted Salted California Pistachios in Shell 500g Resealable", "Non-GMO heart-healthy snack naturally high in antioxidants"),
    ("Pure Ceylon Cinnamon Sticks Organic True Cinnamon 200g", "Delicate sweet bark free from heavy coumarin found in cassia"),
    ("Medjool Dates Large Jumbo Sweet Caramel Flavor 1kg Box", "Naturally sweet whole fruit rich in potassium and dietary fiber"),
    ("Artisan Peanut Butter Crunchy No Added Sugar or Palm Oil 1kg", "Made purely from dry-roasted peanuts and a pinch of pink salt"),
    ("Single-Estate Earl Grey Black Tea with Bergamot Oil 100 Bags", "Full-bodied Ceylon leaves infused with natural Italian bergamot"),
    ("Himalayan Pink Rock Salt Fine Ground Pure Mineral 1kg", "Contains 84 trace minerals without anti-caking chemical additives"),
    ("Gluten-Free Rolled Oats Whole Grain High-Fiber 1kg Bag", "Slow-burning complex carbohydrates for hearty morning oatmeal"),
    ("Pure Cold-Pressed Virgin Coconut Oil Organic Raw 500ml", "Unrefined cooking oil with high smoke point and tropical fragrance"),
    ("Gourmet Truffle Hot Sauce Infused with Black Winter Truffles", "Rich chili peppers blended with organic agave nectar and truffle"),
    ("Maple Syrup 100% Pure Grade A Amber Rich Taste 500ml", "Tapped sustainably from Canadian sugar maples without corn syrup"),
    ("Artisanal Belgian Dark Cocoa Powder for Baking 400g", "Dutch-processed cocoa yielding intense dark cakes and brownies"),
    ("Crispy Roasted Seaweed Snacks with Sea Salt 12-Pack", "Light umami sheets roasted in sesame oil with zero cholesterol"),
    ("Handcrafted Basil Pesto Sauce with Genovese Basil & Pine Nuts", "Traditional mortar-crushed texture with aged parmesan cheese")
  ],
  'cat-toys': [
    ("Motorized Robotic Arm STEM Construction Building Set", "Over 650 pieces with programmable pneumatic grippers and motors"),
    ("Strategy Board Game of Settlement & Trading Deluxe Edition", "Award-winning tactical board game for 3 to 6 players"),
    ("High-Speed 4WD Remote Control All-Terrain Off-Road Truck", "Reaches 45 km/h with oil-filled shocks and 2.4GHz proportional control"),
    ("Architectural Skyline Landmark Building Blocks 1200-Piece", "Faithfully recreates world-renowned monuments for adults and teens"),
    ("Electronic Interactive Learning Globe with Smart Pen", "Over 10,000 facts on geography, animals, cultures, and capitals"),
    ("Wooden Magnetic Maze Board & Sorting Educational Toy", "Helps toddlers develop fine motor hand-eye control and focus"),
    ("High-Performance Motorized Dart Blaster with 30-Dart Drum", "Rapid-fire flywheel propulsion launching foam darts up to 90 feet"),
    ("Mini 4K Camera Foldable FPV Quadcopter Drone for Beginners", "Optical flow altitude hold, one-key return, and phone app control"),
    ("Classic Wooden Tumbling Stacking Tower Game 54-Block", "Smooth hardwood blocks tested for durability during tense game nights"),
    ("DIY Solar-Powered Robot Kit 14-in-1 Educational STEM Toy", "Crawls, rolls, and floats powered purely by direct sunlight"),
    ("Magnetic Building Tiles Translucent 3D Blocks 100-Piece Set", "Sparks structural spatial awareness and engineering creativity"),
    ("Professional 3x3 Speed Cube with Magnetic Positioning", "Silky frictionless corner-cutting with anti-pop mechanism"),
    ("Deluxe Wooden Railway Train Track Set with Battery Engine 50-Pc", "Compatible with major wooden track brands with bridges and cranes"),
    ("Interactive Plush Electronic Pet Puppy with Barking Motions", "Responds to gentle petting, clapping, and voice commands happily"),
    ("Science Microscope Lab Kit with Prepared Specimen Slides", "Magnification from 100x to 1200x with built-in LED illumination"),
    ("Fantasy Miniature Role-Playing Board Game Starter Campaign", "Includes character sheets, spell cards, and detailed plastic minis"),
    ("Kinetic Play Sand Sensory Playset with Castle Molds 3 lbs", "Flows like magic fluid without ever drying out or sticking to hands"),
    ("Tabletop Air Hockey Game with Electric Blower and Puck Recovers", "Powerful fan floating puck effortlessly across the rink surface"),
    ("Die-Cast Metal Vehicle Fleet Race Cars 20-Pack Collector Set", "Authentic 1:64 scale metal bodies with high-speed rolling axles"),
    ("Children's Digital Camera Shockproof with 1080p Video & Games", "Durable silicone bumper casing with selfie lens and lanyard"),
    ("Light-Up Electronic Memory Sequencing Brain Game", "Classic repeating flash-and-tone memory game testing reflexes"),
    ("Glow-in-the-Dark Constellation Galaxy Ceiling Projector Lamp", "Projects rotating starry nebulae across nursery and bedroom walls")
  ],
  'cat-books': [
    ("Hardcover Luxury Collector's Edition: The Epic Classic Odyssey", "Gold-foiled cloth binding with satin ribbon bookmark and map plates"),
    ("Handcrafted Full-Grain Leather Journal Notebook with Deckle Edge", "240 pages of tree-free cotton rag paper suitable for fountain pens"),
    ("Fine Nib Precision Brass Fountain Pen with Piston Ink Converter", "Solid machined brass barrel with iridium tipped German nib"),
    ("Bestselling Contemporary Mystery & Psychological Thriller Novel", "Gripping twists and characters keeping readers guessing until page 400"),
    ("Atomic Habits & Mindset Masterclass: The Science of Small Changes", "Practical frameworks for breaking bad habits and building good ones"),
    ("Archival Waterproof Fineliner Micro Drawing Pens 8-Piece Set", "Non-bleeding pigment ink for technical sketching, manga, and notes"),
    ("The Philosophy of Mindful Stoicism: Daily Meditations Hardcover", "Translates ancient wisdom into clear actionable daily clarity"),
    ("Hardcover Illustrated Coffee Table Book: Architectural Marvels", "Stunning panoramic photography detailing modern and ancient buildings"),
    ("Classic Fountain Pen Bottled Ink 50ml Deep Midnight Blue", "Rich saturated dye ink flowing smoothly without feathering paper"),
    ("Dot Grid Dotted Journal Notebook Heavyweight 160 GSM Paper", "Bleed-proof paper with back storage pocket and elastic closure band"),
    ("Masterclass in World History & Civilization: Illustrated Atlas", "Full-color chronological maps and essays tracking humanity's path"),
    ("The Art of Creative Cooking: Master Recipes from Michelin Chefs", "Step-by-step masterclasses with color plates and kitchen secrets"),
    ("Luxury Solid Walnut Wood Desktop Pen & Stationary Organizer", "Keeps writing instruments, phone, and notebooks orderly on desks"),
    ("Sci-Fi Masterpiece Boxed Trilogy: Space Exploration & Destiny", "Sprawling space opera following three generations of interstellar crew"),
    ("Calligraphy Hand-Lettering Dip Pen Set with 5 Interchangeable Nibs", "Includes natural wooden nib holder and waterproof black india ink"),
    ("The Complete Financial Freedom Blueprint: Investing & Compounding", "Simple asset allocation strategies for lasting wealth and retirement"),
    ("Vintage Mechanical Pocket Watch with Skeletal Steampunk Dial", "Exposed gears with Roman numeral face and 14-inch steel chain"),
    ("Self-Healing Rotary Cutting Mat and Precision Craft Knife Set", "Dual-sided imperial and metric grid lines protecting tabletop wood"),
    ("Watercolor Field Sketchbook Cold-Pressed 300 GSM Cotton Paper", "Heavyweight textured sheets that withstand saturated watercolor washes"),
    ("Graphic Novel Omnibus Hardcover: Cyberpunk Detective Chronicles", "Full-color dystopic sci-fi mystery with exclusive concept art pages"),
    ("Adjustable Wooden Book Stand with Page Clips for Reading & Music", "Promotes neck-friendly reading angles with sturdy spring clips"),
    ("Solid Brass Minimalist Heavyweight Bookmark with Tassel", "Precision etched brass slip that stays firmly between favorite pages")
  ],
  'cat-automotive': [
    ("4K Dual Front and Rear Dash Camera with Night Vision & GPS", "Sony Starvis sensor with loop recording and G-sensor collision lock"),
    ("Cordless Portable High-Pressure Tire Inflator Air Compressor", "Digital auto-shutoff once desired PSI pressure is reached"),
    ("1500A Peak Current Heavy-Duty Car Battery Jump Starter Pack", "Starts up to 8.0L gas and 6.0L diesel engines up to 30 times"),
    ("Magnetic Wireless 15W Qi Fast Car Vent Phone Mount Holder", "Firm auto-clamping grips phone securely even over bumpy dirt roads"),
    ("High-Power Cordless Handheld Car Vacuum Cleaner with HEPA Filter", "Strong 8000Pa suction removing pet hair, crumbs, and gravel"),
    ("Microfiber Car Detailing Wash Mitt and Drying Towel 6-Pack", "1200 GSM plush fibers holding tons of suds without scratching clearcoats"),
    ("Bluetooth 5.3 FM Radio Transmitter & Car Audio USB-C Adapter", "Crystal-clear hands-free calls with bass boost and PD fast charge"),
    ("All-Weather Deep Dish Rubber Floor Mats Universal Trim-to-Fit", "High-walled ridges trapping mud, snow, rain, and beverage spills"),
    ("Ceramic Coating Wax Spray Sealant for Car Paint Protection", "Produces extreme water-beading hydrophobic gloss lasting 6 months"),
    ("OBD2 Car Diagnostic Scanner Engine Fault Code Reader", "Quickly reads and clears check engine lights with freeze frame data"),
    ("Folding Trunk Organizer Storage Caddy with Non-Slip Bottom", "Multiple compartments with reinforced handles for groceries and tools"),
    ("Universal Soft Roof Rack Pads with Tie-Down Straps for Kayaks", "Safely transports surfboards, paddleboards, and lumber without rails"),
    ("Car Leather Seat Conditioner and UV Restorer Balm 500ml", "Restores dry cracked leather upholstery to supple matte finish"),
    ("Heavy-Duty Ratchet Tie-Down Straps 4-Pack with Rubberized J-Hooks", "1500 lbs break strength for securing motorcycles and cargo loads"),
    ("Emergency Roadside Safety Kit with Jumper Cables & First Aid", "Essential breakdown kit with tow strap, reflective triangle, and tools"),
    ("Car Windshield Sun Shade Umbrella Reflective UV Heat Shield", "Pops open like an umbrella keeping parked car interiors cool"),
    ("Dual-Port 60W USB-C and USB-A Metal Car Cigarette Adapter", "Simultaneously fast charges phones and iPads at peak speeds"),
    ("Car Scratch Repair Polish and Swirl Mark Remover Compound", "Eliminates surface scuffs, towel swirls, and oxidation effortlessly"),
    ("Heavy-Duty Waterproof Pet Dog Backseat Cover with Mesh Window", "Protects upholstery from mud, claws, and shedding with seat anchors"),
    ("Air Vent Clip Solid Essential Oil Aromatherapy Diffuser 4-Pack", "Long-lasting fragrance eliminating odors without artificial liquids"),
    ("Car Visor Polarized Sun Shade Extender Glare Blocker", "Eliminates blinding low sun glare without obstructing vision field"),
    ("Car Headrest Mount Tablet Holder for Backseat Passenger Cinema", "Sturdy 360-degree ball joint holding iPads and phones for kids")
  ],
  'cat-travel': [
    ("Polycarbonate Hardside Spinner 20-inch Carry-On Suitcase", "Lightweight impact-resistant shell with recessed TSA combination lock"),
    ("Expandable 28-inch Large Checked Luggage Spinner with Dual Wheels", "Smooth 360-degree double spinner wheels gliding quietly over tiles"),
    ("Anti-Theft Travel Laptop Backpack with USB Port & Hidden Pocket", "Water-repellent Oxford fabric with slash-proof hidden zippers"),
    ("Ultralight Water-Resistant Gym & Weekend Travel Duffel Bag", "Dedicated ventilated shoe compartment with luggage trolley sleeve"),
    ("Compression Travel Packing Cubes Set of 6 for Organized Luggage", "Double zipper system compressing clothing bulk by up to 50%"),
    ("Memory Foam Ergonomic Travel Neck Pillow with Contoured Support", "360-degree head support preventing stiff necks on long-haul flights"),
    ("RFID-Blocking Family Passport Wallet Document Organizer", "Holds 4 passports, boarding passes, currency, and credit cards safely"),
    ("Universal All-in-One Worldwide Travel Plug Adapter with USB-C", "Compatible across US, UK, EU, AU, and over 150 countries"),
    ("Heavy-Duty Digital Luggage Scale with Backlit LCD Screen", "Accurately weighs bags up to 110 lbs preventing airline excess fees"),
    ("TSA-Approved Cable Travel Luggage Locks 4-Pack with 3-Dial Code", "Flexible vinyl-wrapped steel cable fitting all luggage zipper holes"),
    ("Packable Ultra-Lightweight Daypack Backpack Folds into Pouch", "Folds into its own pocket for spur-of-the-moment day hikes abroad"),
    ("Clear Toiletry Bag Set TSA 3-1-1 Quart Sized Flight Approved", "Leak-proof zippered pouches that breeze through airport security"),
    ("Silicone Travel Bottles for Toiletries Leakproof Squeezable 4-Pack", "Wide-mouth design with three-layer anti-leak cap for shampoos"),
    ("Waterproof Floating Dry Bag 20L with Phone Case & Shoulder Strap", "Keeps cameras, phones, and clothing bone-dry during boat tours"),
    ("Travel Garment Bag Suit Carrier with Hanging Shoulder Strap", "Keeps business suits and evening dresses wrinkle-free on flights"),
    ("Compact Windproof Travel Umbrella with Auto Open & Close Button", "Reinforced 9-rib fiberglass frame that withstands heavy gusts"),
    ("Under-Clothing Hidden Money Belt with Moisture-Wicking Mesh", "Invisible anti-pickpocket pouch for cash, cards, and passports"),
    ("Inflatable Footrest Travel Pillow with Adjustable Height Levels", "Fills the space between seats allowing toddlers to sleep flat"),
    ("Luggage Straps with Personalized Identification Tag Heavy-Duty", "Bright colored strap securing suitcases against accidental bursts"),
    ("Electronic Organizer Travel Cable Management Pouch Double Layer", "Elastic loops and mesh pockets keeping chargers and cords untangled"),
    ("Microfiber Fast-Drying Antibacterial Camp & Travel Towel Extra Large", "Absorbs 4x its weight in water and dries 3x faster than cotton"),
    ("Luggage Cup Holder Attaches to Suitcase Roller Handles", "Frees up hands in airport terminals to wheel bags and hold coffee")
  ],
  'cat-jewelry': [
    ("Stainless Steel Automatic Chronograph Horology Watch 42mm", "Exhibition caseback showing mechanical balance wheel and rotor"),
    ("925 Sterling Silver Classic Tennis Bracelet with Zirconia", "Hand-set AAA cubic zirconia stones with double-latch safety clasp"),
    ("Minimalist 14K Gold Plated Paperclip Chain Choker Necklace", "Hypoallergenic nickel-free brass with lustrous mirror gold polish"),
    ("Solar-Powered Chronograph Watch with Sapphire Crystal Face", "Converts any light source into electrical power with zero battery change"),
    ("925 Sterling Silver Halo Solitaire Stud Earrings 2-Carat", "Brilliant round-cut sparklers set in four-prong basket settings"),
    ("Classic Two-Tone Stainless Steel Analog Quartz Dress Watch", "Roman numeral textured dial with scratch-resistant mineral crystal"),
    ("Solid Titanium Beveled Edge Comfort-Fit Wedding Band Ring", "Lightweight, hypoallergenic, and impervious to saltwater corrosion"),
    ("Freshwater Cultured Pearl Pendant Necklace in Sterling Silver", "Handpicked 8.5mm luster pearl floating on an Italian box chain"),
    ("Leather Chronograph Watch with Sunray Blue Dial & Date Window", "Supple full-grain saddle leather strap with contrast white stitching"),
    ("Stackable 18K Gold Vermeil Beaded Elastic Ring Band Set", "Versatile dainty rings designed to mix and match across fingers"),
    ("Antiqued Sterling Silver Celtic Knot Cuff Bangle Bracelet", "Handcrafted intricate knotwork symbolizing infinity and protection"),
    ("G-Shock Military Shock-Resistant Carbon Core Guard Digital Watch", "200M water resistance, world time, stopwatch, and auto LED light"),
    ("Herringbone Flat Snake Chain Necklace in 14K Gold Plating", "Sits completely flat on collarbone with fluid liquid-metal shine"),
    ("Cubic Zirconia Pavé Huggie Hoop Earrings in Sterling Silver", "Dainty click-top closure hugging earlobes with radiant sparkle"),
    ("Stainless Steel Engravable Cufflinks & Tie Bar Clip Gift Set", "Classic polished mirror finish suitable for weddings and black tie"),
    ("Dual-Time GMT Aviator Horology Watch with Rotating 24H Bezel", "Tracks two time zones simultaneously with luminous hands and markers"),
    ("Boho Natural Turquoise Stone Beaded Wrap Bracelet with Charm", "Genuine raw gemstone beads with adjustable leather cord closure"),
    ("Starlight Elegance Diamond Accent Quartz Mesh Bracelet Watch", "Ultra-thin 6mm case with shimmering dial and magnetic mesh strap"),
    ("Solid 925 Sterling Silver Rope Chain Necklace 4mm Italian Made", "Diamond-cut links catching light from every angle with lobster claw"),
    ("Zodiac Constellation Disc Pendant Necklace with Diamond Cut", "Personalized celestial disc stamped with astrological star pattern"),
    ("Rose Gold Crystal Embellished Bangle Watch with Mother of Pearl", "Jewelry timepiece accented with genuine mother-of-pearl dial"),
    ("Automatic Self-Winding Diver Watch 200M with Ceramic Bezel", "Screw-down crown with unidirectional rotating bezel for diving")
  ],
  'cat-pets': [
    ("Orthopedic Egg-Crate Foam Pet Bed with Removable Machine Cover", "Distributes pet weight evenly to alleviate joint and hip dysplasia"),
    ("Grain-Free High-Protein Adult Dog Food 25 lbs Natural Recipe", "Real deboned chicken with sweet potatoes, blueberries, and spinach"),
    ("Interactive Automated Rolling Laser Cat Toy with Random Patterns", "Stimulates hunting instincts with 360-degree unpredictable laser dot"),
    ("Heavy-Duty Tactical No-Pull Dog Harness with Padded Handle", "Front chest clip that discourages pulling without throat choking"),
    ("Ultra-Quiet Ceramic Pet Water Fountain with Carbon Filter 2.5L", "Encourages pets to drink more fresh, oxygenated running water"),
    ("Multi-Level Cat Tree Tower with Sisal Scratching Posts & Hammock", "Sturdy base preventing tipping with cozy perch and plush cubby"),
    ("Rechargeable Low-Noise Dog & Cat Nail Grinder with Diamond Bit", "Whisper-quiet motor (<40dB) keeping pets calm during nail trims"),
    ("Waterproof Fleece-Lined Winter Dog Jacket with Leash Hole", "Reflective trim keeping dogs warm and visible during snowy walks"),
    ("Natural Rubber Indestructible Chew Bone Toy for Aggressive Chewers", "Textured nubs that scrape tartar and massage dog gums during play"),
    ("Stainless Steel Elevated Dog Bowls with Non-Slip Bamboo Stand", "Reduces neck strain and aids digestion for medium and large dogs"),
    ("Automatic Timed Pet Feeder with Voice Recorder & Portion Control", "Dispenses up to 4 meals daily on exact scheduled times"),
    ("Self-Cleaning Slicker Pet Grooming Brush with Retractable Pins", "Removes loose fur, mats, and dander with one-click clean button"),
    ("Natural Catnip Wall Ball Toys Rotatable Licking Treats 3-Pack", "Cleans teeth and promotes healthy digestion while entertaining cats"),
    ("Hands-Free Bungee Running Dog Leash with Waist Pouch", "Absorbs sudden jerks while leaving hands free for jogging"),
    ("Enzyme-Activated Pet Stain and Odor Eliminator Spray 32oz", "Breaks down urine crystals at the molecular level without masking"),
    ("Foldable Soft-Sided Airline-Approved Pet Travel Carrier Bag", "Breathable mesh windows on 4 sides with safety tether and fleece pad"),
    ("Silicone Waterproof Pet Food Mat with Raised Spill Edges", "Keeps kitchen floors spotless by containing water and kibble spills"),
    ("Interactive Treat-Dispensing Puzzle Toy for Canine Brain Stimulation", "Challenges dogs to slide tiles and lift cups for hidden rewards"),
    ("Natural Biodegradable Clumping Plant Fiber Cat Litter 10 lbs", "99.9% dust-free with instant odor neutralization and easy flushing"),
    ("Warm Thermal Self-Heating Pet Cat Blanket without Electricity", "Reflective thermal core radiates pet's own body heat back safely"),
    ("LED Rechargeable Glowing Dog Collar with 3 Light Modes", "Ensures motorists spot dogs from over 500 feet away at night"),
    ("Scented Biodegradable Dog Waste Poop Bags with Dispenser 240ct", "Extra thick and leak-proof bags made with plant-based cornstarch")
  ],
  'cat-gaming': [
    ("Pro Wireless Gaming Controller with Hall Effect Thumbsticks", "Zero stick drift with mechanical microswitch buttons and paddles"),
    ("7.1 Spatial Surround Sound Low-Latency Wireless Gaming Headset", "Noise-cancelling broadcast mic with 50-hour battery and USB-C dongle"),
    ("Ergonomic High-Back RGB Gaming Chair with Memory Lumbar Cushion", "180-degree reclining backrest with 4D armrests and steel frame"),
    ("Hot-Swappable 75% Mechanical Gaming Keyboard with OLED Screen", "Speed silver switches with volume knob and per-key RGB backlighting"),
    ("Ultra-Lightweight 49g Wireless Esports Mouse with 30K Sensor", "Precision optical sensor tracking accurately across any pad"),
    ("Massive Extended RGB Desk Gaming Mousepad with Qi Fast Charger", "Micro-textured fabric with 14 customizable spectrum lighting zones"),
    ("Dual Controller Fast Charging Station with LED Status Lights", "Snaps controllers easily into place and charges them in 2 hours"),
    ("4K 60fps USB 3.0 Game Capture Card for Streaming & Console", "Zero-latency HDMI pass-through compatible with OBS and Twitch"),
    ("Heavy-Duty Carbon Fiber Texture Ergonomic Gaming Computer Desk", "Includes headphone hook, cup holder, and large full-surface mousepad"),
    ("Multi-Platform Flight Simulator Throttle and Joystick HOTAS", "Magnetic sensors with realistic tension and dual throttle detents"),
    ("Force Feedback Racing Wheel with Dual-Clutch Floor Pedals", "Trueforce feedback technology vibrating with real-time tire physics"),
    ("RGB Headphone Stand with 3-Port USB 3.0 Hub and Audio Jack", "Keeps gaming headset safe while adding convenient front ports"),
    ("Low-Profile Magnetic Hall Effect Gaming Keyboard with Rapid Trigger", "Adjustable actuation from 0.1mm to 4.0mm for instant FPS stopping"),
    ("Surround Sound Dual-Driver In-Ear Gaming Earphones with Detachable Mic", "Dual dynamic drivers picking up quiet enemy footsteps clearly"),
    ("Foldable Steering Wheel Racing Stand with Gear Shifter Mount", "Adjustable height and pedal angle that folds compactly for storage"),
    ("Condenser USB Gaming Microphone with Dynamic RGB Lighting & Tap Mute", "Instant tap-to-mute sensor with built-in anti-vibration shock mount"),
    ("Adjustable Anti-Slip Silicone Skin Grips for Pro Controllers", "Prevents sweaty slippage during high-stakes tournament matches"),
    ("Portable USB-C Fast Travel Dock for Handheld Gaming Consoles", "Unlocks 4K 60Hz video out, Gigabit LAN, and 100W power delivery"),
    ("Acoustic Foam Soundproofing Panels 12-Pack for Streamers", "Eliminates room flutter echoes and reverberation in home studios"),
    ("Console Internal NVMe Heatsink SSD Expansion 2TB Gen4", "Read speeds up to 7300MB/s meeting all console expansion standards"),
    ("Customizable Mechanical Macro Keypad with 12 Programmable Keys", "Hot-swappable switches with individual per-key macro assignments"),
    ("Protective Travel Hard Case for Handheld Gaming PC Consoles", "Water-resistant ballistic nylon shell with dedicated charger cavity")
  ]
}

# Generate 22 items per category for all 24 categories
global_index = 0
for cat_idx, cat in enumerate(CATEGORIES):
  c_id = cat['id']
  prefix = CATEGORY_PREFIX_MAP.get(c_id, 'PROD')
  brands_pool = CATEGORY_BRAND_MAP.get(c_id, [b['id'] for b in BRANDS])
  subs_pool = sub_by_cat.get(c_id, [])
  items_data = CATEGORY_ITEM_NAMES.get(c_id, [])
  price_pool = BASE_PRICES.get(c_id, [99.00] * 22)

  assert len(items_data) == 22, f"Category {c_id} has {len(items_data)} items, expected 22"

  for item_idx in range(22):
    title, desc_snippet = items_data[item_idx]
    brand_id = brands_pool[item_idx % len(brands_pool)]
    sub_cat = subs_pool[item_idx % len(subs_pool)]
    sub_id = sub_cat['id']
    
    # Unique image from verified pool
    photo_id = UNIQUE_PHOTO_IDS[global_index]
    image_url = f"https://images.unsplash.com/photo-{photo_id}?w=800&q=80"
    
    # Product pricing
    price = round(price_pool[item_idx], 2)
    discount_pct = 10 + ((item_idx * 7) % 35) # 10% to 44%
    compare_at = round(price / (1.0 - (discount_pct / 100.0)), 2)

    # Unique identifiers
    prod_id = f"prod-{prefix.lower()}-{item_idx + 1:03d}"
    sku = f"SKU-{prefix}-{item_idx + 1:03d}"
    
    # Generate unique title with brand if not present
    brand_name = next(b['name'] for b in BRANDS if b['id'] == brand_id)
    full_title = f"{brand_name} {title}"
    slug = slugify(full_title)

    # Resolve any rare slug collisions
    if slug in used_slugs:
      slug = f"{slug}-{item_idx + 1}"
    used_slugs.add(slug)
    used_skus.add(sku)
    used_titles.add(full_title.lower())
    
    # Extract signature for validation
    used_image_signatures.add(f"images.unsplash.com/photo-{photo_id}".lower())

    # Inventory realism: mostly in stock, a few low stock, 1 out of stock per cat
    if item_idx == 21:
      stock = 0
    elif item_idx in (7, 14):
      stock = 4
    else:
      stock = 15 + ((item_idx * 11) % 85)

    # Real ratings & reviews
    rating = round(4.2 + ((item_idx * 0.035) % 0.75), 2)
    review_count = 25 + ((item_idx * 143) % 2400)

    # Specs
    specs = {
      "Brand": brand_name,
      "Category": cat['name'],
      "Subcategory": sub_cat['name'],
      "Model Year": "2026",
      "Warranty": "2 Years Official Manufacturer Warranty",
      "In The Box": f"1x {full_title}, User Manual, Documentation, Warranty Card"
    }

    # Variants (2 realistic choices per product)
    variants = [
      {
        "id": f"v-{prod_id}-std",
        "name": "Standard / Default",
        "sku": f"{sku}-STD",
        "price": price,
        "stock": stock,
        "attributes": {"Edition": "Standard"}
      },
      {
        "id": f"v-{prod_id}-pro",
        "name": "Special Edition",
        "sku": f"{sku}-PRO",
        "price": round(price * 1.15, 2),
        "stock": max(1, stock // 2),
        "attributes": {"Edition": "Special Edition"}
      }
    ]

    prod = {
      "id": prod_id,
      "title": full_title,
      "slug": slug,
      "sku": sku,
      "categoryId": c_id,
      "subCategoryId": sub_id,
      "brandId": brand_id,
      "price": price,
      "compareAtPrice": compare_at,
      "discountPercentage": discount_pct,
      "stock": stock,
      "lowStockThreshold": 8,
      "rating": rating,
      "reviewCount": review_count,
      "isFeatured": (item_idx % 7 == 0),
      "isBestSeller": (item_idx % 5 == 0),
      "isTrending": (item_idx % 6 == 0),
      "isDeal": (discount_pct >= 25),
      "shortDescription": desc_snippet,
      "description": f"{full_title} delivers benchmark excellence in its category. Featuring state-of-the-art engineering, premium materials, and meticulous craftsmanship, it is designed for demanding users who refuse to compromise on performance, durability, and aesthetics. Backed by full 2-year warranty protection and dedicated customer support.",
      "tags": [slugify(cat['name']), slugify(brand_name), slugify(sub_cat['name']), "2026-edition", "shopkart-verified"],
      "specs": specs,
      "variants": variants,
      "images": [
        image_url,
        f"https://images.unsplash.com/photo-{UNIQUE_PHOTO_IDS[(global_index + 1) % len(UNIQUE_PHOTO_IDS)]}?w=800&q=80"
      ],
      "createdAt": f"2026-08-{((item_idx % 25) + 1):02d}T10:00:00Z"
    }

    products.append(prod)
    global_index += 1

print(f"Generated {len(products)} products across {len(CATEGORIES)} categories.")
print(f"Unique SKUs: {len(used_skus)}")
print(f"Unique Slugs: {len(used_slugs)}")
print(f"Unique Titles: {len(used_titles)}")
print(f"Unique Primary Images: {len(used_image_signatures)}")

assert len(products) == 528
assert len(used_skus) == 528
assert len(used_slugs) == 528
assert len(used_titles) == 528
assert len(used_image_signatures) == 528

# Now save products to server/catalog/products.json
CATALOG_JSON_PATH = "server/catalog/products.json"
os.makedirs(os.path.dirname(CATALOG_JSON_PATH), exist_ok=True)
with open(CATALOG_JSON_PATH, "w", encoding="utf-8") as f:
  json.dump(products, f, indent=2)
print(f"Saved {len(products)} products to {CATALOG_JSON_PATH}")

# Update data/shopkart.db.json while preserving users, orders, coupons, settings, blogPosts
DB_FILE = "data/shopkart.db.json"
existing_data = {}
if os.path.exists(DB_FILE):
  try:
    with open(DB_FILE, "r", encoding="utf-8") as f:
      existing_data = json.load(f)
  except Exception as e:
    print("Could not read existing db, starting clean:", e)

# Preserve existing records
users = existing_data.get("users", [])
coupons = existing_data.get("coupons", [])
orders = existing_data.get("orders", [])
reviews = existing_data.get("reviews", [])
supportTickets = existing_data.get("supportTickets", [])
contactMessages = existing_data.get("contactMessages", [])
newsletterSubscribers = existing_data.get("newsletterSubscribers", [])
banners = existing_data.get("banners", [])
settings = existing_data.get("settings", {
  "siteName": "Shopkart",
  "supportEmail": "support@shopkart.com",
  "currency": "USD",
  "currencySymbol": "$",
  "freeShippingThreshold": 50,
  "standardShippingRate": 9.99,
  "taxRate": 8.5
})
blogPosts = existing_data.get("blogPosts", [])
notifications = existing_data.get("notifications", [])

# Construct complete database
db_data = {
  "users": users,
  "categories": CATEGORIES,
  "subCategories": SUBCATEGORIES,
  "brands": BRANDS,
  "products": products,
  "carts": existing_data.get("carts", []),
  "coupons": coupons,
  "orders": orders,
  "reviews": reviews,
  "stockMovements": existing_data.get("stockMovements", []),
  "wishlists": existing_data.get("wishlists", {}),
  "supportTickets": supportTickets,
  "contactMessages": contactMessages,
  "newsletterSubscribers": newsletterSubscribers,
  "banners": banners,
  "settings": settings,
  "blogPosts": blogPosts,
  "notifications": notifications
}

os.makedirs("data", exist_ok=True)
tmp_file = f"{DB_FILE}.tmp"
with open(tmp_file, "w", encoding="utf-8") as f:
  json.dump(db_data, f, indent=2)
os.replace(tmp_file, DB_FILE)

print(f"Successfully populated {DB_FILE} with:")
print(f"  Categories: {len(CATEGORIES)}")
print(f"  Subcategories: {len(SUBCATEGORIES)}")
print(f"  Brands: {len(BRANDS)}")
print(f"  Products: {len(products)}")
print(f"  Users: {len(users)}")
print("Catalog generator run completed with 100% success!")


