import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import {
  BookOpen,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Building,
  Phone,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface TeacherSignUpPageProps {
  onNavigate: (route: string) => void;
}

const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
];

export function TeacherSignUpPage({ onNavigate }: TeacherSignUpPageProps) {
  const { registerTeacher } = useApp();

  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: 'Computer Science',
    phone: '',
    inviteCode: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<'pending' | 'active' | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Official college email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.rollNo.trim()) {
      errs.rollNo = 'Faculty / Employee ID is required';
    }

    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerTeacher({
        name: form.name.trim(),
        email: form.email.trim(),
        rollNo: form.rollNo.trim().toUpperCase(),
        department: form.department,
        phone: form.phone.trim() || undefined,
        password: form.password,
        inviteCode: form.inviteCode.trim() || undefined,
      });

      if (!res.success) {
        setGlobalError(res.error || 'Failed to register faculty account.');
      } else {
        setSubmittedStatus(res.status);
      }
    } catch {
      setGlobalError('An unexpected server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
            <Clock size={36} />
          </div>
          <h2 className="text-2xl font-bold text-navy-950">Registration Submitted</h2>
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Awaiting Administrator Verification
          </span>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Your faculty registration for <strong>{form.name}</strong> ({form.department}) has been recorded. To protect the integrity of student leave approvals, your account must be verified by a college administrator before access is granted.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-xs text-gray-600 space-y-1.5">
            <p><strong>Employee ID:</strong> {form.rollNo.toUpperCase()}</p>
            <p><strong>Official Email:</strong> {form.email}</p>
            <p><strong>Status:</strong> <span className="text-amber-600 font-semibold">Pending Admin Review</span></p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/login/teacher')}
              className="flex-1 rounded-xl bg-navy-800 py-2.5 text-sm font-bold text-white transition hover:bg-navy-900"
            >
              Go to Teacher Login
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Role Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Navigation Bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            id="teacher-signup-back-btn"
            onClick={() => onNavigate('/login/teacher')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Teacher Login</span>
          </button>
          <span className="rounded-full bg-blue-50/20 border border-white/10 px-3 py-1 text-xs font-semibold text-white">
            Faculty Registration
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-2xl border border-gray-100">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              <BookOpen size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-950">Faculty / Teacher Registration</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Register as a faculty member to review and verify student leave applications
              </p>
            </div>
          </div>

          {globalError && (
            <div
              id="teacher-signup-error-alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-slide-up"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <p>{globalError}</p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900">
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 text-blue-700 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Institutional Policy:</strong> Newly registered teachers require administrator verification before leave approval access is unlocked. If you possess a department invitation code, enter it below for instant activation.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Full Name & Employee ID */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-name-input"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dr. Anitha Rao"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Teacher ID / Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-empid-input"
                    type="text"
                    required
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                    placeholder="e.g. TCH-CS-05"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100 uppercase"
                  />
                </div>
                {errors.rollNo && <p className="mt-1 text-xs text-red-500">{errors.rollNo}</p>}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Official College Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-email-input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. anitha@college.edu"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-phone-input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 9876543213"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </div>
            </div>

            {/* Department & Verification Code */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Academic Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="teacher-department-select"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Department Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-code-input"
                    type="text"
                    value={form.inviteCode}
                    onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                    placeholder="Enter code (or leave blank for admin review)"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Demo code: <span className="font-mono font-semibold text-navy-700">FACULTY2025</span>
                </p>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Password (min. 6 characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create your password"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="teacher-confirmpassword-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              id="teacher-signup-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-900 active:bg-navy-950 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting Registration...
                </span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Register Faculty Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Already registered as faculty?{' '}
              <button
                type="button"
                id="link-go-to-teacher-login"
                onClick={() => onNavigate('/login/teacher')}
                className="font-bold text-navy-800 hover:text-navy-950 hover:underline cursor-pointer"
              >
                Sign In to Faculty Portal
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
