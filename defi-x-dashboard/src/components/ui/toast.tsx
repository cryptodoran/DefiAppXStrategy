'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.3 }}
      className={cn(
        'min-w-[320px] max-w-[420px] p-4 rounded-lg',
        'bg-elevated border shadow-lg',
        borderColors[toast.type]
      )}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-primary">{toast.title}</p>
          {toast.description && (
            <p className="text-sm text-tertiary mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-tertiary hover:text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Convenience hooks
export function useSuccessToast() {
  const { addToast } = useToast();
  return (title: string, description?: string) =>
    addToast({ type: 'success', title, description });
}

export function useErrorToast() {
  const { addToast } = useToast();
  return (title: string, description?: string) =>
    addToast({ type: 'error', title, description });
}
