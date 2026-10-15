import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface AdminAlertMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AdminAlertProps {
  message: AdminAlertMessage | null;
  onDismiss: () => void;
}

export const AdminAlert: React.FC<AdminAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  const isSuccess = message.type === 'success';
  const isError = message.type === 'error';

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200 ${
        isSuccess
          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
          : isError
          ? 'bg-rose-950/70 border-rose-800 text-rose-200'
          : 'bg-blue-950/70 border-blue-800 text-blue-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        )}
        <span className="font-medium">{message.text}</span>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
