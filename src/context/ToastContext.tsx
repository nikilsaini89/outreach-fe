import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  leaving: boolean;
}

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

const VISIBLE_MS = 3800;
const EXIT_MS = 220;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), EXIT_MS);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => dismiss(id), VISIBLE_MS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-stack" role="region" aria-label="Notifications">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}${t.leaving ? ' toast-leaving' : ''}`} role="alert">
              <span className="toast-msg">{t.message}</span>
              <button className="toast-close" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
