import { useState, useEffect } from 'react';
import { Phone, Check, AlertCircle } from 'lucide-react';
import { sanitizePhone, validatePhone } from '@/lib/validation';
import { cn } from '@/lib/utils';

export interface PhoneInputProps {
  value: string;
  onChange: (sanitizedValue: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoValidate?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  id,
  name,
  placeholder = '9876543210',
  required = false,
  disabled = false,
  error: externalError,
  className,
  autoValidate = true,
}: PhoneInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Validate on value change if touched
  useEffect(() => {
    if (touched && autoValidate) {
      const res = validatePhone(value, required);
      setInternalError(res.error);
    } else {
      setInternalError(null);
    }
  }, [value, touched, required, autoValidate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = sanitizePhone(raw);
    onChange(sanitized);
    if (!touched && sanitized.length > 0) {
      setTouched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation, delete, and copy/paste shortcuts
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      (e.ctrlKey || e.metaKey) // Ctrl+A, Ctrl+C, Ctrl+V, etc.
    ) {
      return;
    }

    // Only allow numeric digits 0-9
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const sanitized = sanitizePhone(pasteData);
    onChange(sanitized);
    setTouched(true);
  };

  const displayError = externalError || internalError;
  const isComplete = value.length === 10 && /^[6-9]\d{9}$/.test(value);

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        {/* Country Code Prefix Badge */}
        <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none select-none text-gray-500 font-semibold text-xs border-r border-gray-200 pr-2.5">
          <Phone size={14} className="text-gray-400" />
          <span className="text-navy-900 font-bold tracking-wider">+91</span>
        </div>

        {/* Telephone Input */}
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          aria-invalid={!!displayError}
          className={cn(
            'w-full rounded-xl border border-gray-300 py-2.5 pl-20 pr-10 text-sm font-medium tracking-wide text-gray-900 placeholder-gray-400 shadow-2xs transition',
            'focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-100',
            disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
            displayError && 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20',
            isComplete && !displayError && 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-100'
          )}
        />

        {/* Right Status Indicator */}
        <div className="absolute right-3.5 pointer-events-none flex items-center">
          {displayError ? (
            <AlertCircle size={16} className="text-red-500" />
          ) : isComplete ? (
            <Check size={16} className="text-emerald-500 stroke-[2.5]" />
          ) : value.length > 0 ? (
            <span className="text-[11px] font-semibold text-gray-400 font-mono">
              {value.length}/10
            </span>
          ) : null}
        </div>
      </div>

      {/* Real-time Error / Helper Message */}
      {displayError ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600 animate-in fade-in">
          <AlertCircle size={12} className="shrink-0" />
          <span>{displayError}</span>
        </p>
      ) : value.length > 0 && value.length < 10 && touched ? (
        <p className="mt-1 text-[11px] text-gray-400">
          Enter {10 - value.length} more digit{10 - value.length > 1 ? 's' : ''} (must start with 6-9)
        </p>
      ) : null}
    </div>
  );
}

