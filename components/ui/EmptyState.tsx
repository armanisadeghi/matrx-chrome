import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && (
        <div className="text-[color:var(--m-text-tertiary)] mb-2">{icon}</div>
      )}
      <p className="font-medium text-[color:var(--m-text-secondary)] mb-1" style={{ fontSize: '13px' }}>
        {title}
      </p>
      {description && (
        <p className="text-[color:var(--m-text-tertiary)] max-w-[250px]" style={{ fontSize: '12px' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
