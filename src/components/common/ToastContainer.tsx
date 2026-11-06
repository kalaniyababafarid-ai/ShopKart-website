import React from 'react';
import { useNotification, NotificationType } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
};

const bgColors: Record<NotificationType, string> = {
  success: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200',
  error: 'border-rose-200 dark:border-rose-900/50 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200',
  warning: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200',
  info: 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-200',
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeToast } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgColors[n.type]}`}
        >
          {icons[n.type]}
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {n.title && <div className="font-semibold mb-0.5">{n.title}</div>}
            <div>{n.message}</div>
          </div>
          <button
            onClick={() => removeToast(n.id)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
