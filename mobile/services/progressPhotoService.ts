/**
 * Progress Photo Service
 * Handles API calls for progress photo management
 */
import apiClient from './api';
import * as ImageManipulator from 'expo-image-manipulator';
import type {
  ProgressPhoto,
  ProgressPhotoCreate,
  ProgressPhotoUpdate,
  PhotoComparison,
  TimelineResponse,
  ProgressPhotoStats,
  PhotoType,
} from '../types/progress.types';

class ProgressPhotoService {
  private baseUrl = '/api/progress-photos';

  /**
   * Convert image URI to base64
   */
  async imageToBase64(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Compress and resize image for upload
   */
  async compressImage(uri: string, maxWidth: number = 1080): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }

  /**
   * Create thumbnail version of image
   */
  async createThumbnail(uri: string): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return uri;
    }
  }

  /**
   * Create a new progress photo
   */
  async createProgressPhoto(data: ProgressPhotoCreate): Promise<ProgressPhoto> {
    const response = await apiClient.post<ProgressPhoto>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Upload photo with image processing
   */
  async uploadPhoto(
    imageUri: string,
    photoType: PhotoType,
    additionalData?: {
      weight_kg?: number;
      body_fat_percentage?: number;
      notes?: string;
      is_public?: boolean;
    }
  ): Promise<ProgressPhoto> {
    // Compress main image
    const compressedUri = await this.compressImage(imageUri);
    const photoBase64 = await this.imageToBase64(compressedUri);

    // Create thumbnail
    const thumbnailUri = await this.createThumbnail(imageUri);
    const thumbnailBase64 = await this.imageToBase64(thumbnailUri);

    const photoData: ProgressPhotoCreate = {
      photo_url: photoBase64,
      thumbnail_url: thumbnailBase64,
      photo_type: photoType,
      taken_at: new Date().toISOString(),
      ...additionalData,
    };

    return this.createProgressPhoto(photoData);
  }

  /**
   * Get all progress photos for current user
   */
  async getProgressPhotos(
    photoType?: PhotoType,
    skip: number = 0,
    limit: number = 100
  ): Promise<ProgressPhoto[]> {
    const params: any = { skip, limit };
    if (photoType) {
      params.photo_type = photoType;
    }

    const response = await apiClient.get<ProgressPhoto[]>(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Get a single progress photo by ID
   */
  async getProgressPhoto(photoId: number): Promise<ProgressPhoto> {
    const response = await apiClient.get<ProgressPhoto>(`${this.baseUrl}/${photoId}`);
    return response.data;
  }

  /**
   * Update progress photo metadata
   */
  async updateProgressPhoto(photoId: number, data: ProgressPhotoUpdate): Promise<ProgressPhoto> {
    const response = await apiClient.put<ProgressPhoto>(`${this.baseUrl}/${photoId}`, data);
    return response.data;
  }

  /**
   * Delete a progress photo
   */
  async deleteProgressPhoto(photoId: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${photoId}`);
  }

  /**
   * Get before/after comparison
   */
  async getComparison(photoType?: PhotoType): Promise<PhotoComparison> {
    const params: any = {};
    if (photoType) {
      params.photo_type = photoType;
    }

    const response = await apiClient.get<PhotoComparison>(`${this.baseUrl}/comparison`, { params });
    return response.data;
  }

  /**
   * Get timeline view
   */
  async getTimeline(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<TimelineResponse> {
    const response = await apiClient.get<TimelineResponse>(`${this.baseUrl}/timeline`, {
      params: { period },
    });
    return response.data;
  }

  /**
   * Get progress photo statistics
   */
  async getStats(): Promise<ProgressPhotoStats> {
    const response = await apiClient.get<ProgressPhotoStats>(`${this.baseUrl}/stats`);
    return response.data;
  }
}

export const progressPhotoService = new ProgressPhotoService();
