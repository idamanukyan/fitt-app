/**
 * Authentication Context for managing user authentication state
 */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import type { User, UserLoginData, UserRegisterData, AuthResponse, UserRole } from '../types/api.types';
import { analytics, AnalyticsEvents } from '../services/analyticsService';
import {
  OAuthUserInfo,
  OAuthProvider,
  authenticateWithBackend,
  clearOAuthSession,
} from '../services/oauthService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCoach: boolean;
  isAdmin: boolean;
  userRole: UserRole | null;
  oauthProvider: OAuthProvider | null;
  login: (data: UserLoginData) => Promise<void>;
  register: (data: UserRegisterData) => Promise<void>;
  loginWithOAuth: (userInfo: OAuthUserInfo, idToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: UserLoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.user);
      setIsAuthenticated(true);

      // Identify user in analytics
      if (response.user) {
        analytics.identify(response.user.id.toString(), {
          email: response.user.email,
          name: response.user.username,
          isPremium: response.user.is_premium,
        });
        analytics.track(AnalyticsEvents.AUTH_LOGIN, {
          method: 'email',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      analytics.trackError(error as Error, 'login');
      throw error;
    }
  };

  const register = async (data: UserRegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
      setOauthProvider(null);

      // Identify user in analytics
      if (response.user) {
        analytics.identify(response.user.id.toString(), {
          email: response.user.email,
          name: response.user.username,
          isPremium: response.user.is_premium,
          signupDate: new Date().toISOString(),
        });
        analytics.track(AnalyticsEvents.AUTH_SIGNUP, {
          method: 'email',
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      analytics.trackError(error as Error, 'register');
      throw error;
    }
  };

  // OAuth login handler
  const loginWithOAuth = async (userInfo: OAuthUserInfo, idToken?: string) => {
    try {
      const response = await authenticateWithBackend(userInfo, idToken);
      setUser(response.user);
      setIsAuthenticated(true);
      setOauthProvider(userInfo.provider);

      // Identify user in analytics
      if (response.user) {
        analytics.identify(response.user.id.toString(), {
          email: response.user.email,
          name: response.user.username,
          isPremium: response.user.is_premium,
          oauthProvider: userInfo.provider,
        });
        analytics.track(AnalyticsEvents.AUTH_LOGIN, {
          method: userInfo.provider,
        });
      }
    } catch (error) {
      console.error(`OAuth login failed (${userInfo.provider}):`, error);
      analytics.trackError(error as Error, `oauth_login_${userInfo.provider}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      analytics.track(AnalyticsEvents.AUTH_LOGOUT);
      await authService.logout();
      await clearOAuthSession();
      setUser(null);
      setIsAuthenticated(false);
      setOauthProvider(null);
      analytics.reset();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Derived role helpers
  const userRole: UserRole | null = user?.role || null;
  const isCoach = userRole === 'coach';
  const isAdmin = userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isCoach,
        isAdmin,
        userRole,
        oauthProvider,
        login,
        register,
        loginWithOAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
