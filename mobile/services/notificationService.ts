/**
 * Notification service for user notifications
 */
import apiClient from './api';
import type { Notification } from '../types/api.types';

export const notificationService = {
  /**
   * Get all notifications
   */
  async getNotifications(skip: number = 0, limit: number = 20): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications/', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await apiClient.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
