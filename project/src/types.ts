export type Role = 'student' | 'teacher' | 'hod' | 'admin';

export type AccountStatus = 'active' | 'pending' | 'rejected' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  course?: string;
  semester?: number;
  year?: number;
  rollNo?: string;
  phone?: string;
  accountStatus: AccountStatus;
  createdAt: string;
  isDemo?: boolean;
}

export interface AuthCredential {
  userId: string;
  email: string;
  collegeId?: string; // rollNo / employee ID
  passwordHash: string;
  salt: string;
  resetToken?: string;
  resetTokenExpires?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  rememberMe: boolean;
}

export type AppRoute =
  | '/'
  | '/login/student'
  | '/login/teacher'
  | '/login/hod'
  | '/login/admin'
  | '/signup/student'
  | '/signup/teacher'
  | '/signup/hod'
  | '/signup/admin'
  | '/forgot-password'
  | '/student/dashboard'
  | '/teacher/dashboard'
  | '/hod/dashboard'
  | '/admin/dashboard';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {

  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  documentName?: string;
  status: LeaveStatus;
  teacherApproved: boolean;
  hodApproved: boolean;
  createdAt: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export interface GreenCardSlot {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedIds: string[];
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  bookedAt: string;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  building: string;
  capacity: number;
  floor: number;
}

export interface ClassroomSchedule {
  id: string;
  classroomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  bookedBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export type Page =
  | 'dashboard'
  | 'apply-leave'
  | 'leave-history'
  | 'leave-approvals'
  | 'green-card'
  | 'my-bookings'
  | 'classroom'
  | 'users'
  | 'notifications';

export interface AppData {
  users: User[];
  leaveRequests: LeaveRequest[];
  greenCardSlots: GreenCardSlot[];
  bookings: Booking[];
  classrooms: Classroom[];
  classroomSchedules: ClassroomSchedule[];
  notifications: Notification[];
}
