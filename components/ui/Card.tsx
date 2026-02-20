import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
}

export function Card({ children, elevated, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--m-bg-card)] border border-[var(--m-border)]
        rounded-[var(--m-radius-lg)] overflow-hidden
        ${elevated ? 'shadow-[var(--m-shadow-md)]' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 py-3 border-b border-[var(--m-border)] flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-4 py-3 border-t border-[var(--m-border)] flex items-center justify-end gap-2 ${className}`}
    >
      {children}
    </div>
  );
}
