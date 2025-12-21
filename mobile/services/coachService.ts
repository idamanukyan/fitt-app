/**
 * Coach Service - API calls for coach functionality
 */
import apiClient from './api';
import {
  CoachProfile,
  CoachProfileUpdate,
  CoachClient,
  ClientAssignment,
  CoachWithProfile,
  UserProfile,
  Goal,
  Measurement,
} from '../types/api.types';

// Re-export types for convenience
export type { CoachProfile, CoachProfileUpdate, CoachClient, CoachWithProfile };

const COACH_BASE = '/api/coach';

// ============================================================================
// COACH PROFILE
// ============================================================================

export const getCoachProfile = async (): Promise<CoachProfile> => {
  const response = await apiClient.get(`${COACH_BASE}/profile`);
  return response.data;
};

export const createCoachProfile = async (data: CoachProfileUpdate): Promise<CoachProfile> => {
  const response = await apiClient.post(`${COACH_BASE}/profile`, data);
  return response.data;
};

export const updateCoachProfile = async (data: CoachProfileUpdate): Promise<CoachProfile> => {
  const response = await apiClient.put(`${COACH_BASE}/profile`, data);
  return response.data;
};

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export const getClients = async (): Promise<CoachClient[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients`);
  return response.data;
};

export const assignClient = async (clientId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/assign`, {
    client_id: clientId,
  });
  return response.data;
};

export const unassignClient = async (clientId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`${COACH_BASE}/clients/unassign`, {
    client_id: clientId,
  });
  return response.data;
};

// ============================================================================
// CLIENT DATA ACCESS
// ============================================================================

export const getClientProfile = async (clientId: number): Promise<UserProfile> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/profile`);
  return response.data;
};

export const getClientGoals = async (clientId: number): Promise<Goal[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/goals`);
  return response.data;
};

export const getClientMeasurements = async (
  clientId: number,
  limit: number = 30
): Promise<Measurement[]> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/measurements`, {
    params: { limit },
  });
  return response.data;
};

export interface ClientStats {
  total_measurements: number;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  latest_weight: number | null;
  weight_change_30d: number | null;
}

export const getClientStats = async (clientId: number): Promise<ClientStats> => {
  const response = await apiClient.get(`${COACH_BASE}/clients/${clientId}/stats`);
  return response.data;
};

// ============================================================================
// COACH DISCOVERY (PUBLIC)
// ============================================================================

export const discoverCoaches = async (): Promise<CoachWithProfile[]> => {
  const response = await apiClient.get(`${COACH_BASE}/discover`);
  return response.data;
};

export const getMyCoaches = async (): Promise<CoachWithProfile[]> => {
  const response = await apiClient.get(`${COACH_BASE}/my-coaches`);
  return response.data;
};
