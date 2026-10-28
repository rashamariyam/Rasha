import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  const config = {
    success: { icon: <CheckCircle2 size={18} />, class: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    error: { icon: <XCircle size={18} />, class: 'bg-red-50 border-red-200 text-red-800' },
    warning: { icon: <AlertCircle size={18} />, class: 'bg-amber-50 border-amber-200 text-amber-800' },
    info: { icon: <Info size={18} />, class: 'bg-blue-50 border-blue-200 text-blue-800' },
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn('flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-in min-w-[280px] max-w-[400px]', config[t.type].class)}
        >
          {config[t.type].icon}
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
