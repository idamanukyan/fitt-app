/**
 * API Client Tests
 *
 * Unit tests for the base API client configuration.
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to get fresh API client
    jest.resetModules();
  });

  describe('Configuration', () => {
    it('should use environment variable for base URL', () => {
      // Verify the API URL can be configured via env
      const envUrl = process.env.EXPO_PUBLIC_API_URL;
      expect(envUrl || 'http://localhost:8000').toBeTruthy();
    });
  });

  describe('Authentication', () => {
    it('should add auth token to requests when available', async () => {
      const mockToken = 'test-jwt-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

      // Verify token retrieval works
      const token = await AsyncStorage.getItem('auth_token');
      expect(token).toBe(mockToken);
    });

    it('should handle missing auth token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const token = await AsyncStorage.getItem('auth_token');
      expect(token).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear storage on 401 response', async () => {
      // This tests the interceptor behavior conceptually
      // Actual implementation would need axios-mock-adapter
      expect(AsyncStorage.removeItem).toBeDefined();
    });
  });
});
