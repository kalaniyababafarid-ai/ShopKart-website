#!/usr/bin/env python3
import json
import os
import re

# 1. Categories (24 Major Categories)
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

# 2. Subcategories (72 Subcategories)
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
  {"id": "sub-mens-tshirts", "categoryId": "cat-mens-fashion", "name": "T-Shirts & Polos", "slug": "mens-tshirts"},
  {"id": "sub-mens-jeans", "categoryId": "cat-mens-fashion", "name": "Jeans & Trousers", "slug": "mens-jeans"},
  {"id": "sub-mens-jackets", "categoryId": "cat-mens-fashion", "name": "Jackets & Hoodies", "slug": "mens-jackets"},

  {"id": "sub-womens-dresses", "categoryId": "cat-womens-fashion", "name": "Dresses & Jumpsuits", "slug": "womens-dresses"},
  {"id": "sub-womens-ethnic", "categoryId": "cat-womens-fashion", "name": "Ethnic Kurta Sets & Sarees", "slug": "womens-ethnic"},
  {"id": "sub-womens-tops", "categoryId": "cat-womens-fashion", "name": "Tops, Tees & Blouses", "slug": "womens-tops"},
  {"id": "sub-womens-bottoms", "categoryId": "cat-womens-fashion", "name": "Pants, Jeans & Skirts", "slug": "womens-bottoms"},

  {"id": "sub-kids-boys", "categoryId": "cat-kids-fashion", "name": "Boys Clothing", "slug": "boys-clothing"},
  {"id": "sub-kids-girls", "categoryId": "cat-kids-fashion", "name": "Girls Dresses & Sets", "slug": "girls-dresses"},
  {"id": "sub-kids-infant", "categoryId": "cat-kids-fashion", "name": "Infants & Toddlers Wear", "slug": "infants-wear"},

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

# Brands (38 Brands)
BRANDS = [
  {"id": "brand-apple", "name": "Apple", "slug": "apple", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&q=80", "description": "Cupertino Silicon chips, iPhones, MacBooks, and iPads.", "isFeatured": True},
  {"id": "brand-samsung", "name": "Samsung", "slug": "samsung", "logo": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&q=80", "description": "Global titan in Dynamic AMOLED displays and Galaxy smartphones.", "isFeatured": True},
  {"id": "brand-sony", "name": "Sony", "slug": "sony", "logo": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80", "description": "Gold-standard Japanese audio engineering and PlayStation gaming.", "isFeatured": True},
  {"id": "brand-bose", "name": "Bose", "slug": "bose", "logo": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&q=80", "description": "World-renowned acoustic research and QuietComfort spatial audio.", "isFeatured": True},
  {"id": "brand-jbl", "name": "JBL", "slug": "jbl", "logo": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", "description": "Pro Sound signature portable speakers and home soundbars.", "isFeatured": True},
  {"id": "brand-boat", "name": "boAt", "slug": "boat", "logo": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80", "description": "India’s leading lifestyle audio and smart wearables brand.", "isFeatured": True},
  {"id": "brand-oneplus", "name": "OnePlus", "slug": "oneplus", "logo": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&q=80", "description": "Fluid 120Hz displays, Hasselblad cameras, and SUPERVOOC fast charging.", "isFeatured": True},
  {"id": "brand-nothing", "name": "Nothing", "slug": "nothing", "logo": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=200&q=80", "description": "Iconic transparent industrial design with Glyph lighting interface.", "isFeatured": True},
  {"id": "brand-xiaomi", "name": "Xiaomi", "slug": "xiaomi", "logo": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80", "description": "Flagship smartphones, Leica optics, and smart home ecosystem.", "isFeatured": True},
  {"id": "brand-realme", "name": "Realme", "slug": "realme", "logo": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&q=80", "description": "Trendsetting youth smartphones, curved AMOLEDs, and fast charging.", "isFeatured": False},
  {"id": "brand-dell", "name": "Dell", "slug": "dell", "logo": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200&q=80", "description": "Industry benchmark XPS laptops and UltraSharp color-accurate displays.", "isFeatured": True},
  {"id": "brand-hp", "name": "HP", "slug": "hp", "logo": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&q=80", "description": "Spectre convertible laptops and Omen high-power gaming rigs.", "isFeatured": True},
  {"id": "brand-lenovo", "name": "Lenovo", "slug": "lenovo", "logo": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80", "description": "Legendary ThinkPad durability and Legion high-FPS gaming systems.", "isFeatured": True},
  {"id": "brand-asus", "name": "ASUS", "slug": "asus", "logo": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&q=80", "description": "ROG Republic of Gamers hardware and Zenbook dual-OLED notebooks.", "isFeatured": True},
  {"id": "brand-acer", "name": "Acer", "slug": "acer", "logo": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=200&q=80", "description": "Predator cooling and lightweight Swift Go notebooks.", "isFeatured": False},
  {"id": "brand-logitech", "name": "Logitech", "slug": "logitech", "logo": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80", "description": "Ergonomic MX Master mice and Lightspeed gaming peripherals.", "isFeatured": True},
  {"id": "brand-canon", "name": "Canon", "slug": "canon", "logo": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=80", "description": "Full-frame EOS mirrorless cinema imaging and RF lenses.", "isFeatured": False},
  {"id": "brand-nike", "name": "Nike", "slug": "nike", "logo": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80", "description": "Just Do It athletics, ZoomX super-foams, and Air cushioning.", "isFeatured": True},
  {"id": "brand-adidas", "name": "Adidas", "slug": "adidas", "logo": "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200&q=80", "description": "Continental rubber outsoles, Ultraboost energy return, and Originals.", "isFeatured": True},
  {"id": "brand-puma", "name": "Puma", "slug": "puma", "logo": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&q=80", "description": "Forever Faster athletic shoes and Nitro foam marathon racers.", "isFeatured": True},
  {"id": "brand-levis", "name": "Levi's", "slug": "levis", "logo": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80", "description": "The authentic American denim legacy with 501 originals.", "isFeatured": True},
  {"id": "brand-dyson", "name": "Dyson", "slug": "dyson", "logo": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&q=80", "description": "Root cyclone air filtration and Hyperdymium vacuum motors.", "isFeatured": True},
  {"id": "brand-philips", "name": "Philips", "slug": "philips", "logo": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80", "description": "Hue circadian smart lighting and Sonicare oral wellness.", "isFeatured": True},
  {"id": "brand-panasonic", "name": "Panasonic", "slug": "panasonic", "logo": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&q=80", "description": "Japanese craftsmanship in kitchen appliances and groomers.", "isFeatured": False},
  {"id": "brand-breville", "name": "Breville", "slug": "breville", "logo": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80", "description": "Commercial 58mm espresso extractions and ThermoJet heating.", "isFeatured": False},
  {"id": "brand-fossil", "name": "Fossil", "slug": "fossil", "logo": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&q=80", "description": "Vintage American horology, chronograph dials, and genuine leather.", "isFeatured": True},
  {"id": "brand-casio", "name": "Casio", "slug": "casio", "logo": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&q=80", "description": "G-Shock shock-absorbent quartz watches and Edifice solar chronographs.", "isFeatured": True},
  {"id": "brand-titan", "name": "Titan", "slug": "titan", "logo": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80", "description": "India’s premier watchmaker delivering Edge slim calibers and Grandmaster timepieces.", "isFeatured": True},
  {"id": "brand-fastrack", "name": "Fastrack", "slug": "fastrack", "logo": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80", "description": "Bold youth accessories and dynamic Bluetooth calling smartwatches.", "isFeatured": False},
  {"id": "brand-amazfit", "name": "Amazfit", "slug": "amazfit", "logo": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&q=80", "description": "Dual-band circularly polarized GPS and 14-day AMOLED battery stamina.", "isFeatured": True},
  {"id": "brand-anker", "name": "Anker", "slug": "anker", "logo": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&q=80", "description": "GaNPrime gallium nitride charging blocks and PowerCore powerbanks.", "isFeatured": True},
  {"id": "brand-prestige", "name": "Prestige", "slug": "prestige", "logo": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&q=80", "description": "Trusted Indian kitchenware leader in Svachh pressure cookers and pans.", "isFeatured": True},
  {"id": "brand-american-tourister", "name": "American Tourister", "slug": "american-tourister", "logo": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=200&q=80", "description": "Resilient polypropylene spinner luggage with TSA locks.", "isFeatured": True},
  {"id": "brand-safari", "name": "Safari", "slug": "safari", "logo": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80", "description": "Ergonomic water-resistant urban backpacks and expandable check-in bags.", "isFeatured": False},
  {"id": "brand-loreal", "name": "L'Oréal", "slug": "loreal", "logo": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80", "description": "Hyaluronic acid revitalift serums and professional salon hair repair.", "isFeatured": True},
  {"id": "brand-nivea", "name": "Nivea", "slug": "nivea", "logo": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", "description": "Dermatologically certified deep moisture creams and body lotions.", "isFeatured": False},
  {"id": "brand-tp-link", "name": "TP-Link", "slug": "tp-link", "logo": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&q=80", "description": "Archer Wi-Fi 6E/7 gigabit mesh routers and smart plugs.", "isFeatured": False}
]

print(f"Categories: {len(CATEGORIES)}, SubCategories: {len(SUBCATEGORIES)}, Brands: {len(BRANDS)}")
