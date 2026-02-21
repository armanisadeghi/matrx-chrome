import type { ReactNode } from 'react';
import { CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

type StatusType = 'success' | 'error' | 'info' | 'loading';

const statusConfig: Record<StatusType, { icon: typeof CheckCircle; bg: string; text: string }> = {
  success: { icon: CheckCircle, bg: 'bg-[var(--m-success-subtle)]', text: 'text-[var(--m-success-text)]' },
  error: { icon: AlertTriangle, bg: 'bg-[var(--m-error-subtle)]', text: 'text-[var(--m-error-text)]' },
  info: { icon: Info, bg: 'bg-[var(--m-info-subtle)]', text: 'text-[var(--m-info-text)]' },
  loading: { icon: Loader2, bg: 'bg-[var(--m-bg-inset)]', text: 'text-[color:var(--m-text-secondary)]' },
};

interface StatusMessageProps {
  type: StatusType;
  children: ReactNode;
  className?: string;
}

export function StatusMessage({ type, children, className = '' }: StatusMessageProps) {
  const config = statusConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-center gap-2 px-2.5 py-1.5
        rounded-[var(--m-radius-md)]
        ${config.bg} ${config.text}
        ${className}
      `}
      style={{ fontSize: '12px' }}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${type === 'loading' ? 'animate-spin' : ''}`} />
      <span>{children}</span>
    </div>
  );
}
