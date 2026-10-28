import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Role } from '@/types';
import { DEMO_ACCOUNTS } from '@/lib/auth';
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info,
  KeyRound,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePageProps {
  onSelectRole: (role: Role) => void;
}

const roleCards: {
  role: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
}[] = [
  {
    role: 'student',
    label: 'Student',
    description: 'Apply for leave and track leave request status.',
    icon: <Users size={26} />,
    color: 'border-navy-200 hover:border-navy-400 hover:bg-navy-50/50',
    badge: 'Self-Registration Allowed',
  },
  {
    role: 'teacher',
    label: 'Teacher',
    description: 'Review and approve or reject student leave requests.',
    icon: <BookOpen size={26} />,
    color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/40',
    badge: 'Faculty Verification Required',
  },
  {
    role: 'hod',
    label: 'HOD',
    description: 'Provide final approval for leave requests in the department.',
    icon: <Building2 size={26} />,
    color: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40',
    badge: 'Admin Provisioned',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Manage users, slots, classrooms, and reports.',
    icon: <ShieldCheck size={26} />,
    color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/40',
    badge: 'Institutional Control',
  },
];

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  const { data, loginAsUser } = useApp();
  const [showDemoSection, setShowDemoSection] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-4 shadow-lg ring-1 ring-white/20">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            LeaveEase
          </h1>
          <p className="mt-2 text-navy-200 font-medium max-w-xl mx-auto text-sm sm:text-base">
            College Leave, Green Card & Classroom Availability Management System
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-navy-200 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Institutional Role-Based Access Control
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main Role Selection Panel */}
          <div className="lg:col-span-7 rounded-2xl bg-white p-6 shadow-2xl sm:p-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Select Your Portal</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose your college role to sign in or register
                </p>
              </div>
              <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                4 Roles
              </span>
            </div>

            {/* Role Cards */}
            <div className="mt-6 space-y-3.5">
              {roleCards.map(({ role, label, description, icon, color, badge }) => (
                <button
                  key={role}
                  id={`role-btn-${role}`}
                  onClick={() => onSelectRole(role)}
                  className={cn(
                    'group flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
                    color
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800 transition group-hover:scale-105 group-hover:bg-navy-100">
                      {icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-navy-900 group-hover:text-navy-700">
                          {label}
                        </h3>
                        <span className="hidden sm:inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-gray-500 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-navy-500 transition group-hover:translate-x-1 group-hover:bg-navy-800 group-hover:text-white">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ))}
            </div>

            {/* College Demo Mode Presentation Helper Toggle */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <button
                type="button"
                id="toggle-demo-accounts-btn"
                onClick={() => setShowDemoSection(!showDemoSection)}
                className="flex w-full items-center justify-between rounded-xl border border-navy-100 bg-navy-50/60 p-3.5 text-left transition hover:bg-navy-100/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-900">
                      Explore Demo Mode / Presentation Accounts
                    </span>
                    <p className="text-xs text-navy-600">
                      Quick-fill or instant sign-in for faculty evaluations
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    'text-navy-700 transition duration-200',
                    showDemoSection && 'rotate-180'
                  )}
                />
              </button>

              {/* Demo Accounts Expanded */}
              {showDemoSection && (
                <div className="mt-3 space-y-2.5 rounded-xl border border-gray-200 bg-gray-50 p-3.5 animate-slide-up">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Sample Evaluation Accounts:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DEMO_ACCOUNTS.map((acc) => {
                      const user = data.users.find((u) => u.email === acc.email);
                      return (
                        <div
                          key={acc.role}
                          className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-navy-700">
                                {acc.role}
                              </span>
                              <span className="rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-mono text-navy-600">
                                {acc.password}
                              </span>
                            </div>
                            <p className="mt-1 font-semibold text-sm text-gray-800">{acc.name}</p>
                            <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                            <p className="text-[11px] text-gray-400">ID: {acc.collegeId}</p>
                          </div>
                          <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => onSelectRole(acc.role)}
                              className="flex-1 rounded-md border border-navy-200 px-2 py-1 text-center text-xs font-medium text-navy-700 hover:bg-navy-50"
                            >
                              Go to Login
                            </button>
                            {user && (
                              <button
                                type="button"
                                onClick={() => loginAsUser(user.id)}
                                className="flex-1 rounded-md bg-navy-800 px-2 py-1 text-center text-xs font-medium text-white hover:bg-navy-900"
                              >
                                Instant Demo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About / Info Side Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-white/10 backdrop-blur-md p-6 text-white sm:p-8 border border-white/10 shadow-2xl animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-400/20 text-navy-200">
                  <KeyRound size={16} />
                </span>
                <h2 className="text-lg font-bold">Institutional Security</h2>
              </div>
              <p className="mt-2.5 text-xs sm:text-sm text-navy-200 leading-relaxed">
                LeaveEase features a multi-tiered authorization workflow ensuring strict separation of privileges:
              </p>

              <div className="mt-5 space-y-3.5">
                <div className="flex gap-3 text-xs sm:text-sm text-navy-100">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Student Registration:</strong> Verified via college ID & registered college email with immediate student access.
                  </div>
                </div>

                <div className="flex gap-3 text-xs sm:text-sm text-navy-100">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Faculty Reviewers:</strong> Requires department verification code or college administrator activation.
                  </div>
                </div>

                <div className="flex gap-3 text-xs sm:text-sm text-navy-100">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    3
                  </div>
                  <div>
                    <strong className="text-white">HOD Authority:</strong> Strictly administrator-provisioned. No public sign-up allowed to protect final approval integrity.
                  </div>
                </div>

                <div className="flex gap-3 text-xs sm:text-sm text-navy-100">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                    4
                  </div>
                  <div>
                    <strong className="text-white">Two-Stage Approval:</strong> Teacher initial recommendation → HOD final departmental authorization.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/10 p-3.5 border border-white/10">
                <Info size={18} className="shrink-0 text-navy-300 mt-0.5" />
                <p className="text-xs text-navy-200 leading-relaxed">
                  Passwords are protected using client-side salted SHA-256 cryptographic hashing. Production-ready Supabase RLS migrations are included.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center pt-5 border-t border-white/10">
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-xl font-bold">{data.users.length}</p>
                <p className="text-[11px] text-navy-300">Users</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-xl font-bold">{data.classrooms.length}</p>
                <p className="text-[11px] text-navy-300">Classrooms</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-xl font-bold">{data.greenCardSlots.length}</p>
                <p className="text-[11px] text-navy-300">GC Slots</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-navy-400">
          LeaveEase · College Management Demonstration System · Academic Project
        </p>
      </div>
    </div>
  );
}
