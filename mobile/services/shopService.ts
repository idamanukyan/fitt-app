/**
 * Shop Service
 *
 * API service layer for e-commerce shop with AI recommendations
 */
import api from './api';
import {
  Product,
  ProductListResponse,
  ProductFilters,
  RecommendationRequest,
  RecommendationResponse,
  Cart,
  CartItemAdd,
  CartItemUpdate,
  Order,
  OrderCreate,
  OrderListResponse,
  ProductReview,
  ProductReviewCreate,
  ProductReviewUpdate,
  ProductReviewListResponse,
} from '../types/shop';

const SHOP_BASE_URL = '/api/v6/shop';

export const shopService = {
  // ===== PRODUCT ENDPOINTS =====

  products: {
    /**
     * Get products with filters and pagination
     */
    getProducts: async (
      page: number = 1,
      pageSize: number = 20,
      filters?: ProductFilters
    ): Promise<ProductListResponse> => {
      const params: any = {
        page,
        page_size: pageSize,
        ...filters,
      };

      const response = await api.get<ProductListResponse>(
        `${SHOP_BASE_URL}/products`,
        { params }
      );
      return response.data;
    },

    /**
     * Get product by ID
     */
    getProduct: async (productId: number): Promise<Product> => {
      const response = await api.get<Product>(
        `${SHOP_BASE_URL}/products/${productId}`
      );
      return response.data;
    },

    /**
     * Get product by slug
     */
    getProductBySlug: async (slug: string): Promise<Product> => {
      const response = await api.get<Product>(
        `${SHOP_BASE_URL}/products/slug/${slug}`
      );
      return response.data;
    },

    /**
     * Search products
     */
    searchProducts: async (query: string, page: number = 1): Promise<ProductListResponse> => {
      return shopService.products.getProducts(page, 20, { search: query });
    },

    /**
     * Get featured products
     */
    getFeaturedProducts: async (limit: number = 10): Promise<ProductListResponse> => {
      return shopService.products.getProducts(1, limit, { is_featured: true });
    },

    /**
     * Get products on sale
     */
    getSaleProducts: async (page: number = 1): Promise<ProductListResponse> => {
      return shopService.products.getProducts(page, 20, { is_on_sale: true });
    },

    /**
     * Get products by category
     */
    getProductsByCategory: async (
      category: string,
      page: number = 1
    ): Promise<ProductListResponse> => {
      return shopService.products.getProducts(page, 20, { category } as any);
    },

    /**
     * Get products by brand
     */
    getProductsByBrand: async (
      brand: string,
      page: number = 1
    ): Promise<ProductListResponse> => {
      return shopService.products.getProducts(page, 20, { brand });
    },
  },

  // ===== AI RECOMMENDATIONS =====

  recommendations: {
    /**
     * Get AI-powered product recommendations
     */
    getRecommendations: async (
      request?: RecommendationRequest
    ): Promise<RecommendationResponse> => {
      const response = await api.post<RecommendationResponse>(
        `${SHOP_BASE_URL}/recommendations`,
        request || {}
      );
      return response.data;
    },

    /**
     * Get recommendations for a specific category
     */
    getRecommendationsByCategory: async (
      category: string,
      limit: number = 10
    ): Promise<RecommendationResponse> => {
      return shopService.recommendations.getRecommendations({
        category: category as any,
        limit,
      });
    },
  },

  // ===== SHOPPING CART =====

  cart: {
    /**
     * Get user's shopping cart
     */
    getCart: async (): Promise<Cart> => {
      const response = await api.get<Cart>(`${SHOP_BASE_URL}/cart`);
      return response.data;
    },

    /**
     * Add item to cart
     */
    addItem: async (item: CartItemAdd): Promise<Cart> => {
      const response = await api.post<Cart>(
        `${SHOP_BASE_URL}/cart/items`,
        item
      );
      return response.data;
    },

    /**
     * Update cart item quantity
     */
    updateItem: async (itemId: number, update: CartItemUpdate): Promise<Cart> => {
      const response = await api.put<Cart>(
        `${SHOP_BASE_URL}/cart/items/${itemId}`,
        update
      );
      return response.data;
    },

    /**
     * Remove item from cart
     */
    removeItem: async (itemId: number): Promise<void> => {
      await api.delete(`${SHOP_BASE_URL}/cart/items/${itemId}`);
    },

    /**
     * Clear entire cart
     */
    clearCart: async (): Promise<void> => {
      await api.delete(`${SHOP_BASE_URL}/cart`);
    },
  },

  // ===== ORDERS =====

  orders: {
    /**
     * Create a new order
     */
    createOrder: async (orderData: OrderCreate): Promise<Order> => {
      const response = await api.post<Order>(
        `${SHOP_BASE_URL}/orders`,
        orderData
      );
      return response.data;
    },

    /**
     * Get user's orders
     */
    getOrders: async (page: number = 1, pageSize: number = 20): Promise<OrderListResponse> => {
      const response = await api.get<OrderListResponse>(
        `${SHOP_BASE_URL}/orders`,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      );
      return response.data;
    },

    /**
     * Get order by ID
     */
    getOrder: async (orderId: number): Promise<Order> => {
      const response = await api.get<Order>(`${SHOP_BASE_URL}/orders/${orderId}`);
      return response.data;
    },
  },

  // ===== PRODUCT REVIEWS =====

  reviews: {
    /**
     * Get product reviews
     */
    getProductReviews: async (
      productId: number,
      skip: number = 0,
      limit: number = 20
    ): Promise<ProductReviewListResponse> => {
      const response = await api.get<ProductReviewListResponse>(
        `${SHOP_BASE_URL}/products/${productId}/reviews`,
        {
          params: {
            skip,
            limit,
          },
        }
      );
      return response.data;
    },

    /**
     * Create a product review
     */
    createReview: async (review: ProductReviewCreate): Promise<ProductReview> => {
      const response = await api.post<ProductReview>(
        `${SHOP_BASE_URL}/reviews`,
        review
      );
      return response.data;
    },

    /**
     * Update a review
     */
    updateReview: async (
      reviewId: number,
      update: ProductReviewUpdate
    ): Promise<ProductReview> => {
      const response = await api.put<ProductReview>(
        `${SHOP_BASE_URL}/reviews/${reviewId}`,
        update
      );
      return response.data;
    },

    /**
     * Delete a review
     */
    deleteReview: async (reviewId: number): Promise<void> => {
      await api.delete(`${SHOP_BASE_URL}/reviews/${reviewId}`);
    },
  },
};

export default shopService;
