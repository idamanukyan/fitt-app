/**
 * Shop Type Definitions
 *
 * TypeScript interfaces and enums for the e-commerce shop system
 * with AI-powered product recommendations.
 */

// ===== ENUMS =====

export enum ProductCategory {
  SUPPLEMENTS = 'supplements',
  EQUIPMENT = 'equipment',
  APPAREL = 'apparel',
  ACCESSORIES = 'accessories',
  NUTRITION = 'nutrition',
  RECOVERY = 'recovery',
  TECH = 'tech',
  OTHER = 'other',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// ===== PRODUCT INTERFACES =====

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  category: ProductCategory;
  brand?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  stock_quantity: number;
  weight_kg?: number;
  features?: string[];
  specifications?: Record<string, any>;
  thumbnail_url?: string;
  images?: string[];
  average_rating: number;
  rating_count: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  discount_percentage: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  search?: string;
  is_featured?: boolean;
  is_on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
}

// ===== AI RECOMMENDATION INTERFACES =====

export interface RecommendationRequest {
  user_context?: Record<string, any>;
  category?: ProductCategory;
  limit?: number;
}

export interface RecommendedProduct {
  product: Product;
  confidence_score: number;
  recommendation_reason: string;
  brand_match: boolean;
  personalization_factors: string[];
}

export interface RecommendationResponse {
  recommendations: RecommendedProduct[];
  total: number;
  algorithm: string;
  personalized: boolean;
}

// ===== CART INTERFACES =====

export interface CartItemAdd {
  product_id: number;
  quantity?: number;
}

export interface CartItemUpdate {
  quantity: number;
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
  subtotal: number;
  created_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItemResponse[];
  total_items: number;
  subtotal: number;
  created_at: string;
  updated_at?: string;
}

// ===== ORDER INTERFACES =====

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderCreate {
  items: OrderItemCreate[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  customer_notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  payment_method?: string;
  payment_status?: string;
  tracking_number?: string;
  tracking_url?: string;
  customer_notes?: string;
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[];
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

// ===== REVIEW INTERFACES =====

export interface ProductReviewCreate {
  product_id: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ProductReviewUpdate {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductReviewListResponse {
  reviews: ProductReview[];
  total: number;
  average_rating: number;
}

// ===== HELPER FUNCTIONS =====

export const getCategoryIcon = (category: ProductCategory): string => {
  const iconMap: Record<ProductCategory, string> = {
    [ProductCategory.SUPPLEMENTS]: 'fitness',
    [ProductCategory.EQUIPMENT]: 'barbell',
    [ProductCategory.APPAREL]: 'shirt',
    [ProductCategory.ACCESSORIES]: 'watch',
    [ProductCategory.NUTRITION]: 'restaurant',
    [ProductCategory.RECOVERY]: 'medical',
    [ProductCategory.TECH]: 'phone-portrait',
    [ProductCategory.OTHER]: 'cube',
  };
  return iconMap[category] || 'cube';
};

export const getCategoryLabel = (category: ProductCategory): string => {
  const labelMap: Record<ProductCategory, string> = {
    [ProductCategory.SUPPLEMENTS]: 'Supplements',
    [ProductCategory.EQUIPMENT]: 'Equipment',
    [ProductCategory.APPAREL]: 'Apparel',
    [ProductCategory.ACCESSORIES]: 'Accessories',
    [ProductCategory.NUTRITION]: 'Nutrition',
    [ProductCategory.RECOVERY]: 'Recovery',
    [ProductCategory.TECH]: 'Tech & Gadgets',
    [ProductCategory.OTHER]: 'Other',
  };
  return labelMap[category] || 'Unknown';
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colorMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '#F59E0B',
    [OrderStatus.PROCESSING]: '#3B82F6',
    [OrderStatus.SHIPPED]: '#8B5CF6',
    [OrderStatus.DELIVERED]: '#10B981',
    [OrderStatus.CANCELLED]: '#EF4444',
    [OrderStatus.REFUNDED]: '#6B7280',
  };
  return colorMap[status] || '#6B7280';
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labelMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.PROCESSING]: 'Processing',
    [OrderStatus.SHIPPED]: 'Shipped',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
    [OrderStatus.REFUNDED]: 'Refunded',
  };
  return labelMap[status] || 'Unknown';
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const calculateSavings = (price: number, comparePrice?: number): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return comparePrice - price;
};

export const getStarRating = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  const emptyStars = 5 - Math.ceil(rating);
  stars += '☆'.repeat(emptyStars);
  return stars;
};

export const isPremiumBrand = (brand?: string): boolean => {
  if (!brand) return false;
  const premiumBrands = [
    'nike',
    'adidas',
    'under armour',
    'gymshark',
    'lululemon',
    'reebok',
    'puma',
    'new balance',
    'asics',
    'mizuno',
    'brooks',
    'hoka',
    'on running',
  ];
  return premiumBrands.includes(brand.toLowerCase());
};
