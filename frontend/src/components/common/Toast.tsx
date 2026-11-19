import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px] flex items-center justify-center gap-2 bg-stone-900 text-amber-50 px-4 py-3 rounded-2xl shadow-xl border border-stone-700 text-xs font-semibold animate-fade-in">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
};
