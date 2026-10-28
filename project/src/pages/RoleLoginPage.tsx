import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Role } from '@/types';
import { DEMO_ACCOUNTS, DEMO_PASSWORDS } from '@/lib/auth';
import {
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleLoginPageProps {
  role: Role;
  onNavigate: (route: string) => void;
}

const roleMeta: Record<
  Role,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    badgeBg: string;
    idPlaceholder: string;
    idLabel: string;
    description: string;
    demoAccountEmail: string;
  }
> = {
  student: {
    title: 'Student Portal',
    subtitle: 'Sign in to apply for leaves, track approvals & book Green Card slots',
    icon: <Users size={28} className="text-navy-700" />,
    color: 'border-navy-300 ring-navy-400',
    badgeBg: 'bg-navy-50 text-navy-800 border-navy-200',
    idPlaceholder: 'arjun@college.edu or CS21B001',
    idLabel: 'College Email or Student ID (Roll No)',
    description: 'Students can submit leave requests with document uploads, monitor multi-tier reviews, and book study slots.',
    demoAccountEmail: 'arjun@college.edu',
  },
  teacher: {
    title: 'Faculty / Teacher Portal',
    subtitle: 'Sign in to review and verify student leave requests',
    icon: <BookOpen size={28} className="text-blue-700" />,
    color: 'border-blue-300 ring-blue-400',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    idPlaceholder: 'anitha@college.edu or TCH-CS-01',
    idLabel: 'Official College Email or Faculty ID',
    description: 'Teachers review initial student leave requests for their department before forwarding to HOD for final approval.',
    demoAccountEmail: 'anitha@college.edu',
  },
  hod: {
    title: 'Head of Department (HOD) Portal',
    subtitle: 'Sign in to grant departmental final authorization on leave requests',
    icon: <Building2 size={28} className="text-emerald-700" />,
    color: 'border-emerald-300 ring-emerald-400',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    idPlaceholder: 'rajesh@college.edu or HOD-CS-01',
    idLabel: 'Official College Email or HOD ID',
    description: 'Department heads provide final decision and commentary on verified teacher-reviewed applications.',
    demoAccountEmail: 'rajesh@college.edu',
  },
  admin: {
    title: 'Administrator Portal',
    subtitle: 'Sign in to manage college users, study slots, classrooms & audits',
    icon: <ShieldCheck size={28} className="text-amber-700" />,
    color: 'border-amber-300 ring-amber-400',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    idPlaceholder: 'admin@college.edu or ADM-001',
    idLabel: 'Administrator Email or Admin ID',
    description: 'College admins manage users, provision HOD accounts, activate faculty accounts, and export CSV reports.',
    demoAccountEmail: 'admin@college.edu',
  },
};

export function RoleLoginPage({ role, onNavigate }: RoleLoginPageProps) {
  const { authenticateUser, loginAsUser, data } = useApp();
  const meta = roleMeta[role];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoInfo = DEMO_ACCOUNTS.find((a) => a.role === role);
  const demoUser = data.users.find((u) => u.email === meta.demoAccountEmail);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your college email address or ID.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateUser(identifier, password, role, rememberMe);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    if (demoInfo) {
      setIdentifier(demoInfo.email);
      setPassword(demoInfo.password);
      setError(null);
    }
  };

  const handleInstantDemo = () => {
    if (demoUser) {
      loginAsUser(demoUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Top Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            id="back-to-roles-btn"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Role Selection</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={cn('rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider', meta.badgeBg)}>
              {role.toUpperCase()} ACCESS
            </span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="grid gap-0 overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-12 border border-gray-100">
          {/* Left Branded Role Context Panel */}
          <div className="lg:col-span-5 bg-navy-900 p-6 sm:p-8 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-navy-800">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <GraduationCap size={26} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">LeaveEase</h1>
                  <p className="text-xs text-navy-300">College Management Portal</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white mb-3">
                  {meta.icon}
                </div>
                <h2 className="text-xl font-bold text-white">{meta.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-navy-200 leading-relaxed">
                  {meta.description}
                </p>
              </div>

              <div className="mt-6 space-y-2 text-xs text-navy-200">
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Role-specific access controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Encrypted credential verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Secure session state management</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Box for Presentation */}
            {demoInfo && (
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                      Sample Demo Account
                    </span>
                  </div>
                  <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-navy-200">
                    Presentation
                  </span>
                </div>
                <p className="text-xs font-medium text-white">{demoInfo.name}</p>
                <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-navy-300 font-mono">
                  <span>ID/Email: {demoInfo.email}</span>
                  <span>Password: {demoInfo.password}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 py-1.5 text-center text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    Auto-Fill
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantDemo}
                    className="flex-1 rounded-lg bg-navy-600 py-1.5 text-center text-xs font-medium text-white transition hover:bg-navy-500 shadow-sm"
                  >
                    Quick Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Login Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy-950">Welcome Back</h2>
              <p className="mt-1 text-sm text-gray-500">{meta.subtitle}</p>
            </div>

            {error && (
              <div
                id="login-error-alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 animate-slide-up"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                <p className="leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  {meta.idLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={meta.idPlaceholder}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    className="text-xs font-semibold text-navy-700 hover:text-navy-900 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500"
                  />
                  <span className="text-xs text-gray-600 font-medium">Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-900 active:bg-navy-950 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In as {role.toUpperCase()}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Role-Specific Sign-Up / Access Footer Notice */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              {role === 'student' && (
                <p className="text-xs text-gray-600">
                  Don't have a student account?{' '}
                  <button
                    type="button"
                    id="link-create-student-account"
                    onClick={() => onNavigate('/signup/student')}
                    className="font-bold text-navy-800 hover:text-navy-950 hover:underline cursor-pointer"
                  >
                    Create Student Account
                  </button>
                </p>
              )}

              {role === 'teacher' && (
                <div className="flex items-start justify-center gap-2 rounded-lg bg-gray-50 p-3 text-left">
                  <ShieldAlert size={16} className="shrink-0 text-gray-500 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Faculty Access Restricted:</strong> Teacher accounts are provisioned exclusively by authorized College Administrators. Contact the admin office to request access.
                  </p>
                </div>
              )}

              {role === 'hod' && (
                <div className="flex items-start justify-center gap-2 rounded-lg bg-gray-50 p-3 text-left">
                  <ShieldAlert size={16} className="shrink-0 text-gray-500 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>HOD Registration Restricted:</strong> Head of Department accounts are provisioned exclusively by authorized College Administrators. Contact the admin office for access.
                  </p>
                </div>
              )}

              {role === 'admin' && (
                <div className="flex items-start justify-center gap-2 rounded-lg bg-gray-50 p-3 text-left">
                  <ShieldAlert size={16} className="shrink-0 text-gray-500 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Administrative Security:</strong> Administrator accounts are initialized through secure institutional configuration. Public self-registration is disabled.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
