/**
 * Device Service for HyperFit
 *
 * Handles device registration for push notifications:
 * - Register device with push token
 * - Update device info
 * - Remove device
 * - List user's devices
 */

import apiClient from './api';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ============================================================================
// TYPES
// ============================================================================

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface DeviceInfo {
  id: number;
  user_id: number;
  device_token: string;
  platform: DevicePlatform;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceRegistrationData {
  device_token: string;
  platform: DevicePlatform;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
}

export interface DeviceUpdateData {
  device_token?: string;
  device_name?: string;
  is_active?: boolean;
}

// ============================================================================
// PUSH NOTIFICATION SETUP
// ============================================================================

/**
 * Configure notification handler
 */
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Request push notification permissions and get token
 */
export const requestPushToken = async (): Promise<string | null> => {
  // Check if running on physical device
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
};

/**
 * Get current device info
 */
export const getCurrentDeviceInfo = (): Partial<DeviceRegistrationData> => {
  return {
    platform: Platform.OS as DevicePlatform,
    device_name: Device.deviceName || undefined,
    device_model: Device.modelName || undefined,
    os_version: Device.osVersion || undefined,
    app_version: Constants.expoConfig?.version || '1.0.0',
  };
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Register or update device for push notifications
 */
export const registerDevice = async (data: DeviceRegistrationData): Promise<DeviceInfo> => {
  const response = await apiClient.post<DeviceInfo>('/devices/', data);
  return response.data;
};

/**
 * Get all devices for current user
 */
export const getDevices = async (): Promise<DeviceInfo[]> => {
  const response = await apiClient.get<DeviceInfo[]>('/devices/');
  return response.data;
};

/**
 * Get active devices only
 */
export const getActiveDevices = async (): Promise<DeviceInfo[]> => {
  const response = await apiClient.get<DeviceInfo[]>('/devices/active');
  return response.data;
};

/**
 * Update device information
 */
export const updateDevice = async (deviceId: number, data: DeviceUpdateData): Promise<DeviceInfo> => {
  const response = await apiClient.put<DeviceInfo>(`/devices/${deviceId}`, data);
  return response.data;
};

/**
 * Remove a device (unregister from push notifications)
 */
export const removeDevice = async (deviceId: number): Promise<void> => {
  await apiClient.delete(`/devices/${deviceId}`);
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Register current device for push notifications
 * This is the main function to call during app initialization
 */
export const registerCurrentDevice = async (): Promise<DeviceInfo | null> => {
  try {
    // Configure notification handling
    configureNotifications();

    // Get push token
    const token = await requestPushToken();
    if (!token) {
      console.log('Could not obtain push token');
      return null;
    }

    // Get device info
    const deviceInfo = getCurrentDeviceInfo();

    // Register with backend
    const device = await registerDevice({
      device_token: token,
      platform: deviceInfo.platform || (Platform.OS as DevicePlatform),
      device_name: deviceInfo.device_name,
      device_model: deviceInfo.device_model,
      os_version: deviceInfo.os_version,
      app_version: deviceInfo.app_version,
    });

    console.log('Device registered successfully:', device.id);
    return device;
  } catch (error) {
    console.error('Failed to register device:', error);
    return null;
  }
};

/**
 * Unregister current device
 */
export const unregisterCurrentDevice = async (): Promise<void> => {
  try {
    const devices = await getDevices();
    const token = await requestPushToken();

    if (token) {
      const currentDevice = devices.find(d => d.device_token === token);
      if (currentDevice) {
        await removeDevice(currentDevice.id);
        console.log('Device unregistered successfully');
      }
    }
  } catch (error) {
    console.error('Failed to unregister device:', error);
  }
};

/**
 * Deactivate device without removing it
 */
export const deactivateCurrentDevice = async (): Promise<void> => {
  try {
    const devices = await getDevices();
    const token = await requestPushToken();

    if (token) {
      const currentDevice = devices.find(d => d.device_token === token);
      if (currentDevice) {
        await updateDevice(currentDevice.id, { is_active: false });
        console.log('Device deactivated successfully');
      }
    }
  } catch (error) {
    console.error('Failed to deactivate device:', error);
  }
};

/**
 * Setup notification listeners
 */
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Schedule a local notification (for testing)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>,
  trigger?: Notifications.NotificationTriggerInput
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: trigger || { seconds: 1 },
  });
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  return Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  await Notifications.setBadgeCountAsync(count);
};

export default {
  configureNotifications,
  requestPushToken,
  getCurrentDeviceInfo,
  registerDevice,
  getDevices,
  getActiveDevices,
  updateDevice,
  removeDevice,
  registerCurrentDevice,
  unregisterCurrentDevice,
  deactivateCurrentDevice,
  setupNotificationListeners,
  scheduleLocalNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
};
