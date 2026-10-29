import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const baseInput = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none transition';

export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Input({ className, onKeyDown, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // For numeric fields that require non-negative integers, reject e, E, +, -, and decimals
    if (props.type === 'number') {
      const minVal = props.min !== undefined ? Number(props.min) : undefined;
      if (minVal !== undefined && minVal >= 0) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
          e.preventDefault();
        }
      }
      if (props.step === '1' && e.key === '.') {
        e.preventDefault();
      }
    }
    onKeyDown?.(e);
  };

  return <input className={cn(baseInput, className)} onKeyDown={handleKeyDown} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={cn(baseInput, 'cursor-pointer', className)} {...props}>{children}</select>;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseInput, 'resize-y', className)} {...props} />;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-navy-800 text-white hover:bg-navy-900 active:bg-navy-950 shadow-sm',
    secondary: 'bg-white text-navy-800 border border-navy-200 hover:bg-navy-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">{icon}</div>
      <h4 className="font-medium text-gray-600">{title}</h4>
      <p className="mt-1 text-sm text-gray-400">{message}</p>
    </div>
  );
}
