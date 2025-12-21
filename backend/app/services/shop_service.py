"""
Shop Service - Business logic for shop with AI recommendations
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional, Tuple
from datetime import datetime
import secrets
import string
from slugify import slugify

from app.models.shop import (
    Product, Order, OrderItem, OrderStatus,
    ShoppingCart, CartItem, ProductReview,
    ProductCategory
)
from app.models.user import User
from app.schemas.shop_schemas import (
    ProductCreate, ProductUpdate,
    OrderCreate, OrderUpdate,
    CartItemAdd, CartItemUpdate,
    ProductReviewCreate, ProductReviewUpdate,
    RecommendationRequest, RecommendedProduct,
    RecommendationResponse
)


# Premium brands for AI recommendations
PREMIUM_BRANDS = {
    "nike", "adidas", "under armour", "gymshark", 
    "lululemon", "reebok", "puma", "new balance",
    "asics", "mizuno", "brooks", "hoka", "on running"
}


class ProductService:
    """Service for product management"""
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """Create a new product"""
        slug = slugify(product_data.name)
        
        # Ensure unique slug
        counter = 1
        original_slug = slug
        while db.query(Product).filter(Product.slug == slug).first():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        product = Product(
            **product_data.dict(),
            slug=slug
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.id == product_id).first()
    
    @staticmethod
    def get_product_by_slug(db: Session, slug: str) -> Optional[Product]:
        """Get product by slug"""
        return db.query(Product).filter(Product.slug == slug).first()
    
    @staticmethod
    def get_products(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        category: Optional[ProductCategory] = None,
        brand: Optional[str] = None,
        search: Optional[str] = None,
        is_featured: Optional[bool] = None,
        is_on_sale: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock_only: bool = True
    ) -> Tuple[List[Product], int]:
        """Get products with filters"""
        query = db.query(Product).filter(Product.is_active == True)
        
        if in_stock_only:
            query = query.filter(Product.stock_quantity > 0)
        
        if category:
            query = query.filter(Product.category == category)
        
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand}%"))
        
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.brand.ilike(f"%{search}%")
                )
            )
        
        if is_featured is not None:
            query = query.filter(Product.is_featured == is_featured)
        
        if is_on_sale is not None:
            query = query.filter(Product.is_on_sale == is_on_sale)
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        total = query.count()
        products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
        
        return products, total
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Optional[Product]:
        """Update a product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return None
        
        update_data = product_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """Delete a product (soft delete)"""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return False
        
        product.is_active = False
        db.commit()
        return True


class AIRecommendationService:
    """Service for AI-powered product recommendations"""
    
    @staticmethod
    def get_recommendations(
        db: Session,
        user_id: int,
        request: RecommendationRequest
    ) -> RecommendationResponse:
        """Generate AI-powered product recommendations"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return RecommendationResponse(recommendations=[], total=0, personalized=False)
        
        # Get user context for personalization
        user_context = AIRecommendationService._build_user_context(db, user)
        
        # Get candidate products
        products, _ = ProductService.get_products(
            db,
            limit=100,
            category=request.category,
            in_stock_only=True
        )
        
        # Score and rank products
        recommendations = []
        for product in products:
            score_data = AIRecommendationService._calculate_recommendation_score(
                product, user_context
            )
            
            if score_data["score"] > 0.3:  # Minimum confidence threshold
                recommendations.append(
                    RecommendedProduct(
                        product=product,
                        confidence_score=score_data["score"],
                        recommendation_reason=score_data["reason"],
                        brand_match=score_data["brand_match"],
                        personalization_factors=score_data["factors"]
                    )
                )
        
        # Sort by confidence score
        recommendations.sort(key=lambda x: x.confidence_score, reverse=True)
        
        # Limit results
        recommendations = recommendations[:request.limit]
        
        return RecommendationResponse(
            recommendations=recommendations,
            total=len(recommendations),
            algorithm="hybrid",
            personalized=True
        )
    
    @staticmethod
    def _build_user_context(db: Session, user: User) -> dict:
        """Build user context for recommendations"""
        context = {
            "user_id": user.id,
            "premium_member": user.is_premium,
            "workout_history": [],
            "supplement_usage": [],
            "nutrition_preferences": [],
            "purchase_history": [],
            "preferred_brands": set()
        }
        
        # Add purchase history
        orders = db.query(Order).filter(
            Order.user_id == user.id,
            Order.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
        ).limit(10).all()
        
        for order in orders:
            for item in order.items:
                context["purchase_history"].append({
                    "product_id": item.product_id,
                    "category": item.product.category if item.product else None,
                    "brand": item.product.brand if item.product else None
                })
                
                if item.product and item.product.brand:
                    context["preferred_brands"].add(item.product.brand.lower())
        
        return context
    
    @staticmethod
    def _calculate_recommendation_score(product: Product, user_context: dict) -> dict:
        """Calculate recommendation score and reasoning"""
        score = 0.5  # Base score
        factors = []
        reason_parts = []
        brand_match = False
        
        # Premium brand boost
        if product.brand and product.brand.lower() in PREMIUM_BRANDS:
            score += 0.2
            factors.append("premium_brand")
            reason_parts.append(f"Premium {product.brand} brand")
            brand_match = True
        
        # User's preferred brand
        if product.brand and product.brand.lower() in user_context["preferred_brands"]:
            score += 0.15
            factors.append("preferred_brand")
            reason_parts.append(f"Your favorite brand: {product.brand}")
        
        # High rating boost
        if product.average_rating >= 4.5 and product.rating_count >= 10:
            score += 0.1
            factors.append("highly_rated")
            reason_parts.append(f"{product.average_rating}★ rating")
        
        # Featured products
        if product.is_featured:
            score += 0.05
            factors.append("featured")
        
        # On sale
        if product.is_on_sale and product.discount_percentage > 10:
            score += 0.1
            factors.append("on_sale")
            reason_parts.append(f"{product.discount_percentage}% off")
        
        # Category match based on purchase history
        purchased_categories = [p["category"] for p in user_context["purchase_history"]]
        if product.category in purchased_categories:
            score += 0.1
            factors.append("category_match")
            reason_parts.append("Matches your interests")
        
        # Premium member exclusive
        if user_context["premium_member"] and product.price > 100:
            score += 0.05
            factors.append("premium_product")
        
        # Limit score to 1.0
        score = min(score, 1.0)
        
        # Build reason
        if not reason_parts:
            reason = "Recommended for you"
        else:
            reason = " • ".join(reason_parts[:3])  # Top 3 reasons
        
        return {
            "score": round(score, 2),
            "reason": reason,
            "brand_match": brand_match,
            "factors": factors
        }


class OrderService:
    """Service for order management"""
    
    @staticmethod
    def generate_order_number() -> str:
        """Generate unique order number"""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"ORD-{timestamp}-{random_part}"
    
    @staticmethod
    def create_order(db: Session, user_id: int, order_data: OrderCreate) -> Order:
        """Create a new order"""
        # Calculate totals
        subtotal = 0
        order_items_data = []
        
        for item_data in order_data.items:
            product = db.query(Product).filter(Product.id == item_data.product_id).first()
            if not product:
                raise ValueError(f"Product {item_data.product_id} not found")
            
            if product.stock_quantity < item_data.quantity:
                raise ValueError(f"Insufficient stock for {product.name}")
            
            item_subtotal = product.price * item_data.quantity
            subtotal += item_subtotal
            
            order_items_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "product_sku": product.sku,
                "quantity": item_data.quantity,
                "unit_price": product.price,
                "subtotal": item_subtotal
            })
        
        # Calculate tax and shipping (simplified)
        tax = round(subtotal * 0.08, 2)  # 8% tax
        shipping_cost = 0.0 if subtotal > 50 else 5.99  # Free shipping over $50
        total = subtotal + tax + shipping_cost
        
        # Create order
        order = Order(
            order_number=OrderService.generate_order_number(),
            user_id=user_id,
            status=OrderStatus.PENDING,
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            discount=0.0,
            total=total,
            shipping_name=order_data.shipping_address.name,
            shipping_email=order_data.shipping_address.email,
            shipping_phone=order_data.shipping_address.phone,
            shipping_address_line1=order_data.shipping_address.address_line1,
            shipping_address_line2=order_data.shipping_address.address_line2,
            shipping_city=order_data.shipping_address.city,
            shipping_state=order_data.shipping_address.state,
            shipping_zip=order_data.shipping_address.zip,
            shipping_country=order_data.shipping_address.country,
            customer_notes=order_data.customer_notes
        )
        
        db.add(order)
        db.flush()
        
        # Create order items and update stock
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            db.add(order_item)
            
            # Update product stock
            product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
            product.stock_quantity -= item_data["quantity"]
        
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> Tuple[List[Order], int]:
        """Get user's orders"""
        query = db.query(Order).filter(Order.user_id == user_id)
        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        return orders, total


class CartService:
    """Service for shopping cart management"""
    
    @staticmethod
    def get_or_create_cart(db: Session, user_id: int) -> ShoppingCart:
        """Get or create user's shopping cart"""
        cart = db.query(ShoppingCart).filter(ShoppingCart.user_id == user_id).first()
        if not cart:
            cart = ShoppingCart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart
    
    @staticmethod
    def add_item(db: Session, user_id: int, item_data: CartItemAdd) -> ShoppingCart:
        """Add item to cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        
        # Check if item already exists
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_data.product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += item_data.quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity
            )
            db.add(cart_item)
        
        db.commit()
        db.refresh(cart)
        return cart
    
    @staticmethod
    def remove_item(db: Session, user_id: int, item_id: int) -> bool:
        """Remove item from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()
        
        if not item:
            return False
        
        db.delete(item)
        db.commit()
        return True
    
    @staticmethod
    def clear_cart(db: Session, user_id: int) -> bool:
        """Clear all items from cart"""
        cart = CartService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        return True
