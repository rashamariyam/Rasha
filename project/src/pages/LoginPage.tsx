import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Role } from '@/types';
import { GraduationCap, Users, BookOpen, ShieldCheck, Building2, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig: { role: Role; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { role: 'student', label: 'Student', description: 'Apply for leaves, book Green Card slots, check classrooms', icon: <Users size={24} />, color: 'border-navy-200 hover:border-navy-400' },
  { role: 'teacher', label: 'Teacher', description: 'Review and approve/reject student leave requests', icon: <BookOpen size={24} />, color: 'border-blue-200 hover:border-blue-400' },
  { role: 'hod', label: 'HOD', description: 'Final approval stage for leave requests in your department', icon: <Building2 size={24} />, color: 'border-emerald-200 hover:border-emerald-400' },
  { role: 'admin', label: 'Admin', description: 'Manage users, slots, classrooms, and view reports', icon: <ShieldCheck size={24} />, color: 'border-amber-200 hover:border-amber-400' },
];

export function LoginPage() {
  const { login, data, loginAsUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const usersOfRole = (role: Role) => data.users.filter((u) => u.role === role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">LeaveEase</h1>
          <p className="mt-2 text-navy-300">College Leave, Green Card & Classroom Availability Management System</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Role selection */}
          <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-xl font-semibold text-navy-900">Choose a Demo Role</h2>
            <p className="mt-1 text-sm text-gray-500">Select a role to explore the dashboard. No password needed.</p>

            <div className="mt-6 space-y-3">
              {roleConfig.map(({ role, label, description, icon, color }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    'flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition',
                    color,
                    selectedRole === role && 'ring-2 ring-navy-400',
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">{label}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedRole && (
              <div className="mt-6 animate-fade-in">
                <p className="mb-3 text-sm font-medium text-gray-600">
                  Pick a demo user for <span className="capitalize text-navy-700 font-semibold">{selectedRole}</span>:
                </p>
                <div className="space-y-2">
                  {usersOfRole(selectedRole).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => loginAsUser(u.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-navy-300 hover:bg-navy-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-700">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.department}{u.rollNo ? ` · ${u.rollNo}` : ''}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-navy-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex flex-col justify-center rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white sm:p-8">
            <h2 className="text-xl font-semibold">About This Project</h2>
            <p className="mt-3 text-sm text-navy-200">
              LeaveEase is a college mini-project demonstration prototype that helps manage:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-navy-200">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">1</span>
                Student leave applications with multi-level approval (Teacher → HOD)
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">2</span>
                Green Card slot bookings with real-time seat availability
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">3</span>
                Classroom availability checking with schedule conflict detection
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">4</span>
                Admin management with CSV export and reporting
              </li>
            </ul>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/10 p-4">
              <Info size={20} className="shrink-0 text-navy-300" />
              <p className="text-xs text-navy-200">
                This is a college demonstration prototype. All data is stored locally in your browser using localStorage. No real authentication or backend is used.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{data.users.length}</p>
                <p className="text-xs text-navy-300">Demo Users</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{data.classrooms.length}</p>
                <p className="text-xs text-navy-300">Classrooms</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{data.greenCardSlots.length}</p>
                <p className="text-xs text-navy-300">Green Card Slots</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-navy-400">
          College Mini-Project Demo · Not for Production Use
        </p>
      </div>
    </div>
  );
}
