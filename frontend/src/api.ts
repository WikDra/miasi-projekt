import type {
  AttendanceRecord,
  AttendanceReportEntry,
  BootstrapResponse,
  CreateAttendanceRequest,
  CreateClassRequest,
  CreateGradeRequest,
  CreateMessageRequest,
  CreateLessonRequest,
  CreateSessionRequest,
  CreateSubjectRequest,
  CreateStudentRequest,
  CreateUserRequest,
  GradeReportEntry,
  GradeRecord,
  ClassSession,
  LoginRequest,
  LoginResponse,
  Message,
  Notification,
  ExcuseAttendanceRequest,
  SchoolClass,
  Subject,
  Lesson,
  StudentProfile,
  UpdateClassRequest,
  UpdateGradeRequest,
  UpdateLessonRequest,
  UpdateStudentRequest,
  UpdateSubjectRequest,
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
  if (response.status === 204) {
    return undefined as T;
  }
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchBootstrap(token: string): Promise<BootstrapResponse> {
  return requestJson<BootstrapResponse>('/api/bootstrap', {
    headers: authHeaders(token),
  });
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

export async function updateGrade(id: string, request: UpdateGradeRequest, token: string): Promise<GradeRecord> {
  return requestJson<GradeRecord>(`/api/grades/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function deleteGrade(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/grades/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function createAttendance(request: CreateAttendanceRequest, token: string): Promise<AttendanceRecord> {
  return requestJson<AttendanceRecord>('/api/attendance', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function excuseAttendance(id: string, request: ExcuseAttendanceRequest, token: string): Promise<AttendanceRecord> {
  return requestJson<AttendanceRecord>(`/api/attendance/${id}/excuse`, {
    method: 'PATCH',
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

export async function deleteUser(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function createStudent(request: CreateStudentRequest, token: string): Promise<StudentProfile> {
  return requestJson<StudentProfile>('/api/students', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function updateStudent(id: string, request: UpdateStudentRequest, token: string): Promise<StudentProfile> {
  return requestJson<StudentProfile>(`/api/students/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function deleteStudent(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/students/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function suspendStudent(id: string, token: string): Promise<StudentProfile> {
  return requestJson<StudentProfile>(`/api/students/${id}/suspend`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export async function reactivateStudent(id: string, token: string): Promise<StudentProfile> {
  return requestJson<StudentProfile>(`/api/students/${id}/reactivate`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export async function createClassEntity(request: CreateClassRequest, token: string): Promise<SchoolClass> {
  return requestJson<SchoolClass>('/api/classes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function updateClassEntity(id: string, request: UpdateClassRequest, token: string): Promise<SchoolClass> {
  return requestJson<SchoolClass>(`/api/classes/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function deleteClassEntity(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/classes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function createSubject(request: CreateSubjectRequest, token: string): Promise<Subject> {
  return requestJson<Subject>('/api/subjects', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function updateSubject(id: string, request: UpdateSubjectRequest, token: string): Promise<Subject> {
  return requestJson<Subject>(`/api/subjects/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function deleteSubject(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/subjects/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function createLesson(request: CreateLessonRequest, token: string): Promise<Lesson> {
  return requestJson<Lesson>('/api/lessons', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function updateLesson(id: string, request: UpdateLessonRequest, token: string): Promise<Lesson> {
  return requestJson<Lesson>(`/api/lessons/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}

export async function deleteLesson(id: string, token: string): Promise<void> {
  await requestJson<void>(`/api/lessons/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
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

export async function createClassSession(request: CreateSessionRequest, token: string): Promise<ClassSession> {
  return requestJson<ClassSession>('/api/sessions', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(request),
  });
}
