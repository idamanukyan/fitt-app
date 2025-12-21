"""
Shop Routes - REST API endpoints for e-commerce with AI recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.auth_enhanced import get_current_user, require_role
from app.models.user import User
from app.models.shop import ProductCategory, OrderStatus
from app.schemas.shop_schemas import (
    Product, ProductCreate, ProductUpdate, ProductList,
    Order, OrderCreate, OrderUpdate, OrderList,
    Cart, CartItemAdd, CartItemUpdate,
    ProductReview, ProductReviewCreate, ProductReviewUpdate, ProductReviewList,
    RecommendationRequest, RecommendationResponse
)
from app.services.shop_service import (
    ProductService, AIRecommendationService,
    OrderService, CartService
)


router = APIRouter(prefix="/api/v6/shop", tags=["shop"])


# ===== PRODUCT ENDPOINTS =====

@router.get("/products", response_model=ProductList)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[ProductCategory] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_on_sale: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get products with filters and pagination

    - **category**: Filter by product category
    - **brand**: Filter by brand name (partial match)
    - **search**: Search in name, description, brand
    - **is_featured**: Show only featured products
    - **is_on_sale**: Show only products on sale
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **in_stock_only**: Show only in-stock products (default: true)
    """
    skip = (page - 1) * page_size

    products, total = ProductService.get_products(
        db=db,
        skip=skip,
        limit=page_size,
        category=category,
        brand=brand,
        search=search,
        is_featured=is_featured,
        is_on_sale=is_on_sale,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only
    )

    total_pages = (total + page_size - 1) // page_size

    return ProductList(
        products=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/products/{product_id}", response_model=Product)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get product by ID"""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.get("/products/slug/{slug}", response_model=Product)
async def get_product_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get product by slug"""
    product = ProductService.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Create a new product (Admin only)"""
    try:
        product = ProductService.create_product(db, product_data)
        return product
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update a product (Admin only)"""
    product = ProductService.update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete a product (Admin only) - Soft delete"""
    success = ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


# ===== AI RECOMMENDATIONS ENDPOINT =====

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered product recommendations

    Uses hybrid recommendation algorithm that considers:
    - Premium brands (Nike, Adidas, Under Armour, Gymshark, etc.)
    - User's purchase history and preferred brands
    - Product ratings and reviews
    - Category preferences
    - Current sales and promotions
    - Premium member exclusives

    Returns products with confidence scores and personalized reasoning.
    """
    recommendations = AIRecommendationService.get_recommendations(
        db=db,
        user_id=current_user.id,
        request=request
    )
    return recommendations


# ===== SHOPPING CART ENDPOINTS =====

@router.get("/cart", response_model=Cart)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's shopping cart"""
    cart = CartService.get_or_create_cart(db, current_user.id)
    return cart


@router.post("/cart/items", response_model=Cart)
async def add_to_cart(
    item_data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    try:
        cart = CartService.add_item(db, current_user.id, item_data)
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/cart/items/{item_id}", response_model=Cart)
async def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update cart item quantity"""
    from app.models.shop import CartItem

    cart = CartService.get_or_create_cart(db, current_user.id)
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart)
    return cart


@router.delete("/cart/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    success = CartService.remove_item(db, current_user.id, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )


@router.delete("/cart", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from cart"""
    CartService.clear_cart(db, current_user.id)


# ===== ORDER ENDPOINTS =====

@router.post("/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order

    - Validates product availability and stock
    - Calculates tax and shipping
    - Updates product stock quantities
    - Generates unique order number
    """
    try:
        order = OrderService.create_order(db, current_user.id, order_data)

        # Clear cart after successful order
        CartService.clear_cart(db, current_user.id)

        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )


@router.get("/orders", response_model=OrderList)
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's orders"""
    skip = (page - 1) * page_size
    orders, total = OrderService.get_user_orders(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=page_size
    )

    return OrderList(
        orders=orders,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order details"""
    from app.models.shop import Order as OrderModel

    order = db.query(OrderModel).filter(
        OrderModel.id == order_id,
        OrderModel.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return order


@router.put("/orders/{order_id}", response_model=Order)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update order status (Admin only)"""
    from app.models.shop import Order as OrderModel
    from datetime import datetime

    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    update_data = order_data.dict(exclude_unset=True)

    # Update timestamps based on status
    if "status" in update_data:
        if update_data["status"] == OrderStatus.SHIPPED and not order.shipped_at:
            order.shipped_at = datetime.utcnow()
        elif update_data["status"] == OrderStatus.DELIVERED and not order.delivered_at:
            order.delivered_at = datetime.utcnow()

    for key, value in update_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)
    return order


# ===== PRODUCT REVIEW ENDPOINTS =====

@router.get("/products/{product_id}/reviews", response_model=ProductReviewList)
async def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get product reviews"""
    from app.models.shop import ProductReview as ReviewModel

    query = db.query(ReviewModel).filter(
        ReviewModel.product_id == product_id,
        ReviewModel.is_approved == True
    )

    total = query.count()
    reviews = query.order_by(ReviewModel.created_at.desc()).offset(skip).limit(limit).all()

    # Calculate average rating
    from sqlalchemy import func
    avg_rating = db.query(func.avg(ReviewModel.rating)).filter(
        ReviewModel.product_id == product_id,
        ReviewModel.is_approved == True
    ).scalar() or 0.0

    return ProductReviewList(
        reviews=reviews,
        total=total,
        average_rating=round(avg_rating, 2)
    )


@router.post("/reviews", response_model=ProductReview, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ProductReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a product review"""
    from app.models.shop import ProductReview as ReviewModel, Order as OrderModel, OrderItem

    # Check if user has purchased this product
    has_purchased = db.query(OrderItem).join(OrderModel).filter(
        OrderModel.user_id == current_user.id,
        OrderItem.product_id == review_data.product_id,
        OrderModel.status.in_([OrderStatus.DELIVERED, OrderStatus.SHIPPED])
    ).first() is not None

    # Check if user already reviewed this product
    existing_review = db.query(ReviewModel).filter(
        ReviewModel.user_id == current_user.id,
        ReviewModel.product_id == review_data.product_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )

    review = ReviewModel(
        **review_data.dict(),
        user_id=current_user.id,
        is_verified_purchase=has_purchased
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    # Update product rating
    _update_product_rating(db, review_data.product_id)

    return review


@router.put("/reviews/{review_id}", response_model=ProductReview)
async def update_review(
    review_id: int,
    review_data: ProductReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a product review"""
    from app.models.shop import ProductReview as ReviewModel

    review = db.query(ReviewModel).filter(
        ReviewModel.id == review_id,
        ReviewModel.user_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    update_data = review_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)

    # Update product rating
    _update_product_rating(db, review.product_id)

    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a product review"""
    from app.models.shop import ProductReview as ReviewModel

    review = db.query(ReviewModel).filter(
        ReviewModel.id == review_id,
        ReviewModel.user_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    product_id = review.product_id
    db.delete(review)
    db.commit()

    # Update product rating
    _update_product_rating(db, product_id)


# ===== HELPER FUNCTIONS =====

def _update_product_rating(db: Session, product_id: int):
    """Update product's average rating and count"""
    from app.models.shop import ProductReview as ReviewModel, Product as ProductModel
    from sqlalchemy import func

    stats = db.query(
        func.avg(ReviewModel.rating).label('avg_rating'),
        func.count(ReviewModel.id).label('count')
    ).filter(
        ReviewModel.product_id == product_id,
        ReviewModel.is_approved == True
    ).first()

    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if product:
        product.average_rating = round(stats.avg_rating or 0.0, 2)
        product.rating_count = stats.count or 0
        db.commit()
