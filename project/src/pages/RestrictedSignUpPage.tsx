import { ShieldAlert, ArrowLeft, Building2, ShieldCheck, Mail } from 'lucide-react';
import type { Role } from '@/types';

interface RestrictedSignUpPageProps {
  role: Role;
  onNavigate: (route: string) => void;
}

export function RestrictedSignUpPage({ role, onNavigate }: RestrictedSignUpPageProps) {
  const isHod = role === 'hod';

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl text-center animate-fade-in border border-gray-100">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-navy-950">
          {isHod ? 'HOD Registration Restricted' : 'Administrator Registration Disabled'}
        </h1>

        <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
          Institutional Security Policy
        </span>

        <p className="mt-4 text-sm text-gray-600 leading-relaxed text-left">
          {isHod ? (
            <>
              Head of Department (HOD) accounts possess final authorization authority on student leave requests across departments. To prevent unauthorized approval privileges, <strong>public HOD registration is disabled</strong>.
              <br /><br />
              Authorized HOD accounts are provisioned exclusively by the College Administration through the Admin Management Console.
            </>
          ) : (
            <>
              Administrator accounts maintain elevated access to manage users, classrooms, slots, and institutional reports. <strong>Public administrator registration is permanently disabled</strong>.
              <br /><br />
              System administrators are configured exclusively through secure server-side provisioning.
            </>
          )}
        </p>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Mail size={16} className="text-navy-700" />
            <span>Need an authorized account?</span>
          </div>
          <p>
            Please contact your College Administrator Office at{' '}
            <span className="font-mono text-navy-800 font-bold">admin@college.edu</span> with your official employee credentials.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onNavigate(isHod ? '/login/hod' : '/login/admin')}
            className="flex-1 rounded-xl bg-navy-800 py-2.5 text-sm font-bold text-white transition hover:bg-navy-900 cursor-pointer"
          >
            {isHod ? 'HOD Login' : 'Admin Login'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}
