import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  AppData,
  User,
  LeaveRequest,
  GreenCardSlot,
  Booking,
  Classroom,
  ClassroomSchedule,
  Notification,
  Role,
  Page,
  AuthCredential,
} from '@/types';
import { loadData, saveData, resetData, uid, isoHoursFromNow } from '@/lib/storage';
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  saveSession,
  loadSession,
  clearSession,
  loadCredentials,
  saveCredentials,
  ensureCredentialsExist,
  DEMO_PASSWORDS,
} from '@/lib/auth';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface AuthenticateResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface RegisterStudentData {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  course: string;
  semester: number;
  phone?: string;
  password: string;
}

export interface RegisterTeacherData {
  name: string;
  email: string;
  rollNo: string; // employee ID
  department: string;
  phone?: string;
  password: string;
  inviteCode?: string;
}

export interface CreateAdminUserData {
  name: string;
  email: string;
  role: Role;
  department: string;
  rollNo?: string;
  phone?: string;
  year?: number;
  semester?: number;
  course?: string;
  password: string;
}

interface AppContextValue {
  // Auth
  currentUser: User | null;
  login: (role: Role) => void;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  authenticateUser: (
    identifier: string,
    password: string,
    targetRole?: Role,
    rememberMe?: boolean
  ) => Promise<AuthenticateResult>;
  registerStudent: (data: RegisterStudentData) => Promise<AuthenticateResult>;
  registerTeacher: (
    data: RegisterTeacherData
  ) => Promise<{ success: boolean; error?: string; status: 'active' | 'pending'; user?: User }>;
  requestPasswordReset: (
    identifier: string
  ) => Promise<{ success: boolean; error?: string; resetToken?: string; user?: User }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verifyUserAccount: (userId: string, status: 'active' | 'rejected' | 'disabled') => void;
  createAdminUser: (data: CreateAdminUserData) => Promise<AuthenticateResult>;

  // Navigation
  page: Page;
  setPage: (p: Page) => void;

  // Data
  data: AppData;

  // Toasts
  toasts: Toast[];
  toast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;

  // Leave
  addLeaveRequest: (
    req: Omit<LeaveRequest, 'id' | 'status' | 'teacherApproved' | 'hodApproved' | 'createdAt'>
  ) => void;
  decideLeave: (id: string, approved: boolean, note: string) => void;

  // Green Card
  addSlot: (slot: Omit<GreenCardSlot, 'id' | 'bookedIds'>) => void;
  updateSlot: (id: string, updates: Partial<GreenCardSlot>) => void;
  deleteSlot: (id: string) => void;
  bookSlot: (slotId: string) => void;
  cancelBooking: (slotId: string) => void;

  // Classrooms
  addClassroom: (c: Omit<Classroom, 'id'>) => void;
  updateClassroom: (id: string, updates: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;
  addSchedule: (s: Omit<ClassroomSchedule, 'id'>) => void;
  deleteSchedule: (id: string) => void;

  // Users
  addUser: (u: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = loadSession();
    return session ? session.user : null;
  });
  const [page, setPage] = useState<Page>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Seed credentials on startup if missing
  useEffect(() => {
    ensureCredentialsExist(data.users);
  }, [data.users]);

  // Sync session state on load
  useEffect(() => {
    const session = loadSession();
    if (session) {
      const liveUser = data.users.find((u) => u.id === session.user.id);
      if (liveUser && liveUser.accountStatus === 'active') {
        setCurrentUser(liveUser);
      } else if (liveUser && liveUser.accountStatus !== 'active') {
        clearSession();
        setCurrentUser(null);
      }
    }
  }, [data.users]);

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  // Synchronize leave requests in real-time with backend MongoDB database across all devices
  useEffect(() => {
    let isMounted = true;
    const syncBackendLeaves = async () => {
      try {
        const res = await fetch('/api/leaves');
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && Array.isArray(result.leaves) && result.leaves.length > 0) {
          if (!isMounted) return;
          update((d) => {
            const existingIds = new Set(d.leaveRequests.map((r) => r.id));
            const newFromBackend = result.leaves.filter((r: LeaveRequest) => !existingIds.has(r.id));
            const backendMap = new Map(result.leaves.map((r: LeaveRequest) => [r.id, r]));
            const merged = d.leaveRequests.map((r) =>
              (() => {
                if (!backendMap.has(r.id)) return r;
                const b = backendMap.get(r.id) as LeaveRequest;
                return {
                  ...r,
                  ...b,
                  documentUrl: b.documentUrl || r.documentUrl,
                  documentType: b.documentType || r.documentType,
                };
              })()
            );
            return {
              ...d,
              leaveRequests: [...newFromBackend, ...merged],
            };
          });
        }
      } catch (e) {
        // Fallback to client storage
      }
    };

    syncBackendLeaves();
    const timer = setInterval(syncBackendLeaves, 4000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [update]);

  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = uid('toast');
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addNotification = (
    d: AppData,
    userId: string,
    title: string,
    message: string,
    type: Notification['type']
  ): AppData => {
    const n: Notification = {
      id: uid('nt'),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: isoHoursFromNow(0),
    };
    return { ...d, notifications: [n, ...d.notifications] };
  };

  // Auth: Legacy Quick Login
  const login = useCallback(
    (role: Role) => {
      const user = data.users.find((u) => u.role === role && u.accountStatus === 'active');
      if (user) {
        saveSession(user, false);
        setCurrentUser(user);
        setPage('dashboard');
      }
    },
    [data.users]
  );

  const loginAsUser = useCallback(
    (userId: string) => {
      const user = data.users.find((u) => u.id === userId);
      if (user) {
        if (user.accountStatus === 'disabled') {
          toast('error', 'This account has been disabled.');
          return;
        }
        if (user.accountStatus === 'pending') {
          toast('warning', 'This account is pending administrator verification.');
          return;
        }
        saveSession(user, false);
        setCurrentUser(user);
        setPage('dashboard');
      }
    },
    [data.users, toast]
  );

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setPage('dashboard');
  }, []);

  // Auth: Credential-based Authentication
  const authenticateUser = useCallback(
    async (
      identifier: string,
      password: string,
      targetRole?: Role,
      rememberMe = false
    ): Promise<AuthenticateResult> => {
      const cleanId = identifier.trim().toLowerCase();

      // Find user by email or rollNo (college ID)
      const user = data.users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          (u.rollNo && u.rollNo.toLowerCase() === cleanId)
      );

      if (!user) {
        return { success: false, error: 'Invalid email address or college ID.' };
      }

      // Check role enforcement
      if (targetRole && user.role !== targetRole) {
        return {
          success: false,
          error: `This account is registered as a ${user.role}. Please log in via the ${user.role.toUpperCase()} portal.`,
        };
      }

      // Check account status
      if (user.accountStatus === 'pending') {
        return {
          success: false,
          error: 'Your account is awaiting administrator verification before access is granted.',
        };
      }

      if (user.accountStatus === 'disabled') {
        return {
          success: false,
          error: 'Your account has been disabled. Please contact the college administrator.',
        };
      }

      if (user.accountStatus === 'rejected') {
        return {
          success: false,
          error: 'Your account registration was rejected. Please contact the administrator.',
        };
      }

      // Verify credentials
      let creds = loadCredentials();
      let cred = creds.find((c) => c.userId === user.id);

      // If credential not found yet for a seeded demo account, seed it on the fly
      if (!cred) {
        const defaultPassword = DEMO_PASSWORDS[user.role] || 'LeaveEase@2025';
        const salt = generateSalt();
        const passwordHash = await hashPassword(defaultPassword, salt);
        cred = {
          userId: user.id,
          email: user.email.toLowerCase(),
          collegeId: user.rollNo,
          passwordHash,
          salt,
        };
        creds.push(cred);
        saveCredentials(creds);
      }

      const isValid = await verifyPassword(password, cred.salt, cred.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // Successful login
      saveSession(user, rememberMe);
      setCurrentUser(user);
      setPage('dashboard');
      toast('success', `Welcome back, ${user.name}!`);
      return { success: true, user };
    },
    [data.users, toast]
  );

  // Auth: Student Registration
  const registerStudent = useCallback(
    async (studentData: RegisterStudentData): Promise<AuthenticateResult> => {
      const cleanEmail = studentData.email.trim().toLowerCase();
      const cleanRollNo = studentData.rollNo.trim().toUpperCase();

      // Check duplicate email
      if (data.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email address already exists.' };
      }

      // Check duplicate roll number
      if (
        data.users.some(
          (u) => u.rollNo && u.rollNo.trim().toUpperCase() === cleanRollNo
        )
      ) {
        return { success: false, error: 'An account with this student ID / Register number already exists.' };
      }

      const newUserId = uid('u_stu');
      const salt = generateSalt();
      const passwordHash = await hashPassword(studentData.password, salt);

      const newUser: User = {
        id: newUserId,
        name: studentData.name.trim(),
        email: cleanEmail,
        role: 'student', // ALWAYS locked to student role
        department: studentData.department,
        course: studentData.course,
        semester: studentData.semester,
        year: Math.ceil(studentData.semester / 2),
        rollNo: cleanRollNo,
        phone: studentData.phone?.trim() || undefined,
        accountStatus: 'active',
        createdAt: isoHoursFromNow(0),
        isDemo: false,
      };

      // Save credential
      const creds = loadCredentials();
      creds.push({
        userId: newUserId,
        email: cleanEmail,
        collegeId: cleanRollNo,
        passwordHash,
        salt,
      });
      saveCredentials(creds);

      // Save user to data store
      update((d) => {
        let next = { ...d, users: [newUser, ...d.users] };
        next = addNotification(
          next,
          newUserId,
          'Welcome to LeaveEase!',
          'Your student account has been created. You can now apply for leaves and track your requests.',
          'success'
        );
        return next;
      });

      // Auto sign in
      saveSession(newUser, true);
      setCurrentUser(newUser);
      setPage('dashboard');
      toast('success', `Account created successfully! Welcome, ${newUser.name}.`);

      return { success: true, user: newUser };
    },
    [data.users, update, toast]
  );

  // Auth: Teacher Registration (with admin approval workflow)
  const registerTeacher = useCallback(
    async (
      teacherData: RegisterTeacherData
    ): Promise<{ success: boolean; error?: string; status: 'active' | 'pending'; user?: User }> => {
      const cleanEmail = teacherData.email.trim().toLowerCase();
      const cleanEmpId = teacherData.rollNo.trim().toUpperCase();

      if (data.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return {
          success: false,
          error: 'An account with this official email address already exists.',
          status: 'pending',
        };
      }

      if (
        data.users.some(
          (u) => u.rollNo && u.rollNo.trim().toUpperCase() === cleanEmpId
        )
      ) {
        return {
          success: false,
          error: 'An account with this Teacher / Employee ID already exists.',
          status: 'pending',
        };
      }

      // Verification policy: FACULTY2025 auto-verifies; otherwise status is pending admin approval
      const isVerified =
        teacherData.inviteCode &&
        teacherData.inviteCode.trim().toUpperCase() === 'FACULTY2025';
      const status = isVerified ? 'active' : 'pending';

      const newUserId = uid('u_tch');
      const salt = generateSalt();
      const passwordHash = await hashPassword(teacherData.password, salt);

      const newUser: User = {
        id: newUserId,
        name: teacherData.name.trim(),
        email: cleanEmail,
        role: 'teacher',
        department: teacherData.department,
        rollNo: cleanEmpId,
        phone: teacherData.phone?.trim() || undefined,
        accountStatus: status,
        createdAt: isoHoursFromNow(0),
        isDemo: false,
      };

      // Save credential
      const creds = loadCredentials();
      creds.push({
        userId: newUserId,
        email: cleanEmail,
        collegeId: cleanEmpId,
        passwordHash,
        salt,
      });
      saveCredentials(creds);

      update((d) => {
        let next = { ...d, users: [newUser, ...d.users] };
        // Notify admin of new teacher pending verification if applicable
        if (status === 'pending') {
          const admins = d.users.filter((u) => u.role === 'admin');
          for (const a of admins) {
            next = addNotification(
              next,
              a.id,
              'Faculty Verification Request',
              `${newUser.name} (${newUser.department}) has registered as a faculty member and requires verification.`,
              'warning'
            );
          }
        }
        return next;
      });

      if (status === 'active') {
        saveSession(newUser, true);
        setCurrentUser(newUser);
        setPage('dashboard');
        toast('success', `Faculty account verified and activated! Welcome, ${newUser.name}.`);
      } else {
        toast(
          'info',
          'Faculty registration submitted! Awaiting administrator verification.'
        );
      }

      return { success: true, status, user: newUser };
    },
    [data.users, update, toast]
  );

  // Auth: Password Reset Request
  const requestPasswordReset = useCallback(
    async (
      identifier: string
    ): Promise<{ success: boolean; error?: string; resetToken?: string; user?: User }> => {
      const cleanId = identifier.trim().toLowerCase();
      const user = data.users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          (u.rollNo && u.rollNo.toLowerCase() === cleanId)
      );

      if (!user) {
        // Return success message without revealing account existence
        return {
          success: true,
          error:
            'If an account matches this email or ID, password reset instructions have been sent.',
        };
      }

      const resetToken = `rst_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      const creds = loadCredentials();
      const updated = creds.map((c) =>
        c.userId === user.id
          ? { ...c, resetToken, resetTokenExpires: expiresAt }
          : c
      );
      saveCredentials(updated);

      toast('info', `Password reset token generated for ${user.email}`);
      return { success: true, resetToken, user };
    },
    [data.users, toast]
  );

  // Auth: Complete Password Reset
  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const creds = loadCredentials();
      const credIndex = creds.findIndex((c) => c.resetToken === token);

      if (credIndex === -1) {
        return { success: false, error: 'Invalid or expired password reset token.' };
      }

      const cred = creds[credIndex];
      if (cred.resetTokenExpires && new Date(cred.resetTokenExpires).getTime() < Date.now()) {
        return { success: false, error: 'Password reset token has expired. Please request a new one.' };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(newPassword, salt);

      creds[credIndex] = {
        ...cred,
        passwordHash,
        salt,
        resetToken: undefined,
        resetTokenExpires: undefined,
      };
      saveCredentials(creds);

      toast('success', 'Your password has been updated! Please sign in with your new password.');
      return { success: true };
    },
    [toast]
  );

  // Admin Account Approval / Status update
  const verifyUserAccount = useCallback(
    (userId: string, status: 'active' | 'rejected' | 'disabled') => {
      update((d) => {
        const target = d.users.find((u) => u.id === userId);
        if (!target) return d;
        let next = {
          ...d,
          users: d.users.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u)),
        };

        const statusMsg =
          status === 'active'
            ? 'Your account has been approved and activated by the administrator.'
            : status === 'rejected'
            ? 'Your account registration was not approved.'
            : 'Your account has been disabled.';

        next = addNotification(
          next,
          userId,
          `Account ${status.toUpperCase()}`,
          statusMsg,
          status === 'active' ? 'success' : 'error'
        );
        return next;
      });

      toast(
        status === 'active' ? 'success' : 'info',
        `User account status updated to ${status}.`
      );
    },
    [update, toast]
  );

  // Admin User Creation (including HOD accounts)
  const createAdminUser = useCallback(
    async (userData: CreateAdminUserData): Promise<AuthenticateResult> => {
      const cleanEmail = userData.email.trim().toLowerCase();
      const cleanId = (userData.rollNo || '').trim().toUpperCase();

      if (data.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      if (
        cleanId &&
        data.users.some(
          (u) => u.rollNo && u.rollNo.trim().toUpperCase() === cleanId
        )
      ) {
        return { success: false, error: 'An account with this ID already exists.' };
      }

      const newUserId = uid(`u_${userData.role}`);
      const salt = generateSalt();
      const passwordHash = await hashPassword(userData.password, salt);

      const newUser: User = {
        id: newUserId,
        name: userData.name.trim(),
        email: cleanEmail,
        role: userData.role,
        department: userData.department,
        rollNo: cleanId || `${userData.role.toUpperCase()}-${newUserId.slice(-4)}`,
        phone: userData.phone?.trim() || undefined,
        year: userData.year,
        semester: userData.semester,
        course: userData.course,
        accountStatus: 'active',
        createdAt: isoHoursFromNow(0),
        isDemo: false,
      };

      const creds = loadCredentials();
      creds.push({
        userId: newUserId,
        email: cleanEmail,
        collegeId: newUser.rollNo,
        passwordHash,
        salt,
      });
      saveCredentials(creds);

      update((d) => ({
        ...d,
        users: [newUser, ...d.users],
      }));

      toast('success', `${newUser.role.toUpperCase()} account for ${newUser.name} created successfully.`);
      return { success: true, user: newUser };
    },
    [data.users, update, toast]
  );

  // Leave
  const addLeaveRequest = useCallback(
    (
      req: Omit<
        LeaveRequest,
        'id' | 'status' | 'teacherApproved' | 'hodApproved' | 'createdAt'
      >
    ) => {
      const newReq: LeaveRequest = {
        ...req,
        id: uid('lv'),
        status: 'pending',
        teacherApproved: false,
        hodApproved: false,
        createdAt: isoHoursFromNow(0),
      };

      // 1. Update local state and localStorage immediately
      update((d) => {
        let next = { ...d, leaveRequests: [newReq, ...d.leaveRequests] };
        const deptNorm = (req.department || '').trim().toLowerCase();
        let teachers = d.users.filter(
          (u) =>
            u.role === 'teacher' &&
            u.accountStatus === 'active' &&
            (u.department || '').trim().toLowerCase() === deptNorm
        );
        // Fallback: If no teacher in this specific department, notify all active teachers so requests are never lost
        if (teachers.length === 0) {
          teachers = d.users.filter((u) => u.role === 'teacher' && u.accountStatus === 'active');
        }
        for (const t of teachers) {
          next = addNotification(
            next,
            t.id,
            'New Leave Request',
            `${req.studentName} (${req.department || 'Student'}) submitted a ${req.leaveType} request.`,
            'info'
          );
        }
        return next;
      });

      // 2. Synchronize to MongoDB backend API so teachers on laptop/other devices receive it
      fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq),
      }).catch((err) => {
        console.warn('Backend MongoDB sync:', err);
      });

      toast('success', 'Leave application submitted successfully');
    },
    [update, toast]
  );

  const decideLeave = useCallback(
    (id: string, approved: boolean, note: string) => {
      const decider = currentUser?.name ?? 'Reviewer';

      update((d) => {
        const req = d.leaveRequests.find((r) => r.id === id);
        if (!req) return d;
        let status = req.status;
        let teacherApproved = req.teacherApproved;
        let hodApproved = req.hodApproved;

        if (currentUser?.role === 'teacher') {
          teacherApproved = approved;
          if (!approved) status = 'rejected';
          else if (req.hodApproved) status = 'approved';
          else status = 'pending';
        } else if (currentUser?.role === 'hod') {
          hodApproved = approved;
          if (!approved) status = 'rejected';
          else if (teacherApproved) status = 'approved';
          else status = 'pending';
        }

        const updatedReq: LeaveRequest = {
          ...req,
          status,
          teacherApproved,
          hodApproved,
          decidedBy: decider,
          decidedAt: isoHoursFromNow(0),
          decisionNote: note || undefined,
        };
        const next = {
          ...d,
          leaveRequests: d.leaveRequests.map((r) => (r.id === id ? updatedReq : r)),
        };
        const msg = approved
          ? `Your ${req.leaveType} request has been ${
              status === 'approved' ? 'approved' : 'partially approved'
            } by ${decider}.`
          : `Your ${req.leaveType} request has been rejected by ${decider}.`;
        return addNotification(
          next,
          req.studentId,
          `Leave ${status === 'rejected' ? 'Rejected' : 'Updated'}`,
          msg,
          approved ? 'success' : 'error'
        );
      });

      // Synchronize decision to MongoDB
      fetch(`/api/leaves/${id}/decide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          note,
          role: currentUser?.role,
          deciderName: decider,
        }),
      }).catch((err) => {
        console.warn('Backend MongoDB decide sync:', err);
      });

      toast(approved ? 'success' : 'info', `Request ${approved ? 'approved' : 'rejected'}`);
    },
    [update, currentUser, toast]
  );

  // Green Card
  const addSlot = useCallback(
    (slot: Omit<GreenCardSlot, 'id' | 'bookedIds'>) => {
      update((d) => ({
        ...d,
        greenCardSlots: [...d.greenCardSlots, { ...slot, id: uid('gc'), bookedIds: [] }],
      }));
      toast('success', 'Green Card slot added');
    },
    [update, toast]
  );

  const updateSlot = useCallback(
    (id: string, updates: Partial<GreenCardSlot>) => {
      update((d) => ({
        ...d,
        greenCardSlots: d.greenCardSlots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
      toast('success', 'Slot updated');
    },
    [update, toast]
  );

  const deleteSlot = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        greenCardSlots: d.greenCardSlots.filter((s) => s.id !== id),
        bookings: d.bookings.filter((b) => b.slotId !== id),
      }));
      toast('info', 'Slot deleted');
    },
    [update, toast]
  );

  const bookSlot = useCallback(
    (slotId: string) => {
      if (!currentUser) return;
      update((d) => {
        const slot = d.greenCardSlots.find((s) => s.id === slotId);
        if (!slot) return d;
        if (slot.bookedIds.includes(currentUser.id)) return d;
        if (slot.bookedIds.length >= slot.capacity) return d;
        const booking: Booking = {
          id: uid('bk'),
          slotId,
          studentId: currentUser.id,
          studentName: currentUser.name,
          bookedAt: isoHoursFromNow(0),
        };
        return {
          ...d,
          greenCardSlots: d.greenCardSlots.map((s) =>
            s.id === slotId ? { ...s, bookedIds: [...s.bookedIds, currentUser.id] } : s
          ),
          bookings: [booking, ...d.bookings],
        };
      });
      toast('success', 'Slot booked successfully');
    },
    [currentUser, update, toast]
  );

  const cancelBooking = useCallback(
    (slotId: string) => {
      if (!currentUser) return;
      update((d) => ({
        ...d,
        greenCardSlots: d.greenCardSlots.map((s) =>
          s.id === slotId ? { ...s, bookedIds: s.bookedIds.filter((id) => id !== currentUser.id) } : s
        ),
        bookings: d.bookings.filter((b) => !(b.slotId === slotId && b.studentId === currentUser.id)),
      }));
      toast('info', 'Booking cancelled');
    },
    [currentUser, update, toast]
  );

  // Classrooms
  const addClassroom = useCallback(
    (c: Omit<Classroom, 'id'>) => {
      update((d) => ({ ...d, classrooms: [...d.classrooms, { ...c, id: uid('rm') }] }));
      toast('success', 'Classroom added');
    },
    [update, toast]
  );

  const updateClassroom = useCallback(
    (id: string, updates: Partial<Classroom>) => {
      update((d) => ({
        ...d,
        classrooms: d.classrooms.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
      toast('success', 'Classroom updated');
    },
    [update, toast]
  );

  const deleteClassroom = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        classrooms: d.classrooms.filter((c) => c.id !== id),
        classroomSchedules: d.classroomSchedules.filter((s) => s.classroomId !== id),
      }));
      toast('info', 'Classroom deleted');
    },
    [update, toast]
  );

  const addSchedule = useCallback(
    (s: Omit<ClassroomSchedule, 'id'>) => {
      update((d) => ({
        ...d,
        classroomSchedules: [...d.classroomSchedules, { ...s, id: uid('sc') }],
      }));
      toast('success', 'Schedule added');
    },
    [update, toast]
  );

  const deleteSchedule = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        classroomSchedules: d.classroomSchedules.filter((s) => s.id !== id),
      }));
      toast('info', 'Schedule removed');
    },
    [update, toast]
  );

  // Users
  const addUser = useCallback(
    (u: Omit<User, 'id'>) => {
      const newUser: User = {
        ...u,
        id: uid('u'),
        accountStatus: u.accountStatus || 'active',
        createdAt: u.createdAt || isoHoursFromNow(0),
        isDemo: false,
      };
      update((d) => ({ ...d, users: [...d.users, newUser] }));
      toast('success', 'User added');
    },
    [update, toast]
  );

  const updateUser = useCallback(
    (id: string, updates: Partial<User>) => {
      update((d) => ({
        ...d,
        users: d.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      }));
      toast('success', 'User updated');
    },
    [update, toast]
  );

  const deleteUser = useCallback(
    (id: string) => {
      update((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));
      toast('info', 'User deleted');
    },
    [update, toast]
  );

  // Notifications
  const markNotificationRead = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    [update]
  );

  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    update((d) => ({
      ...d,
      notifications: d.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n
      ),
    }));
    toast('success', 'All notifications marked as read');
  }, [currentUser, update, toast]);

  const resetAllData = useCallback(() => {
    const fresh = resetData();
    clearCredentials();
    ensureCredentialsExist(fresh.users);
    setData(fresh);
    clearSession();
    setCurrentUser(null);
    toast('info', 'All data has been reset to defaults');
  }, [toast]);

  function clearCredentials() {
    localStorage.removeItem('leaveease_auth_credentials_v1');
  }

  const value: AppContextValue = {
    currentUser,
    login,
    loginAsUser,
    logout,
    authenticateUser,
    registerStudent,
    registerTeacher,
    requestPasswordReset,
    resetPassword,
    verifyUserAccount,
    createAdminUser,
    page,
    setPage,
    data,
    toasts,
    toast,
    dismissToast,
    addLeaveRequest,
    decideLeave,
    addSlot,
    updateSlot,
    deleteSlot,
    bookSlot,
    cancelBooking,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addSchedule,
    deleteSchedule,
    addUser,
    updateUser,
    deleteUser,
    markNotificationRead,
    markAllRead,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
