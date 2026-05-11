import type {
  AttendanceRecord,
  AttendanceReportEntry,
  BootstrapResponse,
  CreateAttendanceRequest,
  CreateClassRequest,
  CreateGradeRequest,
  CreateMessageRequest,
  CreateStudentRequest,
  CreateUserRequest,
  GradeReportEntry,
  GradeRecord,
  LoginRequest,
  LoginResponse,
  Message,
  Notification,
  SchoolClass,
  StudentProfile,
  UpdateUserRequest,
  User,
} from './types';

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

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  return requestJson<BootstrapResponse>('/api/bootstrap');
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function createGrade(request: CreateGradeRequest, token: string): Promise<GradeRecord> {
  return requestJson<GradeRecord>('/api/grades', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function createAttendance(request: CreateAttendanceRequest, token: string): Promise<AttendanceRecord> {
  return requestJson<AttendanceRecord>('/api/attendance', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function createMessage(request: CreateMessageRequest, token: string): Promise<Message> {
  return requestJson<Message>('/api/messages', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function markNotificationRead(id: string, token: string): Promise<Notification> {
  return requestJson<Notification>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export async function createUser(request: CreateUserRequest, token: string): Promise<User> {
  return requestJson<User>('/api/users', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function updateUser(id: string, request: UpdateUserRequest, token: string): Promise<User> {
  return requestJson<User>(`/api/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function createStudent(request: CreateStudentRequest, token: string): Promise<StudentProfile> {
  return requestJson<StudentProfile>('/api/students', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function createClassEntity(request: CreateClassRequest, token: string): Promise<SchoolClass> {
  return requestJson<SchoolClass>('/api/classes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function fetchAttendanceReport(token: string): Promise<AttendanceReportEntry[]> {
  return requestJson<AttendanceReportEntry[]>('/api/reports/attendance', {
    headers: authHeaders(token),
  });
}

export async function fetchGradesReport(token: string): Promise<GradeReportEntry[]> {
  return requestJson<GradeReportEntry[]>('/api/reports/grades', {
    headers: authHeaders(token),
  });
}
