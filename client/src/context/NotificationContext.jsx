import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Synthesize pleasant emergency tone using Web Audio API
  const playAlertSound = useCallback((type = 'emergency') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'emergency' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'emergency' ? 880 : 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'emergency' ? 440 : 660, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay might be restricted by browser until user interaction
    }
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (type === 'emergency' || type === 'dispatch') {
      playAlertSound('emergency');
    } else if (type === 'success') {
      playAlertSound('info');
    }

    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [playAlertSound]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, playAlertSound }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right flex items-start justify-between gap-3 ${
              toast.type === 'emergency'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/50'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'dispatch'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-slate-950/50'
            }`}
          >
            <div>
              <p className="font-bold text-sm leading-tight flex items-center gap-1.5">
                {toast.type === 'emergency' && '🚨'}
                {toast.type === 'success' && '✅'}
                {toast.type === 'dispatch' && '⚡'}
                {toast.title}
              </p>
              {toast.message && <p className="text-xs mt-1 text-slate-300">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
