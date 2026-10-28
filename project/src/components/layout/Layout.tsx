import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import type { Page } from '@/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const pageTitles: Record<Page, string> = {
  'dashboard': 'Dashboard',
  'apply-leave': 'Apply for Leave',
  'leave-history': 'Leave History',
  'leave-approvals': 'Leave Approvals',
  'green-card': 'Green Card Slots',
  'my-bookings': 'My Bookings',
  'classroom': 'Classroom Availability',
  'users': 'User Management',
  'notifications': 'Notifications',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { page } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={pageTitles[page]} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
