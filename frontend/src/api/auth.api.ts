import { apiClient } from './client'
import type { AuthResponse, AuthUser } from '../types/auth.types'

interface AuthPayload {
  username: string
  password: string
}

export async function register(payload: AuthPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>('/auth/me')
  return response.data
}
