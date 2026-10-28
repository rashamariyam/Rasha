import type { User, AuthCredential, AuthSession } from '@/types';

const SESSION_STORAGE_KEY = 'leaveease_auth_session_v1';
const CREDENTIALS_STORAGE_KEY = 'leaveease_auth_credentials_v1';

/**
 * Securely hashes a password using browser Web Crypto API SHA-256 with a unique salt
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:leaveease_secure_pepper_2025`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically random hexadecimal salt
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies a plaintext password against a stored salt and hash
 */
export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === expectedHash;
}

/**
 * Default demo passwords for each role
 */
export const DEMO_PASSWORDS = {
  student: 'student123',
  teacher: 'teacher123',
  hod: 'hod123',
  admin: 'admin123',
} as const;

/**
 * Demo accounts reference list for presentation
 */
export interface DemoAccountInfo {
  role: 'student' | 'teacher' | 'hod' | 'admin';
  name: string;
  email: string;
  collegeId: string;
  department: string;
  password: string;
  title: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccountInfo[] = [
  {
    role: 'student',
    name: 'Arjun Sharma',
    email: 'arjun@college.edu',
    collegeId: 'CS21B001',
    department: 'Computer Science',
    password: DEMO_PASSWORDS.student,
    title: 'Student Account',
    description: 'Apply for leave, track requests, book study slots.',
  },
  {
    role: 'teacher',
    name: 'Dr. Anitha Rao',
    email: 'anitha@college.edu',
    collegeId: 'TCH-CS-01',
    department: 'Computer Science',
    password: DEMO_PASSWORDS.teacher,
    title: 'Faculty / Teacher Account',
    description: 'Review departmental student leave applications.',
  },
  {
    role: 'hod',
    name: 'Dr. Rajesh Nair',
    email: 'rajesh@college.edu',
    collegeId: 'HOD-CS-01',
    department: 'Computer Science',
    password: DEMO_PASSWORDS.hod,
    title: 'Head of Department (HOD)',
    description: 'Provide final approval on student leave requests.',
  },
  {
    role: 'admin',
    name: 'Admin Office',
    email: 'admin@college.edu',
    collegeId: 'ADM-001',
    department: 'Administration',
    password: DEMO_PASSWORDS.admin,
    title: 'Administrator Account',
    description: 'Manage users, create HODs, view audit reports.',
  },
];

/**
 * Load credentials store from localStorage
 */
export function loadCredentials(): AuthCredential[] {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthCredential[];
  } catch {
    // fallback
  }
  return [];
}

/**
 * Save credentials store to localStorage
 */
export function saveCredentials(creds: AuthCredential[]): void {
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(creds));
}

/**
 * Ensures credentials exist for all users in the system (seeds defaults if missing)
 */
export async function ensureCredentialsExist(users: User[]): Promise<void> {
  const existing = loadCredentials();
  const existingUserIds = new Set(existing.map((c) => c.userId));
  let modified = false;

  for (const user of users) {
    if (!existingUserIds.has(user.id)) {
      const defaultPassword = DEMO_PASSWORDS[user.role] || 'LeaveEase@2025';
      const salt = generateSalt();
      const passwordHash = await hashPassword(defaultPassword, salt);
      existing.push({
        userId: user.id,
        email: user.email.toLowerCase(),
        collegeId: user.rollNo,
        passwordHash,
        salt,
      });
      modified = true;
    }
  }

  if (modified) {
    saveCredentials(existing);
  }
}


/**
 * Persists an authenticated session
 */
export function saveSession(user: User, rememberMe: boolean): AuthSession {
  const token = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresDays = rememberMe ? 30 : 1;
  const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

  const session: AuthSession = {
    user,
    token,
    expiresAt,
    rememberMe,
  };

  const serialized = JSON.stringify(session);
  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  return session;
}

/**
 * Retrieves the currently active authenticated session
 */
export function loadSession(): AuthSession | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_STORAGE_KEY) ||
      localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clears the active session from both storage locations
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
