import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      {icon && (
        <div className="text-[color:var(--m-text-tertiary)] mb-3">{icon}</div>
      )}
      <p className="text-md font-medium text-[color:var(--m-text-secondary)] mb-1">
        {title}
      </p>
      {description && (
        <p className="text-sm text-[color:var(--m-text-tertiary)] max-w-[250px]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
