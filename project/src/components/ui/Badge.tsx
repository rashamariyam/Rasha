import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'navy' | 'blue';

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  navy: 'bg-navy-50 text-navy-700 border-navy-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function Badge({ variant = 'neutral', children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', styles[variant])}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'approved')
    return <Badge variant="success"><CheckCircle2 size={12} /> Approved</Badge>;
  if (status === 'rejected')
    return <Badge variant="error"><XCircle size={12} /> Rejected</Badge>;
  return <Badge variant="warning"><Clock size={12} /> Pending</Badge>;
}

export function NotificationTypeIcon({ type }: { type: 'info' | 'success' | 'warning' | 'error' }) {
  const map = {
    success: <CheckCircle2 size={16} className="text-emerald-500" />,
    error: <XCircle size={16} className="text-red-500" />,
    warning: <AlertCircle size={16} className="text-amber-500" />,
    info: <AlertCircle size={16} className="text-blue-500" />,
  };
  return map[type];
}
