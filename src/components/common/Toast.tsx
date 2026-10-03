import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl text-neutral-100 text-sm backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
              {isError && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info size={18} className="text-sky-400 shrink-0" />}
              <span className="truncate font-medium text-xs sm:text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
