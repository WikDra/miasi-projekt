export type SectionKey = 'dashboard' | 'users' | 'classes' | 'schedule' | 'grades' | 'attendance' | 'students' | 'messages' | 'reports';

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  roles: string[];
}

export interface TeacherProfile {
  id: string;
  userId: string;
  employeeNumber: string;
  specialization: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  parentId: string;
  classId: string;
  studentNumber: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phoneNumber: string;
}

export interface SecretaryProfile {
  id: string;
  userId: string;
  officeRoom: string;
  internalPhone: string;
}

export interface PrincipalProfile {
  id: string;
  userId: string;
  teacherId: string;
  nominationDate: string;
}

export interface SchoolClass {
  id: string;
  teacherId: string;
  name: string;
  schoolYear: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface Lesson {
  id: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

export interface ClassSession {
  id: string;
  lessonId: string;
  sessionDate: string;
  topic: string;
  status: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  excuseComment: string | null;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface GradeRecord {
  id: string;
  studentId: string;
  teacherId: string;
  subjectId: string;
  decimalValue: string;
  weight: number;
  type: string;
  comment: string;
  issuedAt: string;
  category: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  title: string;
  content: string;
  sentAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface TeachingMaterial {
  id: string;
  teacherId: string;
  classId: string;
  title: string;
  fileUrl: string;
  publishedAt: string;
}

export interface DashboardSummary {
  users: number;
  teachers: number;
  students: number;
  classes: number;
  unreadMessages: number;
  unreadNotifications: number;
  grades: number;
  attendanceRecords: number;
}

export interface BootstrapResponse {
  summary: DashboardSummary;
  roles: Role[];
  users: User[];
  teachers: TeacherProfile[];
  students: StudentProfile[];
  parents: ParentProfile[];
  secretaries: SecretaryProfile[];
  principals: PrincipalProfile[];
  classes: SchoolClass[];
  subjects: Subject[];
  lessons: Lesson[];
  classSessions: ClassSession[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  messages: Message[];
  notifications: Notification[];
  teachingMaterials: TeachingMaterial[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGradeRequest {
  studentId: string;
  teacherId: string;
  subjectId: string;
  decimalValue: number;
  weight: number;
  type: string;
  comment: string;
}

export interface CreateAttendanceRequest {
  sessionId: string;
  studentId: string;
  status: string;
  excuseComment?: string;
}

export interface ExcuseAttendanceRequest {
  excuseComment: string;
}

export interface UpdateGradeRequest {
  studentId: string;
  teacherId: string;
  subjectId: string;
  decimalValue: number;
  weight: number;
  type: string;
  comment: string;
}

export interface CreateSubjectRequest {
  name: string;
  description: string;
}

export interface UpdateSubjectRequest {
  name: string;
  description: string;
}

export interface CreateLessonRequest {
  classId: string;
  teacherId: string;
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

export interface UpdateLessonRequest {
  classId: string;
  teacherId: string;
  subjectId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

export interface CreateMessageRequest {
  recipientId: string;
  title: string;
  content: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  roles: string[];
}

export interface UpdateClassRequest {
  name: string;
  teacherId: string;
  schoolYear: string;
}

export interface UpdateStudentRequest {
  userId: string;
  parentId?: string;
  classId: string;
  studentNumber: string;
}

export interface CreateStudentRequest {
  userId: string;
  parentId?: string;
  classId: string;
  studentNumber: string;
}

export interface CreateClassRequest {
  name: string;
  teacherId: string;
  schoolYear: string;
}

export interface AttendanceReportEntry {
  studentName: string;
  className: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

export interface GradeReportEntry {
  studentName: string;
  className: string;
  subjectName: string;
  average: number;
  gradeCount: number;
}

export interface LoginResponse {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  token: string;
}

export interface Session {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
}

export interface CreateSessionRequest {
  lessonId: string;
  sessionDate: string;
  topic: string;
}
