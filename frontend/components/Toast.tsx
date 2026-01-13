import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-art-charcoal/95',
      border: 'border-art-gold/30',
      icon: CheckCircle2,
      iconColor: 'text-art-gold'
    },
    error: {
      bg: 'bg-red-900/95',
      border: 'border-red-500/30',
      icon: XCircle,
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-900/95',
      border: 'border-yellow-500/30',
      icon: AlertCircle,
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-art-charcoal/95',
      border: 'border-art-teal/30',
      icon: AlertCircle,
      iconColor: 'text-art-teal'
    }
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down">
      <div className={`${style.bg} backdrop-blur-md text-white px-8 py-4 rounded-sm flex items-center gap-3 shadow-2xl border ${style.border} min-w-[320px] max-w-[500px]`}>
        <Icon className={`${style.iconColor} w-5 h-5 flex-shrink-0`} />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold flex-grow">{message}</span>
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

