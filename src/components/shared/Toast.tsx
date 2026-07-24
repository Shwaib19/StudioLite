import { useState, useEffect, useCallback } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

/** Show a toast notification from anywhere in the app. */
export function showToast(type: ToastMessage['type'], message: string) {
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  toastListeners.forEach((fn) => fn({ id, type, message }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: ToastMessage) => {
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== msg.id));
    }, 4000);
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-md shadow-lg text-sm text-white animate-slide-up ${
            toast.type === 'error'
              ? 'bg-error'
              : toast.type === 'success'
                ? 'bg-success'
                : toast.type === 'warning'
                  ? 'bg-warning'
                  : 'bg-info'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}