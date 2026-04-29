import type { BootstrapResponse, CreateGradeRequest, GradeRecord, LoginRequest, LoginResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const message = await response.text();
    let errorMessage = message;
    try {
      const parsed = JSON.parse(message) as { message?: string };
      if (parsed.message) {
        errorMessage = parsed.message;
      }
    } catch {
      // fall through to the raw response body
    }
    throw new Error(errorMessage || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  return requestJson<BootstrapResponse>('/api/bootstrap');
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}

export async function createGrade(request: CreateGradeRequest, token: string): Promise<GradeRecord> {
  return requestJson<GradeRecord>('/api/grades', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
}
