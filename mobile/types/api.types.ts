/**
 * Type definitions for API requests and responses
 */

// User Role Types
export type UserRole = 'user' | 'coach' | 'admin';

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_premium: boolean;
  role: UserRole;
  created_at: string;
  last_login: string | null;
}

export interface UserRegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
}

// Coach Profile Types
export interface CoachProfile {
  id: number;
  user_id: number;
  specialization: string | null;
  certifications: string | null;
  years_of_experience: number | null;
  bio: string | null;
  max_clients: number;
  is_accepting_clients: boolean;
  hourly_rate: number | null;
  phone_number: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachProfileUpdate {
  specialization?: string;
  certifications?: string;
  years_of_experience?: number;
  bio?: string;
  max_clients?: number;
  is_accepting_clients?: boolean;
  hourly_rate?: number;
  phone_number?: string;
  website_url?: string;
}

// Coach Client Types
export interface CoachClient {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  assigned_at: string;
  profile?: UserProfile;
}

export interface ClientAssignment {
  client_id: number;
}

export interface CoachWithProfile extends User {
  coach_profile: CoachProfile | null;
}

// Profile Types
export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height: number | null;
  weight: number | null;
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goals: string | null;
  preferred_workout_time: string | null;
  workout_days_per_week: number | null;
  avatar_url: string | null;
  location: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_level?: string;
  activity_level?: string;
  goals?: string;
  preferred_workout_time?: string;
  workout_days_per_week?: number;
  avatar_url?: string;
  location?: string;
  timezone?: string;
}

// Measurement Types
export interface Measurement {
  id: number;
  user_id: number;
  weight: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  bmi: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  left_arm: number | null;
  right_arm: number | null;
  left_thigh: number | null;
  right_thigh: number | null;
  left_calf: number | null;
  right_calf: number | null;
  neck: number | null;
  shoulders: number | null;
  water_percentage: number | null;
  visceral_fat: number | null;
  resting_metabolic_rate: number | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at?: string;
}

export interface MeasurementCreateData {
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  bmi?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  left_arm?: number;
  right_arm?: number;
  left_thigh?: number;
  right_thigh?: number;
  left_calf?: number;
  right_calf?: number;
  neck?: number;
  shoulders?: number;
  water_percentage?: number;
  visceral_fat?: number;
  resting_metabolic_rate?: number;
  notes?: string;
  recorded_at?: string; // ISO date string for specifying measurement date
}

export interface MeasurementUpdateData extends MeasurementCreateData {
  id?: number;
}

// Query parameters for measurements
export interface MeasurementQueryParams {
  month?: string; // YYYY-MM format
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  skip?: number;
  limit?: number;
}

// Monthly measurement summary
export interface MeasurementMonthlySummary {
  month: string;
  total_entries: number;
  avg_weight: number | null;
  min_weight: number | null;
  max_weight: number | null;
  weight_change: number | null;
  avg_body_fat: number | null;
  body_fat_change: number | null;
  entries_by_date: { [date: string]: boolean };
}

// Trend calculation results
export interface MeasurementTrends {
  weight_trend: 'up' | 'down' | 'stable' | null;
  weight_delta: number | null;
  weight_7day_avg: number | null;
  weight_30day_avg: number | null;
  body_fat_delta: number | null;
  weight_history: Array<{ date: string; weight: number }>;
  body_fat_history: Array<{ date: string; bodyFat: number }>;
}

// Comparison with previous period
export interface MeasurementComparison {
  current_avg_weight: number | null;
  previous_avg_weight: number | null;
  weight_difference: number | null;
  current_avg_body_fat: number | null;
  previous_avg_body_fat: number | null;
  body_fat_difference: number | null;
  current_entries: number;
  previous_entries: number;
}

// Goal Types
export interface Goal {
  id: number;
  user_id: number;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'body_fat_reduction' | 'endurance' | 'strength' | 'flexibility' | 'custom';
  title: string;
  description: string | null;
  target_value: number | null;
  unit: string | null;
  starting_value: number | null;
  current_value: number | null;
  is_active: boolean;
  is_completed: boolean;
  progress_percentage: number;
  start_date: string | null;
  target_date: string | null;
  completed_date: string | null;
  created_at: string;
}

export interface GoalCreateData {
  goal_type: string;
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  starting_value?: number;
  target_date?: string;
}

export interface GoalProgressUpdate {
  current_value: number;
}

// Statistics Types
export interface UserStats {
  total_measurements: number;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_devices: number;
  unread_notifications: number;
  member_since_days: number;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  is_sent: boolean;
  sent_at: string | null;
  read_at: string | null;
  sent_via_push: boolean;
  sent_via_email: boolean;
  sent_via_in_app: boolean;
  extra_data: any;
  priority: string;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}
