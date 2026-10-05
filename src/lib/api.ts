/**
 * Typed API client for the FinPath Flask backend.
 *
 * Every request automatically attaches the Supabase access token
 * from the current session so the backend can verify the user.
 */

import { supabase } from './supabase'

const API_BASE = '/api'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const text = await res.text()
  let body: Record<string, unknown> = {}
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      throw new ApiError('Server returned an invalid response', res.status)
    }
  }

  if (!res.ok) {
    throw new ApiError(
      (body.error as string) || `Request failed with status ${res.status}`,
      res.status
    )
  }

  return body as T
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: { id: string; email: string }
  access_token: string | null
  message: string
}

export async function apiSignUp(email: string, password: string) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiSignIn(email: string, password: string) {
  return request<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ── Health ───────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  supabase_url: string
  database: string
}

export async function apiHealth() {
  return request<HealthResponse>('/health')
}

// ── Submit Complete Plan ─────────────────────────────────────────────────────

export interface SubmitResponse {
  plan: Record<string, unknown>
  snapshot: Record<string, unknown>
  goals: Record<string, unknown>
  message: string
}

export async function apiSubmitPlan(data: {
  personal: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
  }
  financial: {
    employmentStatus: string
    incomeRange: string
    monthlyExpenses: string
    currentSavings: string
  }
  goals: {
    mainGoal: string
    targetAmount: string
    timeframe: string
    riskPreference: string
  }
}) {
  return request<SubmitResponse>('/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Latest Plan ──────────────────────────────────────────────────────────────

export interface LatestPlanResponse {
  plan: Record<string, unknown> | null
  profile: Record<string, unknown> | null
  snapshot: Record<string, unknown> | null
  goals: Record<string, unknown> | null
}

export async function apiGetLatestPlan() {
  return request<LatestPlanResponse>('/plans/latest')
}