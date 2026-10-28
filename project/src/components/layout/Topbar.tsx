import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Role } from '@/types';
import { Menu, Search, Bell, LogOut, ChevronDown, RefreshCw, UserCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  hod: 'HOD',
  admin: 'Admin',
};

import { getDashboardRouteForRole } from '@/lib/router';

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { currentUser, data, page, setPage, logout, resetAllData, loginAsUser } = useApp();
  const [showSwitch, setShowSwitch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!currentUser) return null;
  const unreadCount = data.notifications.filter((n) => n.userId === currentUser.id && !n.read).length;

  const handleLogout = () => {
    logout();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleRoleSwitch = (user: (typeof data.users)[0]) => {
    loginAsUser(user.id);
    const targetRoute = getDashboardRouteForRole(user.role);
    window.history.pushState({}, '', targetRoute);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };


  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden">
          <Menu size={22} />
        </button>
        {page !== 'dashboard' && (
          <button
            onClick={() => setPage('dashboard')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        {page === 'dashboard' && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
            title="Back to Login Page"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Role Selection</span>
          </button>
        )}
        <h2 className="text-lg font-semibold text-navy-900 lg:text-xl">{title}</h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Notifications */}
        <button
          onClick={() => setPage('notifications')}
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Demo role switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowSwitch(!showSwitch); setShowProfile(false); }}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <UserCircle size={18} className="text-navy-600" />
            <span className="hidden sm:inline">Switch Role</span>
            <ChevronDown size={16} className={cn('transition', showSwitch && 'rotate-180')} />
          </button>
          {showSwitch && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl animate-fade-in">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Switch Demo Role</p>
              {data.users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { handleRoleSwitch(u); setShowSwitch(false); }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50',
                    u.id === currentUser.id && 'bg-navy-50',
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                    {u.name.charAt(0)}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-gray-800">{u.name}</p>
                    <p className="truncate text-xs text-gray-400">{roleLabels[u.role]} · {u.department}</p>
                  </div>
                  {u.id === currentUser.id && <span className="h-2 w-2 rounded-full bg-navy-600" />}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => { resetAllData(); setShowSwitch(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw size={16} /> Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowSwitch(false); }}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <ChevronDown size={16} className={cn('hidden sm:block transition', showProfile && 'rotate-180')} />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl animate-fade-in">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-medium text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{currentUser.email}</p>
                <span className="mt-1 inline-block rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700 capitalize">
                  {roleLabels[currentUser.role]}
                </span>
              </div>
              <button
                onClick={() => { handleLogout(); setShowProfile(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none"
      />
    </div>
  );
}
