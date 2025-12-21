/**
 * Authentication service for login and registration
 */
import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRegisterData, UserLoginData, AuthResponse, User } from '../types/api.types';

// Demo mode - set to true to bypass API calls for development
const DEMO_MODE = false;

// Demo user data
const DEMO_USER: User = {
  id: 1,
  email: 'demo@hyperfit.com',
  username: 'Demo User',
  is_active: true,
  is_premium: true,
  role: 'user',
  created_at: new Date().toISOString(),
  last_login: null,
};

const DEMO_TOKEN = 'demo_token_12345';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: UserRegisterData): Promise<AuthResponse> {
    // Demo mode - simulate registration
    if (DEMO_MODE) {
      const demoResponse: AuthResponse = {
        access_token: DEMO_TOKEN,
        user: {
          ...DEMO_USER,
          email: data.email,
          username: data.username,
        },
      };
      await AsyncStorage.setItem('auth_token', demoResponse.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(demoResponse.user));
      return demoResponse;
    }

    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

    // Store token and user data
    await AsyncStorage.setItem('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Login existing user
   */
  async login(data: UserLoginData): Promise<AuthResponse> {
    // Demo mode - simulate login
    if (DEMO_MODE) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const demoResponse: AuthResponse = {
        access_token: DEMO_TOKEN,
        user: {
          ...DEMO_USER,
          email: data.email,
        },
      };
      await AsyncStorage.setItem('auth_token', demoResponse.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(demoResponse.user));
      return demoResponse;
    }

    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);

    // Store token and user data
    await AsyncStorage.setItem('auth_token', response.data.access_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  },

  /**
   * Get current user from storage
   */
  async getCurrentUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  },
};
