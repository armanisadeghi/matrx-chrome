import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--m-bg-inset)] text-[color:var(--m-text-secondary)]',
  success: 'bg-[var(--m-success-subtle)] text-[var(--m-success-text)]',
  error: 'bg-[var(--m-error-subtle)] text-[var(--m-error-text)]',
  warning: 'bg-[var(--m-warning-subtle)] text-[var(--m-warning-text)]',
  info: 'bg-[var(--m-info-subtle)] text-[var(--m-info-text)]',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium
        rounded-[var(--m-radius-full)]
        ${variantStyles[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}
