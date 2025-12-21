"""
Seed script to populate the database with shop products.

Creates mock products for all categories: supplements, equipment, apparel,
accessories, nutrition, recovery, and tech.

Usage:
    python seed_shop.py
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.orm import Session
from slugify import slugify

from app.core.database import SessionLocal, engine, Base

# Import routes to trigger all model loading (same as main.py)
from app.routes import auth, users, onboarding, profile, measurements, goals, notifications, devices
from app.routes import auth_enhanced, admin, coach, exercises, workouts, nutrition, progress_photos, achievements, supplements, shop, chat

from app.models.shop import Product, ProductCategory


def create_product(db: Session, **kwargs):
    """Helper to create a product with slug generation."""
    if 'slug' not in kwargs:
        kwargs['slug'] = slugify(kwargs['name'])

    # Check if product already exists
    existing = db.query(Product).filter(Product.slug == kwargs['slug']).first()
    if existing:
        print(f"  Skipping '{kwargs['name']}' (already exists)")
        return existing

    product = Product(**kwargs)
    db.add(product)
    print(f"  Created '{kwargs['name']}'")
    return product


def seed_products(db: Session):
    """Seed the database with shop products."""

    print("\nSeeding Shop Products\n")
    print("=" * 60)

    products_data = [
        # ========== SUPPLEMENTS ==========
        {
            "name": "Optimum Nutrition Gold Standard Whey",
            "description": "The world's best-selling whey protein powder. 24g of protein per serving with 5.5g of BCAAs. Available in 20+ delicious flavors.",
            "short_description": "Premium whey protein - 24g protein per serving",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "Optimum Nutrition",
            "price": 59.99,
            "compare_at_price": 74.99,
            "sku": "ON-WHEY-5LB",
            "stock_quantity": 150,
            "weight_kg": 2.27,
            "images": ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
            "features": ["24g Protein", "5.5g BCAAs", "Low Fat", "Gluten Free"],
            "specifications": {"servings": "74", "flavor": "Double Rich Chocolate", "protein_source": "Whey Isolate & Concentrate"},
            "average_rating": 4.8,
            "rating_count": 2847,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "MuscleTech Nitro-Tech Whey Gold",
            "description": "Superior whey protein formula with added creatine and amino acids for maximum muscle building potential.",
            "short_description": "Whey protein with creatine boost",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "MuscleTech",
            "price": 54.99,
            "compare_at_price": 64.99,
            "sku": "MT-NITRO-5LB",
            "stock_quantity": 89,
            "weight_kg": 2.27,
            "images": ["https://images.unsplash.com/photo-1579722821273-0f6c1d44979e?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1579722821273-0f6c1d44979e?w=400",
            "features": ["24g Protein", "5.5g BCAAs", "3g Creatine", "Build Muscle"],
            "average_rating": 4.6,
            "rating_count": 1523,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "Transparent Labs Creatine HMB",
            "description": "Pure creatine monohydrate with HMB and Vitamin D3 for enhanced strength, power, and muscle recovery.",
            "short_description": "Creatine + HMB for strength gains",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "Transparent Labs",
            "price": 39.99,
            "sku": "TL-CREATINE-HMB",
            "stock_quantity": 200,
            "weight_kg": 0.45,
            "images": ["https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
            "features": ["5g Creatine", "1.5g HMB", "No Fillers", "Third-Party Tested"],
            "average_rating": 4.9,
            "rating_count": 892,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Legion Pulse Pre-Workout",
            "description": "Natural pre-workout supplement with clinically effective doses of caffeine, citrulline, and beta-alanine.",
            "short_description": "Natural pre-workout for energy & focus",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "Legion",
            "price": 44.99,
            "sku": "LEG-PULSE-PRE",
            "stock_quantity": 75,
            "weight_kg": 0.5,
            "images": ["https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=400",
            "features": ["350mg Caffeine", "8g Citrulline", "3.6g Beta-Alanine", "Natural Flavors"],
            "average_rating": 4.7,
            "rating_count": 1205,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "NOW Foods Omega-3 Fish Oil",
            "description": "Molecularly distilled fish oil providing essential EPA and DHA omega-3 fatty acids for heart and brain health.",
            "short_description": "Essential omega-3 fatty acids",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "NOW Foods",
            "price": 24.99,
            "sku": "NOW-OMEGA3-200",
            "stock_quantity": 300,
            "weight_kg": 0.35,
            "images": ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
            "features": ["1000mg Fish Oil", "180mg EPA", "120mg DHA", "200 Softgels"],
            "average_rating": 4.5,
            "rating_count": 3421,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Garden of Life Vitamin D3",
            "description": "Whole food vitamin D3 supplement from organic mushrooms. Supports immune system and bone health.",
            "short_description": "Organic vitamin D3 - 2000 IU",
            "category": ProductCategory.SUPPLEMENTS,
            "brand": "Garden of Life",
            "price": 19.99,
            "sku": "GOL-VITD3-120",
            "stock_quantity": 180,
            "weight_kg": 0.15,
            "images": ["https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400",
            "features": ["2000 IU D3", "Organic", "Vegan", "120 Tablets"],
            "average_rating": 4.6,
            "rating_count": 1876,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== EQUIPMENT ==========
        {
            "name": "Bowflex SelectTech 552 Dumbbells",
            "description": "Adjustable dumbbells that replace 15 sets of weights. Adjust from 5 to 52.5 lbs in 2.5 lb increments.",
            "short_description": "Adjustable dumbbells 5-52.5 lbs",
            "category": ProductCategory.EQUIPMENT,
            "brand": "Bowflex",
            "price": 429.00,
            "compare_at_price": 549.00,
            "sku": "BF-SELECT-552",
            "stock_quantity": 25,
            "weight_kg": 23.8,
            "dimensions": {"length": 43, "width": 23, "height": 23},
            "images": ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
            "features": ["5-52.5 lbs Range", "15 Sets in One", "Space Saving", "2 Year Warranty"],
            "average_rating": 4.7,
            "rating_count": 4521,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Rogue Fitness Ohio Bar",
            "description": "20kg men's Olympic barbell made in the USA. 190,000 PSI tensile strength steel with bronze bushings.",
            "short_description": "Premium Olympic barbell - 20kg",
            "category": ProductCategory.EQUIPMENT,
            "brand": "Rogue Fitness",
            "price": 295.00,
            "sku": "RF-OHIO-BAR",
            "stock_quantity": 40,
            "weight_kg": 20,
            "dimensions": {"length": 220, "width": 3, "height": 3},
            "images": ["https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400",
            "features": ["190K PSI Steel", "Bronze Bushings", "Made in USA", "Lifetime Warranty"],
            "average_rating": 4.9,
            "rating_count": 2156,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "TRX Pro4 Suspension Trainer",
            "description": "Professional-grade suspension training system used by elite athletes and trainers worldwide.",
            "short_description": "Pro suspension training system",
            "category": ProductCategory.EQUIPMENT,
            "brand": "TRX",
            "price": 249.95,
            "sku": "TRX-PRO4",
            "stock_quantity": 60,
            "weight_kg": 1.5,
            "images": ["https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
            "features": ["Steel Buckles", "Rubber Handles", "Door Anchor", "Carry Bag"],
            "average_rating": 4.8,
            "rating_count": 1832,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Concept2 Model D Rower",
            "description": "The gold standard indoor rowing machine. PM5 monitor with Bluetooth connectivity.",
            "short_description": "Indoor rowing machine with PM5",
            "category": ProductCategory.EQUIPMENT,
            "brand": "Concept2",
            "price": 990.00,
            "sku": "C2-MODEL-D",
            "stock_quantity": 15,
            "weight_kg": 26,
            "dimensions": {"length": 244, "width": 61, "height": 114},
            "images": ["https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400",
            "features": ["PM5 Monitor", "Bluetooth", "Ergonomic Handle", "5 Year Warranty"],
            "average_rating": 4.9,
            "rating_count": 5672,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "FITINDEX Resistance Bands Set",
            "description": "Complete set of 5 resistance bands with handles, door anchor, and ankle straps for home workouts.",
            "short_description": "5-band resistance set with accessories",
            "category": ProductCategory.EQUIPMENT,
            "brand": "FITINDEX",
            "price": 34.99,
            "compare_at_price": 49.99,
            "sku": "FI-BANDS-5SET",
            "stock_quantity": 500,
            "weight_kg": 1.2,
            "images": ["https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400",
            "features": ["5 Resistance Levels", "Foam Handles", "Door Anchor", "Carry Bag"],
            "average_rating": 4.4,
            "rating_count": 8923,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "CAP Barbell Olympic Weight Plates",
            "description": "Cast iron Olympic weight plates with machined holes. Sold in pairs. Classic black finish.",
            "short_description": "Olympic weight plates - 45lb pair",
            "category": ProductCategory.EQUIPMENT,
            "brand": "CAP Barbell",
            "price": 149.99,
            "sku": "CAP-PLATES-45",
            "stock_quantity": 80,
            "weight_kg": 40.8,
            "images": ["https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=400",
            "features": ["Cast Iron", "Olympic 2\" Holes", "Pair of 45lb", "Classic Finish"],
            "average_rating": 4.6,
            "rating_count": 2341,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== APPAREL ==========
        {
            "name": "Nike Dri-FIT Training T-Shirt",
            "description": "Lightweight training tee with Dri-FIT technology to keep you dry and comfortable during intense workouts.",
            "short_description": "Moisture-wicking training tee",
            "category": ProductCategory.APPAREL,
            "brand": "Nike",
            "price": 35.00,
            "sku": "NK-DRIFIT-TEE",
            "stock_quantity": 200,
            "weight_kg": 0.2,
            "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
            "features": ["Dri-FIT Technology", "Lightweight", "Breathable", "Standard Fit"],
            "specifications": {"material": "100% Polyester", "sizes": ["S", "M", "L", "XL", "XXL"]},
            "average_rating": 4.5,
            "rating_count": 3267,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Gymshark Vital Seamless Leggings",
            "description": "Seamless construction for a second-skin feel. High-waisted design with squat-proof fabric.",
            "short_description": "Seamless high-waist leggings",
            "category": ProductCategory.APPAREL,
            "brand": "Gymshark",
            "price": 54.00,
            "sku": "GS-VITAL-LEG",
            "stock_quantity": 150,
            "weight_kg": 0.25,
            "images": ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400",
            "features": ["Seamless", "High Waist", "Squat Proof", "Moisture Wicking"],
            "specifications": {"material": "Nylon/Elastane", "sizes": ["XS", "S", "M", "L", "XL"]},
            "average_rating": 4.7,
            "rating_count": 5421,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Under Armour Tech 2.0 Shorts",
            "description": "Ultra-soft, quick-drying fabric with 4-way stretch construction for total freedom of movement.",
            "short_description": "Quick-dry training shorts",
            "category": ProductCategory.APPAREL,
            "brand": "Under Armour",
            "price": 25.00,
            "compare_at_price": 30.00,
            "sku": "UA-TECH-SHORT",
            "stock_quantity": 180,
            "weight_kg": 0.15,
            "images": ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400",
            "features": ["4-Way Stretch", "Quick Dry", "Anti-Odor", "Mesh Panels"],
            "specifications": {"material": "Polyester", "sizes": ["S", "M", "L", "XL", "XXL"]},
            "average_rating": 4.6,
            "rating_count": 4123,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "Lululemon Metal Vent Tech Polo",
            "description": "Anti-stink technology polo designed for training. Seamless construction minimizes chafing.",
            "short_description": "Anti-stink training polo",
            "category": ProductCategory.APPAREL,
            "brand": "Lululemon",
            "price": 88.00,
            "sku": "LL-VENT-POLO",
            "stock_quantity": 75,
            "weight_kg": 0.22,
            "images": ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400",
            "features": ["Anti-Stink", "Seamless", "Four-Way Stretch", "Sweat-Wicking"],
            "specifications": {"material": "Nylon/Elastane", "sizes": ["S", "M", "L", "XL"]},
            "average_rating": 4.8,
            "rating_count": 1876,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Adidas Ultraboost 22 Running Shoes",
            "description": "Responsive Boost midsole with Primeknit+ upper for incredible energy return and comfort.",
            "short_description": "Boost technology running shoes",
            "category": ProductCategory.APPAREL,
            "brand": "Adidas",
            "price": 190.00,
            "compare_at_price": 220.00,
            "sku": "AD-ULTRA-22",
            "stock_quantity": 100,
            "weight_kg": 0.68,
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            "features": ["Boost Midsole", "Primeknit+", "Continental Rubber", "Torsion System"],
            "specifications": {"sizes": ["7", "8", "9", "10", "11", "12", "13"]},
            "average_rating": 4.7,
            "rating_count": 6234,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Reebok Nano X2 Training Shoes",
            "description": "Versatile cross-training shoe with Floatride Energy Foam for comfort during any workout.",
            "short_description": "CrossFit training shoes",
            "category": ProductCategory.APPAREL,
            "brand": "Reebok",
            "price": 135.00,
            "sku": "RB-NANO-X2",
            "stock_quantity": 90,
            "weight_kg": 0.7,
            "images": ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
            "features": ["Floatride Foam", "Flexweave Knit", "Wide Toe Box", "Rope Grip"],
            "specifications": {"sizes": ["7", "8", "9", "10", "11", "12", "13"]},
            "average_rating": 4.6,
            "rating_count": 2567,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== ACCESSORIES ==========
        {
            "name": "Harbinger Pro Wrist Wraps",
            "description": "Professional-grade wrist wraps for heavy lifting. Thumb loop design for secure fit.",
            "short_description": "Heavy-duty wrist support wraps",
            "category": ProductCategory.ACCESSORIES,
            "brand": "Harbinger",
            "price": 19.99,
            "sku": "HB-WRIST-PRO",
            "stock_quantity": 250,
            "weight_kg": 0.12,
            "images": ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
            "features": ["20\" Length", "Thumb Loop", "Velcro Closure", "Heavy Duty"],
            "average_rating": 4.5,
            "rating_count": 3421,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Gymreapers Lifting Belt",
            "description": "4-inch genuine leather powerlifting belt. Single prong buckle with 10mm thickness.",
            "short_description": "Leather powerlifting belt",
            "category": ProductCategory.ACCESSORIES,
            "brand": "Gymreapers",
            "price": 69.99,
            "compare_at_price": 89.99,
            "sku": "GR-BELT-4IN",
            "stock_quantity": 120,
            "weight_kg": 0.8,
            "images": ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
            "features": ["Genuine Leather", "10mm Thick", "Single Prong", "4\" Width"],
            "specifications": {"sizes": ["S", "M", "L", "XL", "XXL"]},
            "average_rating": 4.7,
            "rating_count": 2156,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Liquid Chalk - 250ml",
            "description": "Premium liquid chalk for improved grip without the mess. Quick-drying, long-lasting formula.",
            "short_description": "Quick-dry liquid chalk for grip",
            "category": ProductCategory.ACCESSORIES,
            "brand": "FrictionLabs",
            "price": 18.99,
            "sku": "FL-CHALK-250",
            "stock_quantity": 300,
            "weight_kg": 0.28,
            "images": ["https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400",
            "features": ["Quick Drying", "No Mess", "Long Lasting", "250ml Bottle"],
            "average_rating": 4.6,
            "rating_count": 1432,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Hydro Flask 32oz Sport Bottle",
            "description": "Double-wall vacuum insulation keeps drinks cold for 24 hours. BPA-free and dishwasher safe.",
            "short_description": "Insulated 32oz water bottle",
            "category": ProductCategory.ACCESSORIES,
            "brand": "Hydro Flask",
            "price": 44.95,
            "sku": "HF-SPORT-32",
            "stock_quantity": 200,
            "weight_kg": 0.45,
            "images": ["https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
            "features": ["24hr Cold", "Vacuum Insulated", "BPA Free", "Dishwasher Safe"],
            "average_rating": 4.8,
            "rating_count": 7823,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "GASP Gym Bag - 60L",
            "description": "Large capacity gym bag with shoe compartment, wet pocket, and multiple organizer pockets.",
            "short_description": "60L gym duffel bag",
            "category": ProductCategory.ACCESSORIES,
            "brand": "GASP",
            "price": 79.99,
            "sku": "GASP-BAG-60L",
            "stock_quantity": 85,
            "weight_kg": 1.2,
            "dimensions": {"length": 60, "width": 30, "height": 30},
            "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
            "features": ["60L Capacity", "Shoe Compartment", "Wet Pocket", "Padded Straps"],
            "average_rating": 4.5,
            "rating_count": 1234,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== NUTRITION ==========
        {
            "name": "Quest Protein Bars - Variety Pack",
            "description": "20g protein, 1g sugar per bar. 12 bar variety pack with best-selling flavors.",
            "short_description": "High protein bars - 12 pack",
            "category": ProductCategory.NUTRITION,
            "brand": "Quest",
            "price": 29.99,
            "compare_at_price": 35.99,
            "sku": "QST-BARS-12",
            "stock_quantity": 350,
            "weight_kg": 0.72,
            "images": ["https://images.unsplash.com/photo-1622484211148-c9b484099d0c?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1622484211148-c9b484099d0c?w=400",
            "features": ["20g Protein", "1g Sugar", "12 Bars", "Variety Pack"],
            "specifications": {"flavors": ["Chocolate Chip Cookie Dough", "Cookies & Cream", "Birthday Cake", "Blueberry Muffin"]},
            "average_rating": 4.5,
            "rating_count": 12456,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "RXBAR Protein Bars - 12 Pack",
            "description": "Made from real ingredients: egg whites, dates, and nuts. No B.S. 12g protein per bar.",
            "short_description": "Whole food protein bars",
            "category": ProductCategory.NUTRITION,
            "brand": "RXBAR",
            "price": 27.99,
            "sku": "RX-BARS-12",
            "stock_quantity": 280,
            "weight_kg": 0.62,
            "images": ["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400",
            "features": ["12g Protein", "Whole Foods", "No Added Sugar", "Gluten Free"],
            "average_rating": 4.4,
            "rating_count": 8932,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Orgain Organic Protein Shake",
            "description": "Plant-based protein shake with 21g protein. Ready to drink, no blending required.",
            "short_description": "Organic plant protein shake",
            "category": ProductCategory.NUTRITION,
            "brand": "Orgain",
            "price": 32.99,
            "sku": "ORG-SHAKE-12",
            "stock_quantity": 200,
            "weight_kg": 3.9,
            "images": ["https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400",
            "features": ["21g Protein", "Plant Based", "Ready to Drink", "12 Pack"],
            "average_rating": 4.3,
            "rating_count": 5621,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Bare Performance Nutrition Flight Pre",
            "description": "High-stimulant pre-workout with focus and energy blend. 30 servings per container.",
            "short_description": "High-stim pre-workout - 30 servings",
            "category": ProductCategory.NUTRITION,
            "brand": "BPN",
            "price": 44.99,
            "sku": "BPN-FLIGHT-30",
            "stock_quantity": 150,
            "weight_kg": 0.4,
            "images": ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
            "features": ["350mg Caffeine", "Focus Blend", "30 Servings", "Zero Sugar"],
            "average_rating": 4.7,
            "rating_count": 2345,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== RECOVERY ==========
        {
            "name": "Theragun Prime Massage Gun",
            "description": "Powerful percussive therapy device with 5 speeds and 4 attachments for muscle recovery.",
            "short_description": "Percussive massage device",
            "category": ProductCategory.RECOVERY,
            "brand": "Therabody",
            "price": 299.00,
            "sku": "TG-PRIME",
            "stock_quantity": 45,
            "weight_kg": 1.0,
            "images": ["https://images.unsplash.com/photo-1617952739858-28043cfdae19?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1617952739858-28043cfdae19?w=400",
            "features": ["5 Speeds", "4 Attachments", "2hr Battery", "Bluetooth App"],
            "average_rating": 4.7,
            "rating_count": 4532,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "HYPERICE Hypervolt 2",
            "description": "Quiet glide technology with 3 speeds for post-workout recovery. Up to 3 hours of battery.",
            "short_description": "Quiet massage gun",
            "category": ProductCategory.RECOVERY,
            "brand": "HYPERICE",
            "price": 229.00,
            "compare_at_price": 299.00,
            "sku": "HI-VOLT2",
            "stock_quantity": 55,
            "weight_kg": 0.82,
            "images": ["https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400",
            "features": ["Quiet Glide", "3 Speeds", "5 Heads", "3hr Battery"],
            "average_rating": 4.6,
            "rating_count": 3421,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "TriggerPoint GRID Foam Roller",
            "description": "Multi-density foam roller with GRID pattern for targeted muscle relief and recovery.",
            "short_description": "Multi-density foam roller",
            "category": ProductCategory.RECOVERY,
            "brand": "TriggerPoint",
            "price": 39.99,
            "sku": "TP-GRID-13",
            "stock_quantity": 200,
            "weight_kg": 0.6,
            "dimensions": {"length": 33, "width": 14, "height": 14},
            "images": ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
            "features": ["GRID Pattern", "Multi-Density", "13\" Length", "500lb Rating"],
            "average_rating": 4.6,
            "rating_count": 6234,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Compex Sport Elite 3.0 TENS/EMS",
            "description": "Professional-grade muscle stimulator with 9 programs for recovery, strength, and pain relief.",
            "short_description": "Electric muscle stimulator",
            "category": ProductCategory.RECOVERY,
            "brand": "Compex",
            "price": 449.99,
            "sku": "CX-ELITE-3",
            "stock_quantity": 25,
            "weight_kg": 0.4,
            "images": ["https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400",
            "features": ["9 Programs", "4 Channels", "MI Technology", "Rechargeable"],
            "average_rating": 4.5,
            "rating_count": 876,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Epsom Salt - 5lb Bag",
            "description": "Pure magnesium sulfate for muscle recovery baths. Pharmaceutical grade, unscented.",
            "short_description": "Magnesium bath salts - 5lb",
            "category": ProductCategory.RECOVERY,
            "brand": "Epsoak",
            "price": 14.99,
            "sku": "EP-SALT-5LB",
            "stock_quantity": 400,
            "weight_kg": 2.27,
            "images": ["https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400",
            "features": ["Pure Magnesium", "USP Grade", "Unscented", "5lb Bag"],
            "average_rating": 4.7,
            "rating_count": 9876,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },

        # ========== TECH ==========
        {
            "name": "Whoop 4.0 Fitness Tracker",
            "description": "24/7 health monitoring with HRV, sleep, and strain tracking. No screen, just data-driven insights.",
            "short_description": "Advanced fitness & sleep tracker",
            "category": ProductCategory.TECH,
            "brand": "WHOOP",
            "price": 239.00,
            "sku": "WP-4-0",
            "stock_quantity": 60,
            "weight_kg": 0.03,
            "images": ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400",
            "features": ["HRV Tracking", "Sleep Analysis", "Strain Coach", "5 Day Battery"],
            "average_rating": 4.4,
            "rating_count": 3245,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Garmin Forerunner 265",
            "description": "GPS running smartwatch with AMOLED display, training readiness, and race predictor features.",
            "short_description": "GPS running smartwatch",
            "category": ProductCategory.TECH,
            "brand": "Garmin",
            "price": 449.99,
            "sku": "GM-FR265",
            "stock_quantity": 40,
            "weight_kg": 0.047,
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            "features": ["AMOLED Display", "Training Readiness", "Race Predictor", "13 Day Battery"],
            "average_rating": 4.8,
            "rating_count": 2156,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Apple Watch Series 9",
            "description": "Advanced health features including blood oxygen, ECG, and crash detection. Swimproof design.",
            "short_description": "Apple smartwatch with health features",
            "category": ProductCategory.TECH,
            "brand": "Apple",
            "price": 399.00,
            "sku": "AW-S9-45",
            "stock_quantity": 75,
            "weight_kg": 0.039,
            "images": ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400",
            "features": ["Blood Oxygen", "ECG App", "Crash Detection", "Swimproof"],
            "average_rating": 4.7,
            "rating_count": 15432,
            "is_active": True,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Fitbit Charge 6",
            "description": "Fitness tracker with built-in GPS, heart rate zones, and 7-day battery life.",
            "short_description": "Fitness tracker with GPS",
            "category": ProductCategory.TECH,
            "brand": "Fitbit",
            "price": 159.95,
            "compare_at_price": 179.95,
            "sku": "FB-CHARGE6",
            "stock_quantity": 120,
            "weight_kg": 0.03,
            "images": ["https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=400",
            "features": ["Built-in GPS", "Heart Rate Zones", "7 Day Battery", "Sleep Tracking"],
            "average_rating": 4.4,
            "rating_count": 8765,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "RENPHO Smart Body Scale",
            "description": "Bluetooth body composition scale measuring 13 metrics including body fat, muscle mass, and BMI.",
            "short_description": "Smart body composition scale",
            "category": ProductCategory.TECH,
            "brand": "RENPHO",
            "price": 29.99,
            "sku": "RP-SCALE-BT",
            "stock_quantity": 350,
            "weight_kg": 1.5,
            "images": ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
            "features": ["13 Metrics", "Bluetooth Sync", "Unlimited Users", "App Included"],
            "average_rating": 4.5,
            "rating_count": 23456,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        },
        {
            "name": "Jabra Elite 8 Active Earbuds",
            "description": "Military-grade durability earbuds with ANC and 32-hour battery. Perfect for intense workouts.",
            "short_description": "Rugged wireless earbuds",
            "category": ProductCategory.TECH,
            "brand": "Jabra",
            "price": 199.99,
            "sku": "JB-E8-ACT",
            "stock_quantity": 80,
            "weight_kg": 0.05,
            "images": ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
            "thumbnail_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
            "features": ["Military Grade", "ANC", "32hr Battery", "IP68 Rating"],
            "average_rating": 4.6,
            "rating_count": 3421,
            "is_active": True,
            "is_featured": False,
            "is_on_sale": False
        }
    ]

    print(f"\nCreating {len(products_data)} products...\n")

    for product_data in products_data:
        create_product(db, **product_data)

    db.commit()

    print("\n" + "=" * 60)
    print(f"Successfully seeded {len(products_data)} products!")
    print("=" * 60 + "\n")


def main():
    """Main function to run the seed script."""
    print("\n" + "=" * 60)
    print("HyperFit Shop Database Seeder")
    print("=" * 60)

    # Create all tables
    print("\nCreating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

    # Create database session
    db = SessionLocal()

    try:
        # Seed products
        seed_products(db)

        # Print summary
        total_products = db.query(Product).count()
        print(f"\nDatabase Summary:")
        print(f"   Total products: {total_products}")
        print(f"   Featured products: {db.query(Product).filter(Product.is_featured == True).count()}")
        print(f"   On sale: {db.query(Product).filter(Product.is_on_sale == True).count()}")

        for category in ProductCategory:
            count = db.query(Product).filter(Product.category == category).count()
            if count > 0:
                print(f"   {category.value.capitalize()}: {count}")

        print("\nSeeding complete! Your shop is ready.\n")

    except Exception as e:
        print(f"\nError during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
