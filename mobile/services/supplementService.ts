/**
 * Supplement Service - API calls for supplement management
 */
import apiClient from './api';
import {
  Supplement,
  UserSupplement,
  SupplementIntake,
  SupplementListResponse,
  UserSupplementListResponse,
  TodaysSupplementsResponse,
  SupplementStatsResponse,
  CreateUserSupplementRequest,
  UpdateUserSupplementRequest,
  LogIntakeRequest,
  SupplementCategory,
} from '../types/supplement';

const SUPPLEMENTS_BASE = '/api/v1/supplements';

/**
 * Supplement Library API
 */
export const supplementLibraryAPI = {
  /**
   * Get all supplements from the library
   */
  getSupplements: async (params?: {
    skip?: number;
    limit?: number;
    category?: SupplementCategory;
    search?: string;
    is_popular?: boolean;
  }): Promise<SupplementListResponse> => {
    const response = await apiClient.get(`${SUPPLEMENTS_BASE}/library`, {
      params,
    });
    return response.data;
  },

  /**
   * Get supplement by ID
   */
  getSupplement: async (supplementId: number): Promise<Supplement> => {
    const response = await apiClient.get(
      `${SUPPLEMENTS_BASE}/library/${supplementId}`
    );
    return response.data;
  },

  /**
   * Search supplements
   */
  searchSupplements: async (query: string): Promise<SupplementListResponse> => {
    return supplementLibraryAPI.getSupplements({ search: query, limit: 20 });
  },

  /**
   * Get supplements by category
   */
  getSupplementsByCategory: async (
    category: SupplementCategory
  ): Promise<SupplementListResponse> => {
    return supplementLibraryAPI.getSupplements({ category, limit: 100 });
  },

  /**
   * Get popular supplements
   */
  getPopularSupplements: async (): Promise<SupplementListResponse> => {
    return supplementLibraryAPI.getSupplements({ is_popular: true, limit: 20 });
  },
};

/**
 * User Supplements API
 */
export const userSupplementsAPI = {
  /**
   * Get user's supplements
   */
  getMySupplements: async (isActive?: boolean): Promise<UserSupplement[]> => {
    const response = await apiClient.get(`${SUPPLEMENTS_BASE}/my-supplements`, {
      params: { is_active: isActive },
    });
    return response.data.supplements;
  },

  /**
   * Get user supplement by ID
   */
  getMySupplement: async (userSupplementId: number): Promise<UserSupplement> => {
    const response = await apiClient.get(
      `${SUPPLEMENTS_BASE}/my-supplements/${userSupplementId}`
    );
    return response.data;
  },

  /**
   * Add supplement to user's schedule
   */
  addSupplement: async (
    data: CreateUserSupplementRequest
  ): Promise<UserSupplement> => {
    const response = await apiClient.post(
      `${SUPPLEMENTS_BASE}/my-supplements`,
      data
    );
    return response.data;
  },

  /**
   * Update user supplement
   */
  updateSupplement: async (
    userSupplementId: number,
    data: UpdateUserSupplementRequest
  ): Promise<UserSupplement> => {
    const response = await apiClient.patch(
      `${SUPPLEMENTS_BASE}/my-supplements/${userSupplementId}`,
      data
    );
    return response.data;
  },

  /**
   * Remove supplement from schedule
   */
  removeSupplement: async (userSupplementId: number): Promise<void> => {
    await apiClient.delete(
      `${SUPPLEMENTS_BASE}/my-supplements/${userSupplementId}`
    );
  },

  /**
   * Get today's supplement schedule
   */
  getTodaysSupplements: async (): Promise<TodaysSupplementsResponse> => {
    const response = await apiClient.get(`${SUPPLEMENTS_BASE}/today`);
    return response.data;
  },

  /**
   * Get low stock supplements
   */
  getLowStockSupplements: async (threshold?: number): Promise<UserSupplement[]> => {
    const response = await apiClient.get(`${SUPPLEMENTS_BASE}/low-stock`, {
      params: { threshold },
    });
    return response.data;
  },
};

/**
 * Supplement Intake API
 */
export const supplementIntakeAPI = {
  /**
   * Log supplement intake
   */
  logIntake: async (data: LogIntakeRequest): Promise<SupplementIntake> => {
    const response = await apiClient.post(
      `${SUPPLEMENTS_BASE}/intake`,
      data
    );
    return response.data;
  },

  /**
   * Mark supplement as taken
   */
  markAsTaken: async (
    userSupplementId: number,
    dosageTaken?: number,
    notes?: string
  ): Promise<SupplementIntake> => {
    return supplementIntakeAPI.logIntake({
      user_supplement_id: userSupplementId,
      dosage_taken: dosageTaken,
      was_scheduled: true,
      skipped: false,
      notes,
    });
  },

  /**
   * Mark supplement as skipped
   */
  markAsSkipped: async (
    userSupplementId: number,
    skipReason?: string
  ): Promise<SupplementIntake> => {
    return supplementIntakeAPI.logIntake({
      user_supplement_id: userSupplementId,
      was_scheduled: true,
      skipped: true,
      skip_reason: skipReason,
    });
  },

  /**
   * Get intake history
   */
  getIntakeHistory: async (params?: {
    user_supplement_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<SupplementIntake[]> => {
    const response = await apiClient.get(
      `${SUPPLEMENTS_BASE}/intake/history`,
      { params }
    );
    return response.data;
  },

  /**
   * Get compliance statistics
   */
  getStats: async (days?: number): Promise<SupplementStatsResponse> => {
    const response = await apiClient.get(`${SUPPLEMENTS_BASE}/stats`, {
      params: { days },
    });
    return response.data;
  },
};

/**
 * Combined supplement service (convenience exports)
 */
export const supplementService = {
  library: supplementLibraryAPI,
  user: userSupplementsAPI,
  intake: supplementIntakeAPI,
};

export default supplementService;
