/**
 * Admin Service for HyperFit
 *
 * Provides admin-only operations:
 * - User management (list, update role, activate/deactivate, delete)
 * - System statistics
 *
 * Note: These endpoints require ADMIN role
 */

import apiClient from './api';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'user' | 'coach' | 'admin';

export interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AdminUserDetail extends AdminUser {
  profile?: {
    date_of_birth?: string;
    gender?: string;
    height?: number;
    weight?: number;
    fitness_level?: string;
    goals?: string[];
  };
  stats?: {
    total_workouts: number;
    total_meals_logged: number;
    days_active: number;
  };
}

export interface AdminStats {
  total_users: number;
  users_by_role: {
    user: number;
    coach: number;
    admin: number;
  };
  active_users: number;
  inactive_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  is_active?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'email' | 'full_name' | 'last_login';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get list of all users with pagination and filters
 * Requires ADMIN role
 */
export const getUsers = async (params: UserListParams = {}): Promise<PaginatedUsers> => {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    limit: params.limit || 20,
  };

  if (params.role) queryParams.role = params.role;
  if (params.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params.search) queryParams.search = params.search;
  if (params.sort_by) queryParams.sort_by = params.sort_by;
  if (params.sort_order) queryParams.sort_order = params.sort_order;

  const response = await apiClient.get<PaginatedUsers>('/api/admin/users', { params: queryParams });
  return response.data;
};

/**
 * Get detailed user information by ID
 * Requires ADMIN role
 */
export const getUserById = async (userId: number): Promise<AdminUserDetail> => {
  const response = await apiClient.get<AdminUserDetail>(`/api/admin/users/${userId}`);
  return response.data;
};

/**
 * Update user's role
 * Requires ADMIN role
 */
export const updateUserRole = async (userId: number, role: UserRole): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Activate a user account
 * Requires ADMIN role
 */
export const activateUser = async (userId: number): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/activate`);
  return response.data;
};

/**
 * Deactivate a user account
 * Requires ADMIN role
 */
export const deactivateUser = async (userId: number): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/deactivate`);
  return response.data;
};

/**
 * Permanently delete a user
 * Requires ADMIN role
 * Warning: This is a destructive operation
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.delete(`/api/admin/users/${userId}`);
};

/**
 * Get system statistics
 * Requires ADMIN role
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/api/admin/stats');
  return response.data;
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Search users by email or name
 */
export const searchUsers = async (query: string, limit: number = 20): Promise<AdminUser[]> => {
  const result = await getUsers({ search: query, limit });
  return result.users;
};

/**
 * Get all coaches
 */
export const getCoaches = async (): Promise<AdminUser[]> => {
  const result = await getUsers({ role: 'coach', limit: 100 });
  return result.users;
};

/**
 * Get all admins
 */
export const getAdmins = async (): Promise<AdminUser[]> => {
  const result = await getUsers({ role: 'admin', limit: 100 });
  return result.users;
};

/**
 * Get inactive users
 */
export const getInactiveUsers = async (): Promise<AdminUser[]> => {
  const result = await getUsers({ is_active: false, limit: 100 });
  return result.users;
};

/**
 * Toggle user active status
 */
export const toggleUserActive = async (userId: number, isActive: boolean): Promise<AdminUser> => {
  return isActive ? activateUser(userId) : deactivateUser(userId);
};

export default {
  getUsers,
  getUserById,
  updateUserRole,
  activateUser,
  deactivateUser,
  deleteUser,
  getAdminStats,
  searchUsers,
  getCoaches,
  getAdmins,
  getInactiveUsers,
  toggleUserActive,
};
