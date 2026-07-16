"""
Shop Schemas - Request/Response models for shop system
"""
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.shop import OrderStatus, ProductCategory

# ===== PRODUCT SCHEMAS =====

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    category: ProductCategory
    brand: str | None = Field(None, max_length=100)
    price: float = Field(..., gt=0)
    compare_at_price: float | None = Field(None, gt=0)
    sku: str | None = Field(None, max_length=100)
    stock_quantity: int = Field(default=0, ge=0)
    weight_kg: float | None = Field(None, gt=0)
    features: list[str] | None = None
    specifications: dict | None = None
    is_featured: bool = False
    is_on_sale: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    short_description: str | None = Field(None, max_length=500)
    category: ProductCategory | None = None
    brand: str | None = Field(None, max_length=100)
    price: float | None = Field(None, gt=0)
    compare_at_price: float | None = Field(None, gt=0)
    stock_quantity: int | None = Field(None, ge=0)
    is_active: bool | None = None
    is_featured: bool | None = None
    is_on_sale: bool | None = None


class Product(ProductBase):
    id: int
    slug: str
    thumbnail_url: str | None = None
    images: list[str] | None = None
    average_rating: float
    rating_count: int
    is_active: bool
    discount_percentage: int
    is_in_stock: bool
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    products: list[Product]
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
    product_sku: str | None = None
    quantity: int
    unit_price: float
    subtotal: float
    created_at: datetime

    class Config:
        from_attributes = True


class ShippingAddress(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: str | None = Field(None, max_length=50)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zip: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_items=1)
    shipping_address: ShippingAddress
    billing_address: ShippingAddress | None = None
    customer_notes: str | None = None


class OrderUpdate(BaseModel):
    status: OrderStatus | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    internal_notes: str | None = None


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
    shipping_phone: str | None = None
    shipping_address_line1: str
    shipping_address_line2: str | None = None
    shipping_city: str
    shipping_state: str
    shipping_zip: str
    shipping_country: str
    payment_method: str | None = None
    payment_status: str | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    customer_notes: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    items: list[OrderItem] = []

    class Config:
        from_attributes = True


class OrderList(BaseModel):
    orders: list[Order]
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
    items: list[CartItemResponse] = []
    total_items: int
    subtotal: float
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


# ===== REVIEW SCHEMAS =====

class ProductReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    title: str | None = Field(None, max_length=255)
    comment: str | None = None


class ProductReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    title: str | None = Field(None, max_length=255)
    comment: str | None = None


class ProductReview(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: str | None = None
    comment: str | None = None
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ProductReviewList(BaseModel):
    reviews: list[ProductReview]
    total: int
    average_rating: float


# ===== AI RECOMMENDATION SCHEMAS =====

class RecommendationRequest(BaseModel):
    """Request for AI-powered product recommendations"""
    user_context: dict | None = None  # User's workout history, goals, etc.
    category: ProductCategory | None = None
    limit: int = Field(default=10, ge=1, le=50)


class RecommendedProduct(BaseModel):
    """Product with AI recommendation score and reasoning"""
    product: Product
    confidence_score: float = Field(..., ge=0, le=1)
    recommendation_reason: str
    brand_match: bool = False  # True if from preferred brands (Nike, Adidas, etc.)
    personalization_factors: list[str] = []  # Why this product was recommended


class RecommendationResponse(BaseModel):
    """Response with AI-recommended products"""
    recommendations: list[RecommendedProduct]
    total: int
    algorithm: str = "collaborative_filtering"  # or "content_based", "hybrid"
    personalized: bool = True
