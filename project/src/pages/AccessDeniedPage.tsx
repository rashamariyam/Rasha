import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';
import type { Role } from '@/types';
import { getDashboardRouteForRole } from '@/lib/router';

interface AccessDeniedPageProps {
  userRole: Role;
  attemptedRole?: Role;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export function AccessDeniedPage({
  userRole,
  attemptedRole,
  onNavigate,
  onLogout,
}: AccessDeniedPageProps) {
  const myDashboard = getDashboardRouteForRole(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fade-in border border-gray-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 shadow-sm">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-navy-950">Access Denied</h1>
        <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 uppercase tracking-wider">
          403 Forbidden
        </span>

        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          You are currently signed in with a <strong className="capitalize text-navy-900">{userRole}</strong> account.
          {attemptedRole ? (
            <> You do not possess institutional privileges to access the <strong className="capitalize text-navy-900">{attemptedRole}</strong> portal.</>
          ) : (
            <> You do not possess authorization to access this restricted page.</>
          )}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            id="go-to-my-dashboard-btn"
            onClick={() => onNavigate(myDashboard)}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy-800 py-3 text-sm font-bold text-white transition hover:bg-navy-900 cursor-pointer shadow-md"
          >
            <span>Go to My {userRole.toUpperCase()} Dashboard</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
