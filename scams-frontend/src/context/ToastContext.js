import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10, minWidth: 260, maxWidth: 380,
              background: t.type === 'error' ? '#fef2f2' : t.type === 'info' ? '#eff6ff' : '#f0fdf4',
              border: `1.5px solid ${t.type === 'error' ? '#fca5a5' : t.type === 'info' ? '#93c5fd' : '#86efac'}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              color: t.type === 'error' ? '#dc2626' : t.type === 'info' ? '#1d4ed8' : '#15803d',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'toastIn 0.25s ease',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>
              {t.type === 'error' ? '❌' : t.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <span style={{ opacity: 0.4, fontSize: 16, flexShrink: 0 }}>×</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
