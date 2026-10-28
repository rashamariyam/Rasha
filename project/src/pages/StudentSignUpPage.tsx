import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import {
  GraduationCap,
  Users,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Building,
  BookOpen,
  Phone,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface StudentSignUpPageProps {
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

const programs = [
  'B.Tech',
  'B.E.',
  'BCA',
  'MCA',
  'M.Tech',
  'B.Sc Computer Science',
];

export function StudentSignUpPage({ onNavigate }: StudentSignUpPageProps) {
  const { registerStudent } = useApp();

  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNo: '',
    department: 'Computer Science',
    course: 'B.Tech',
    semester: 1,
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.rollNo.trim()) {
      errs.rollNo = 'Student ID or Register Number is required';
    } else if (form.rollNo.trim().length < 3) {
      errs.rollNo = 'Student ID must be at least 3 characters';
    }

    if (!form.department) errs.department = 'Department is required';
    if (!form.course) errs.course = 'Course or program is required';

    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!form.terms) {
      errs.terms = 'You must accept the college terms and academic policy';
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
      const res = await registerStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        rollNo: form.rollNo.trim().toUpperCase(),
        department: form.department,
        course: `${form.course} ${form.department}`,
        semester: Number(form.semester),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });

      if (!res.success) {
        setGlobalError(res.error || 'Failed to create student account.');
      } else {
        // Redirection will occur via App.tsx reactive state or navigation
        onNavigate('/student/dashboard');
      }
    } catch {
      setGlobalError('An unexpected server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Navigation Bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            id="signup-back-btn"
            onClick={() => onNavigate('/login/student')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Student Login</span>
          </button>
          <span className="rounded-full bg-navy-50/20 border border-white/10 px-3 py-1 text-xs font-semibold text-white">
            Student Registration
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-2xl border border-gray-100">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
              <Users size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-950">Create Student Account</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Register to manage your leave requests, attendance, and study slots
              </p>
            </div>
          </div>

          {globalError && (
            <div
              id="student-signup-error-alert"
              className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-slide-up"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <p>{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Full Name & Roll Number */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="student-name-input"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Student ID / Register No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="student-rollno-input"
                    type="text"
                    required
                    value={form.rollNo}
                    onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                    placeholder="e.g. CS23B045"
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
                  College Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="student-email-input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. arjun@college.edu"
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
                    id="student-phone-input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </div>
            </div>

            {/* Department, Course, Semester */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="student-department-select"
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
                  Program / Degree <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="student-course-select"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100 cursor-pointer"
                  >
                    {programs.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Current Semester <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    id="student-semester-select"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                    id="student-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
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
                    id="student-confirmpassword-input"
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

            {/* Terms and conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  id="student-terms-checkbox"
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy-800 focus:ring-navy-500"
                />
                <span className="text-xs text-gray-600">
                  I agree to the college LeaveEase Terms of Service, Attendance Regulations, and declare that the information provided is accurate and authentic.
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
            </div>

            <button
              id="student-signup-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3 text-sm font-bold text-white shadow-md transition hover:bg-navy-900 active:bg-navy-950 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating Student Account...
                </span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Create Student Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                id="link-go-to-student-login"
                onClick={() => onNavigate('/login/student')}
                className="font-bold text-navy-800 hover:text-navy-950 hover:underline cursor-pointer"
              >
                Sign In to Student Portal
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
