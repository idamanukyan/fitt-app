"""
Shop Schemas - Request/Response models for shop system
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from app.models.shop import ProductCategory, OrderStatus


# ===== PRODUCT SCHEMAS =====

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category: ProductCategory
    brand: Optional[str] = Field(None, max_length=100)
    price: float = Field(..., gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    sku: Optional[str] = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0)
    weight_kg: Optional[float] = Field(None, gt=0)
    features: Optional[List[str]] = None
    specifications: Optional[dict] = None
    is_featured: bool = False
    is_on_sale: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category: Optional[ProductCategory] = None
    brand: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    compare_at_price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_on_sale: Optional[bool] = None


class Product(ProductBase):
    id: int
    slug: str
    thumbnail_url: Optional[str] = None
    images: Optional[List[str]] = None
    average_rating: float
    rating_count: int
    is_active: bool
    discount_percentage: int
    is_in_stock: bool
    is_low_stock: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    products: List[Product]
    total: int
    page: int
    page_size: int
    total_pages: int


# ===== ORDER SCHEMAS =====

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float
    created_at: datetime

    class Config:
        from_attributes = True


class ShippingAddress(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zip: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_items=1)
    shipping_address: ShippingAddress
    billing_address: Optional[ShippingAddress] = None
    customer_notes: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    internal_notes: Optional[str] = None


class Order(BaseModel):
    id: int
    order_number: str
    user_id: int
    status: OrderStatus
    subtotal: float
    tax: float
    shipping_cost: float
    discount: float
    total: float
    shipping_name: str
    shipping_email: str
    shipping_phone: Optional[str] = None
    shipping_address_line1: str
    shipping_address_line2: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    customer_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    items: List[OrderItem] = []

    class Config:
        from_attributes = True


class OrderList(BaseModel):
    orders: List[Order]
    total: int
    page: int
    page_size: int


# ===== CART SCHEMAS =====

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Product
    subtotal: float
    created_at: datetime

    class Config:
        from_attributes = True


class Cart(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse] = []
    total_items: int
    subtotal: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== REVIEW SCHEMAS =====

class ProductReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None


class ProductReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None


class ProductReview(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductReviewList(BaseModel):
    reviews: List[ProductReview]
    total: int
    average_rating: float


# ===== AI RECOMMENDATION SCHEMAS =====

class RecommendationRequest(BaseModel):
    """Request for AI-powered product recommendations"""
    user_context: Optional[dict] = None  # User's workout history, goals, etc.
    category: Optional[ProductCategory] = None
    limit: int = Field(default=10, ge=1, le=50)


class RecommendedProduct(BaseModel):
    """Product with AI recommendation score and reasoning"""
    product: Product
    confidence_score: float = Field(..., ge=0, le=1)
    recommendation_reason: str
    brand_match: bool = False  # True if from preferred brands (Nike, Adidas, etc.)
    personalization_factors: List[str] = []  # Why this product was recommended


class RecommendationResponse(BaseModel):
    """Response with AI-recommended products"""
    recommendations: List[RecommendedProduct]
    total: int
    algorithm: str = "collaborative_filtering"  # or "content_based", "hybrid"
    personalized: bool = True
