/**
 * Supplement Service - API calls for supplement management
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const API_BASE_URL = 'http://localhost:8000/api/v6';

// Helper to get auth token
const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('access_token');
};

// Helper to create authenticated headers
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

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
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/supplements/library`, {
      headers,
      params,
    });
    return response.data;
  },

  /**
   * Get supplement by ID
   */
  getSupplement: async (supplementId: number): Promise<Supplement> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/supplements/library/${supplementId}`,
      { headers }
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
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/supplements/my-supplements`, {
      headers,
      params: { is_active: isActive },
    });
    return response.data.supplements;
  },

  /**
   * Get user supplement by ID
   */
  getMySupplement: async (userSupplementId: number): Promise<UserSupplement> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/supplements/my-supplements/${userSupplementId}`,
      { headers }
    );
    return response.data;
  },

  /**
   * Add supplement to user's schedule
   */
  addSupplement: async (
    data: CreateUserSupplementRequest
  ): Promise<UserSupplement> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/supplements/my-supplements`,
      data,
      { headers }
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
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${API_BASE_URL}/supplements/my-supplements/${userSupplementId}`,
      data,
      { headers }
    );
    return response.data;
  },

  /**
   * Remove supplement from schedule
   */
  removeSupplement: async (userSupplementId: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await axios.delete(
      `${API_BASE_URL}/supplements/my-supplements/${userSupplementId}`,
      { headers }
    );
  },

  /**
   * Get today's supplement schedule
   */
  getTodaysSupplements: async (): Promise<TodaysSupplementsResponse> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/supplements/today`, {
      headers,
    });
    return response.data;
  },

  /**
   * Get low stock supplements
   */
  getLowStockSupplements: async (threshold?: number): Promise<UserSupplement[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/supplements/low-stock`, {
      headers,
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
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/supplements/intake`,
      data,
      { headers }
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
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/supplements/intake/history`,
      { headers, params }
    );
    return response.data;
  },

  /**
   * Get compliance statistics
   */
  getStats: async (days?: number): Promise<SupplementStatsResponse> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/supplements/stats`, {
      headers,
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
