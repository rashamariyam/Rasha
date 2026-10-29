import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn, formatDate, getLocalDateString } from '@/lib/utils';

export interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  minDate?: string; // YYYY-MM-DD (defaults to today's local date)
  maxDate?: string; // YYYY-MM-DD
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  inline?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  disabled = false,
  required = false,
  error,
  className,
  id,
  name,
  inline = false,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const todayStr = getLocalDateString();
  const effectiveMin = minDate || todayStr;

  // Parse effective min [minY, minM, minD] (1-indexed month)
  const [minY, minM] = effectiveMin.split('-').map(Number);

  // Initialize viewed year and month (0-indexed month)
  const getInitialYearMonth = () => {
    if (value && value >= effectiveMin) {
      const [vy, vm] = value.split('-').map(Number);
      if (vy && vm) return { year: vy, month: vm - 1 };
    }
    const [ty, tm] = todayStr.split('-').map(Number);
    return { year: ty, month: tm - 1 };
  };

  const initial = getInitialYearMonth();
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month);

  // If minDate changes or when opened with no valid value, ensure view is not before minDate
  useEffect(() => {
    if (viewYear < minY || (viewYear === minY && viewMonth < minM - 1)) {
      setViewYear(minY);
      setViewMonth(minM - 1);
    }
  }, [effectiveMin, minY, minM, viewYear, viewMonth]);

  // Sync view when opening
  useEffect(() => {
    if (open) {
      if (value && value >= effectiveMin) {
        const [vy, vm] = value.split('-').map(Number);
        if (vy && vm) {
          setViewYear(vy);
          setViewMonth(vm - 1);
          return;
        }
      }
      const [ty, tm] = todayStr.split('-').map(Number);
      // Ensure we don't open earlier than minDate
      if (ty < minY || (ty === minY && tm < minM)) {
        setViewYear(minY);
        setViewMonth(minM - 1);
      } else {
        setViewYear(ty);
        setViewMonth(tm - 1);
      }
    }
  }, [open, value, effectiveMin, todayStr, minY, minM]);

  // Close on outside click
  useEffect(() => {
    if (inline) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [open, inline]);

  // Navigation conditions
  const isPrevDisabled = viewYear < minY || (viewYear === minY && viewMonth <= minM - 1);

  let isNextDisabled = false;
  if (maxDate) {
    const [maxY, maxM] = maxDate.split('-').map(Number);
    isNextDisabled = viewYear > maxY || (viewYear === maxY && viewMonth >= maxM - 1);
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPrevDisabled) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isNextDisabled) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selectedDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (selectedDateStr < effectiveMin) return;
    if (maxDate && selectedDateStr > maxDate) return;
    onChange(selectedDateStr);
    if (!inline) setOpen(false);
  };

  // Calendar days computation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const calendarContent = (
    <div className="w-[300px] select-none p-3">
      {/* Month & Year Header with strict navigation controls */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
          aria-label="Previous Month"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition',
            isPrevDisabled
              ? 'opacity-20 cursor-not-allowed pointer-events-none text-gray-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-navy-900 active:bg-gray-200 cursor-pointer'
          )}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
          {viewYear === minY && viewMonth === minM - 1 && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
              Current Month
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={isNextDisabled}
          aria-label="Next Month"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition',
            isNextDisabled
              ? 'opacity-20 cursor-not-allowed pointer-events-none text-gray-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-navy-900 active:bg-gray-200 cursor-pointer'
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-xs font-semibold text-gray-400">
        {WEEKDAY_NAMES.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {leadingBlanks.map((b) => (
          <div key={`blank-${b}`} className="h-8 w-8" />
        ))}

        {daysArray.map((day) => {
          const dayDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = dayDateStr < effectiveMin;
          const isBeyondMax = maxDate ? dayDateStr > maxDate : false;
          const isDayDisabled = isPast || isBeyondMax;
          const isSelected = value === dayDateStr;
          const isToday = dayDateStr === todayStr;

          return (
            <button
              key={day}
              type="button"
              disabled={isDayDisabled}
              onClick={() => handleSelectDay(day)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition',
                isSelected && 'bg-navy-800 text-white font-bold shadow-xs hover:bg-navy-900',
                !isSelected && isToday && 'border border-navy-600 font-bold text-navy-800 hover:bg-navy-50',
                !isSelected && !isToday && !isDayDisabled && 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
                isDayDisabled && 'text-gray-300 line-through opacity-40 cursor-not-allowed bg-gray-50/40 select-none'
              )}
              title={isPast ? 'Past date cannot be selected' : dayDateStr}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer helpers */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
        <button
          type="button"
          onClick={() => {
            const [ty, tm] = todayStr.split('-').map(Number);
            setViewYear(ty);
            setViewMonth(tm - 1);
            if (todayStr >= effectiveMin) {
              onChange(todayStr);
              if (!inline) setOpen(false);
            }
          }}
          disabled={todayStr < effectiveMin}
          className="text-navy-700 hover:text-navy-900 font-medium px-1 py-0.5 rounded hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Today ({formatDate(todayStr)})
        </button>

        {!inline && value && !required && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="text-gray-400 hover:text-red-600 font-medium px-1 py-0.5 rounded hover:bg-gray-100 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'inline-block rounded-xl border border-gray-200 bg-white shadow-xs',
          className
        )}
      >
        {calendarContent}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <input
        type="hidden"
        id={id}
        name={name}
        value={value}
        required={required}
      />

      {/* Clickable Date Display Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left text-gray-900 shadow-2xs transition',
          'focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200',
          disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          open && 'border-navy-600 ring-2 ring-navy-100'
        )}
      >
        <span className={cn('truncate', !value && 'text-gray-400 font-normal')}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon size={16} className={cn('text-gray-400 shrink-0 ml-2', value && 'text-navy-700')} />
      </button>

      {/* Floating Popover Calendar */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {calendarContent}
        </div>
      )}
    </div>
  );
}
