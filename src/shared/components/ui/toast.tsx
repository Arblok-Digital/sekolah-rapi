'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

// Backward-compatible: also accepts the old 'default' | 'destructive' variants.
export type ToastProps = {
  title?: string;
  description?: string;
  variant?: ToastVariant | 'default' | 'destructive';
  /** Auto-dismiss delay in ms. Defaults to 4000. */
  duration?: number;
};

type ToastItem = ToastProps & { id: number };

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (props: ToastProps) => void;
  dismiss: (id: number) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'text-red-400',
    borderClass: 'border-red-500/40',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-400',
    borderClass: 'border-blue-500/40',
  },
};

function normalizeVariant(variant: ToastProps['variant']): ToastVariant {
  if (variant === 'destructive') return 'error';
  if (variant === 'default' || !variant) return 'info';
  return variant;
}

/** Extract a readable message from any thrown value, with a localized fallback. */
export function getErrorMessage(err: unknown, fallback = 'Terjadi kesalahan'): string {
  if (err instanceof Error) return err.message || fallback;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timersRef = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (props: ToastProps) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, ...props }]);
      const timer = setTimeout(() => dismiss(id), props.duration ?? 4000);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  // Clear pending timers on unmount.
  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): Omit<ToastContextValue, 'toasts' | 'dismiss'> {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return { toast: ctx.toast };
}

export function Toaster() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3"
    >
      {ctx.toasts.map((t) => {
        const variant = normalizeVariant(t.variant);
        const config = VARIANT_CONFIG[variant];
        const Icon = config.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto animate-slide-up flex items-start gap-3 rounded-xl border ${config.borderClass} bg-gray-900/95 p-4 shadow-xl shadow-black/40 backdrop-blur-xl`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-semibold text-white">{t.title}</p>}
              {t.description && (
                <p className="mt-0.5 text-sm leading-snug text-white/70">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => ctx.dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
