import { type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div
      className={`
        flex overflow-x-auto border-b border-[var(--m-border)]
        scrollbar-none
        ${className}
      `}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-3 py-2
            text-[var(--m-text-sm)] font-medium whitespace-nowrap
            border-b-2 cursor-pointer
            transition-all duration-[var(--m-transition)]
            ${
              activeTab === tab.id
                ? 'border-[var(--m-brand)] text-[var(--m-brand)]'
                : 'border-transparent text-[var(--m-text-tertiary)] hover:text-[var(--m-text-secondary)] hover:border-[var(--m-border)]'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  active: boolean;
  className?: string;
}

export function TabPanel({ children, active, className = '' }: TabPanelProps) {
  if (!active) return null;
  return <div className={`p-4 ${className}`}>{children}</div>;
}
