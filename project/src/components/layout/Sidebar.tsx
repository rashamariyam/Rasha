import { useApp } from '@/store/AppContext';
import type { Page, Role } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, ClipboardList, CalendarCheck,
  BookMarked, DoorOpen, Users, Bell, GraduationCap, LogOut,
  CheckSquare, Calendar,
} from 'lucide-react';

interface NavItem {
  page: Page;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['student', 'teacher', 'hod', 'admin'] },
  { page: 'apply-leave', label: 'Apply for Leave', icon: <FileText size={20} />, roles: ['student'] },
  { page: 'leave-history', label: 'Leave History', icon: <ClipboardList size={20} />, roles: ['student'] },
  { page: 'leave-approvals', label: 'Leave Approvals', icon: <CheckSquare size={20} />, roles: ['teacher', 'hod', 'admin'] },
  { page: 'green-card', label: 'Green Card Slots', icon: <CalendarCheck size={20} />, roles: ['student', 'admin'] },
  { page: 'my-bookings', label: 'My Bookings', icon: <BookMarked size={20} />, roles: ['student'] },
  { page: 'classroom', label: 'Classroom Availability', icon: <DoorOpen size={20} />, roles: ['student', 'teacher', 'hod', 'admin'] },
  { page: 'users', label: 'User Management', icon: <Users size={20} />, roles: ['admin'] },
  { page: 'notifications', label: 'Notifications', icon: <Bell size={20} />, roles: ['student', 'teacher', 'hod', 'admin'] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, page, setPage, logout, data } = useApp();
  if (!currentUser) return null;

  const items = navItems.filter((item) => item.roles.includes(currentUser.role));
  const unreadCount = data.notifications.filter((n) => n.userId === currentUser.id && !n.read).length;

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-navy-950/40 lg:hidden" onClick={onClose} />}

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-navy-100 transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-700">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LeaveEase</h1>
            <p className="text-xs text-navy-300">College Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Menu</p>
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = page === item.page;
              const showBadge = item.page === 'notifications' && unreadCount > 0;
              return (
                <li key={item.page}>
                  <button
                    onClick={() => { setPage(item.page); onClose(); }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      isActive ? 'bg-navy-700 text-white shadow-sm' : 'text-navy-300 hover:bg-navy-800 hover:text-white',
                    )}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {showBadge && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-navy-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-600 text-sm font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{currentUser.name}</p>
              <p className="truncate text-xs capitalize text-navy-400">{currentUser.role} · {currentUser.department}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-300 transition hover:bg-red-900/40 hover:text-red-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

      </aside>
    </>
  );
}
