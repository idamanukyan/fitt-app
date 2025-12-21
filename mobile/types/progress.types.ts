/**
 * Type definitions for Progress Photos
 */

export type PhotoType = 'front' | 'back' | 'side_left' | 'side_right' | 'custom';

export interface ProgressPhoto {
  id: number;
  user_id: number;
  photo_url: string;
  thumbnail_url: string | null;
  photo_type: PhotoType;
  taken_at: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  notes: string | null;
  is_public: boolean;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressPhotoCreate {
  photo_url: string;
  thumbnail_url?: string;
  photo_type: PhotoType;
  taken_at?: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
  is_public?: boolean;
  tags?: string;
}

export interface ProgressPhotoUpdate {
  photo_type?: PhotoType;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
  is_public?: boolean;
  tags?: string;
}

export interface PhotoComparison {
  first_photo: ProgressPhoto | null;
  latest_photo: ProgressPhoto | null;
  time_difference_days: number;
  weight_change_kg: number | null;
  body_fat_change: number | null;
}

export interface TimelineGroup {
  period: string;
  photos: ProgressPhoto[];
  photo_count: number;
}

export interface TimelineResponse {
  groups: TimelineGroup[];
  total_photos: number;
}

export interface ProgressPhotoStats {
  total_photos: number;
  photos_by_type: Record<string, number>;
  first_photo_date: string | null;
  latest_photo_date: string | null;
  total_days_tracked: number;
}
