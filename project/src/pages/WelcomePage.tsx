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
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  Lock,
  Layers,
  Activity,
  Award,
  Zap,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePageProps {
  onSelectRole: (role: Role) => void;
}

const roleCards: {
  role: Role;
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  themeColor: string;
  borderColor: string;
  buttonClass: string;
}[] = [
  {
    role: 'student',
    label: 'Student Portal',
    badge: 'Self-Registration',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Submit leave applications, track multi-level approvals in real-time, and reserve Green Card study slots.',
    features: [
      'Digital leave request with document attachments',
      'Live two-stage approval progress tracker',
      'Instant Green Card study & lab slot booking',
      'Real-time vacant classroom locator',
    ],
    icon: <Users className="h-6 w-6 text-blue-600" />,
    themeColor: 'from-blue-500/10 to-indigo-500/5',
    borderColor: 'border-blue-200 hover:border-blue-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    role: 'teacher',
    label: 'Faculty Portal',
    badge: 'Faculty Verified',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Review departmental student leave applications, evaluate attendance context, and submit mentor recommendations.',
    features: [
      'Multi-student leave scrutiny & recommendation',
      'Student attendance verification notes',
      'Automatic forwarding to HOD final desk',
      'Departmental noticeboard dispatch',
    ],
    icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
    themeColor: 'from-indigo-500/10 to-purple-500/5',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  {
    role: 'hod',
    label: 'HOD Executive Portal',
    badge: 'Executive Authorization',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Final institutional authority to authorize leaves, manage departmental schedules, and issue digital gate-passes.',
    features: [
      'Final approval/rejection with official remarks',
      'Department-wide leave & attendance analytics',
      'Instant digital leave certificate dispatch',
      'Strict administrator-provisioned security',
    ],
    icon: <Building2 className="h-6 w-6 text-emerald-600" />,
    themeColor: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    role: 'admin',
    label: 'Campus Administration',
    badge: 'Full Governance',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Comprehensive college control: provision users, configure classrooms, manage slot capacities, and export audits.',
    features: [
      'Complete student & faculty user management',
      'Smart classroom schedules & capacity setup',
      'Green Card slot availability management',
      'One-click CSV compliance & audit downloads',
    ],
    icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
    themeColor: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-200 hover:border-amber-400',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
];

const platformFeatures = [
  {
    icon: <Layers className="h-6 w-6 text-blue-500" />,
    title: 'Two-Stage Approval Pipeline',
    description: 'Structured two-tier scrutiny: Class Teacher/Mentor first verification followed by official HOD departmental sanction.',
  },
  {
    icon: <Calendar className="h-6 w-6 text-emerald-500" />,
    title: 'Green Card Study Booking',
    description: 'Reserve dedicated library desks, research labs, and seminar halls with real-time seat tracking and immediate digital passes.',
  },
  {
    icon: <Clock className="h-6 w-6 text-purple-500" />,
    title: 'Live Classroom Availability',
    description: 'Instant visualization of room occupancy across academic blocks to find free classrooms for study sessions or extra lectures.',
  },
  {
    icon: <Lock className="h-6 w-6 text-indigo-500" />,
    title: 'Cryptographic Role Security',
    description: 'Salted cryptographic authentication, verified college IDs, and role separation to protect academic integrity.',
  },
  {
    icon: <Zap className="h-6 w-6 text-amber-500" />,
    title: 'Real-Time Notifications',
    description: 'Instant status dispatches across all stages of application processing with detailed reviewer feedback.',
  },
  {
    icon: <FileText className="h-6 w-6 text-teal-500" />,
    title: 'Audit & Compliance Reports',
    description: 'One-click departmental exports for leave histories, room utilization metrics, and accreditation reporting in standard CSV.',
  },
];

export function WelcomePage({ onSelectRole }: WelcomePageProps) {
  const { data, loginAsUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Institutional Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">LeaveEase</span>
                <span className="hidden sm:inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                  Campus v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Integrated College Management System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('portals')}
              className="transition hover:text-white cursor-pointer"
            >
              Portals
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="transition hover:text-white cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="transition hover:text-white cursor-pointer"
            >
              Approval Flow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="transition hover:text-white cursor-pointer"
            >
              Security
            </button>
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Demo Accounts
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('portals')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500 cursor-pointer"
            >
              Select Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-800 bg-slate-950 p-4 sm:hidden animate-fade-in space-y-3">
            <button
              onClick={() => scrollToSection('portals')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Portals
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Approval Workflow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Institutional Security
            </button>
            <div className="pt-2 flex flex-col gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Demo Accounts
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('portals')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white"
              >
                Access Portals
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 sm:py-24 border-b border-slate-800/50">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-xs mb-6 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Institutional Smart Campus & Leave Governance
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight sm:leading-none">
            Empowering Higher Education with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Smart Campus Automation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            A unified, role-based platform designed for modern collegiate administration. Featuring a verified two-stage student leave approval pipeline, Green Card study reservations, and real-time smart classroom availability.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('portals')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-102 cursor-pointer"
            >
              Select Your Portal
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white hover:scale-102 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Quick Demo Access
            </button>
          </div>

          {/* Dynamic Metrics Ribbon */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{data?.users?.length ?? 8}</p>
              <p className="text-xs text-slate-400 mt-1">Verified Users</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{data?.classrooms?.length ?? 6}</p>
              <p className="text-xs text-slate-400 mt-1">Smart Classrooms</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">{data?.greenCardSlots?.length ?? 4}</p>
              <p className="text-xs text-slate-400 mt-1">Green Card Slots</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Digital Paperless Flow</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Portals Section */}
      <section id="portals" className="py-20 bg-slate-950 relative scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Role-Based Access</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Dedicated Portals for Every Campus Stakeholder
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Select your designated academic role to access your tailored dashboard, approvals, or student services.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map(({ role, label, badge, badgeColor, description, features, icon, themeColor, borderColor, buttonClass }) => (
              <div
                key={role}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border bg-gradient-to-b p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                  'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                )}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 shadow-xs">
                      {icon}
                    </div>
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', badgeColor)}>
                      {badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">{label}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[42px]">
                    {description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-800 pt-4">
                    {features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="mt-8 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    id={`portal-btn-${role}`}
                    onClick={() => onSelectRole(role)}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold shadow-md transition cursor-pointer',
                      buttonClass
                    )}
                  >
                    <span>Launch {label.split(' ')[0]} Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-900 border-t border-b border-slate-800/80 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Rigorous Governance</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Transparent Two-Stage Leave Verification
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Eliminates fraudulent slips and verbal permissions through a timestamped, cryptographically audited digital approval chain.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold text-sm border border-blue-500/30 mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white">1. Student Application</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                The student submits an official leave request specifying leave dates, category (medical, academic, personal), and supporting attachments.
              </p>
              <div className="mt-4 rounded-lg bg-slate-900 p-2.5 text-[11px] text-blue-300 font-mono">
                Status: Pending Teacher Review
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30 mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white">2. Faculty Scrutiny</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                The designated class teacher/mentor verifies current attendance percentages, checks conflicting exams, and writes their recommendation note.
              </p>
              <div className="mt-4 rounded-lg bg-slate-900 p-2.5 text-[11px] text-indigo-300 font-mono">
                Status: Teacher Recommended ➔ Escalated
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm border border-emerald-500/30 mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white">3. HOD Final Sanction</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                The Head of Department reviews the faculty evaluation and issues official digital authorization. A verified gate-pass QR/code is generated.
              </p>
              <div className="mt-4 rounded-lg bg-slate-900 p-2.5 text-[11px] text-emerald-300 font-mono">
                Status: Approved & Stamped
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Platform Features Grid */}
      <section id="features" className="py-20 bg-slate-950 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Full Capabilities</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Complete Campus Resource Ecosystem
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Beyond leave processing, LeaveEase coordinates study spaces and lecture halls into one synchronized college dashboard.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition duration-200 hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Institutional Security Section */}
      <section id="security" className="py-16 bg-gradient-to-br from-slate-900 to-slate-950 border-t border-slate-800 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between shadow-2xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-4">
                <ShieldCheck className="h-4 w-4" />
                Institutional Data Protection
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Built With Enterprise Academic Standards
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Passwords use client-side salted SHA-256 cryptographic hashing. Public registration is strictly restricted for executive roles, and all administrative updates generate timestamped audit records.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Department-segmented databases
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Exportable CSV compliance logs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Supabase RLS compatibility
                </span>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer text-center"
              >
                Inspect Sample Roles
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('portals')}
                className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 cursor-pointer text-center"
              >
                Open Portal Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Institutional Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">LeaveEase System</p>
              <p className="text-[11px] text-slate-500">College Leave & Resource Automation</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <button onClick={() => scrollToSection('portals')} className="hover:text-white transition">Portals</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-white transition">Approval Flow</button>
            <button onClick={() => setDemoModalOpen(true)} className="hover:text-white transition">Demo Credentials</button>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            All Academic Nodes Operational
          </div>
        </div>
      </footer>

      {/* 8. Demo Accounts Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Demo & Evaluation Accounts</h3>
                  <p className="text-xs text-slate-400">Test every campus journey with 1-click instant sign in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const user = data?.users ? data.users.find((u) => u.email === acc.email) : undefined;
                return (
                  <div
                    key={acc.role}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          {acc.role}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                          {acc.password}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-sm text-white">{acc.name}</p>
                      <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                      <p className="text-[11px] text-slate-500">College ID: {acc.collegeId}</p>
                    </div>

                    <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setDemoModalOpen(false);
                          onSelectRole(acc.role);
                        }}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
                      >
                        Go to Login
                      </button>
                      {user && (
                        <button
                          type="button"
                          onClick={() => {
                            setDemoModalOpen(false);
                            loginAsUser(user.id);
                          }}
                          className="flex-1 rounded-lg bg-blue-600 px-2 py-1.5 text-center text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                          Instant Demo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl bg-slate-950 p-3 text-xs text-slate-400 flex items-center justify-between border border-slate-800/60">
              <span>Passwords in demo accounts use client-side cryptographic evaluation hashes.</span>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="font-medium text-blue-400 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
