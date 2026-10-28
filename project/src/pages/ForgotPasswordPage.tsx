import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import {
  KeyRound,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { requestPasswordReset, resetPassword } = useApp();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your registered college email or ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(identifier);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setInfoMessage(
          `Password reset instructions generated for ${res.user?.email || identifier}. You may now set your new password.`
        );
        setStep('reset');
      } else {
        setInfoMessage(
          res.error ||
            'If an account matches this email or ID, password reset instructions have been dispatched.'
        );
      }
    } catch {
      setError('An error occurred while requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(resetToken, newPassword);
      if (res.success) {
        setStep('success');
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch {
      setError('An error occurred while updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl animate-fade-in border border-gray-100">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-800 mb-3 shadow-sm">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-bold text-navy-950">Password Recovery</h1>
          <p className="mt-1 text-xs text-gray-500">
            {step === 'request' && 'Enter your registered college email or ID to reset your credentials'}
            {step === 'reset' && 'Create and confirm your new secure password'}
            {step === 'success' && 'Your password has been successfully updated'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 animate-slide-up">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-blue-600" />
            <p>{infoMessage}</p>
          </div>
        )}

        {/* Step 1: Request Reset */}
        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Registered College Email or ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. arjun@college.edu or CS21B001"
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-2.5 text-sm font-bold text-white transition hover:bg-navy-900 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Request Password Reset'}
            </button>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                New Password (min. 6 characters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-2.5 text-sm font-bold text-white transition hover:bg-navy-900 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm text-gray-600">
              Your password has been securely reset. You can now log into your portal with your new password.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-2.5 text-sm font-bold text-white transition hover:bg-navy-900 cursor-pointer"
            >
              <span>Return to Role Selection</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-navy-900 hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Role Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
