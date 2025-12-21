/**
 * API Configuration
 *
 * Update API_BASE_URL based on your environment:
 * - Development (iOS Simulator): http://localhost:8000
 * - Development (Android Emulator): http://10.0.2.2:8000
 * - Development (Physical Device): http://YOUR_COMPUTER_IP:8000
 * - Production: Your deployed API URL
 */

// Detect platform and set appropriate base URL
import { Platform } from 'react-native';

/**
 * Get your computer's IP address:
 * macOS/Linux: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
 * Windows: Run `ipconfig` and look for IPv4 Address
 */
const LOCAL_IP = 'localhost'; // Replace with your computer's IP when testing on physical device

const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:8000';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:8000';
    } else {
      // Web or other platforms
      return 'http://localhost:8000';
    }
  } else {
    // Production mode - update this with your production API URL
    return 'https://your-production-api.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,

  // Users
  GET_ME: `${API_BASE_URL}/users/me`,
  GET_ALL_USERS: `${API_BASE_URL}/users/`,
  GET_USER: (userId: number) => `${API_BASE_URL}/users/${userId}`,

  // Onboarding
  PROFILE: `${API_BASE_URL}/onboarding/profile`,
  GOALS: `${API_BASE_URL}/onboarding/goals`,
};

/**
 * API Helper Functions
 */

/**
 * Make an authenticated API request
 */
export const authenticatedFetch = async (
  url: string,
  token: string,
  options: RequestInit = {}
) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
};

/**
 * Check if API is reachable
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE_URL, { timeout: 5000 } as any);
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};
