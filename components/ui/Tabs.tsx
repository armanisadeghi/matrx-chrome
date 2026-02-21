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
            flex items-center gap-1 px-2.5 py-1.5
            font-medium whitespace-nowrap
            border-b-2 cursor-pointer
            transition-all duration-[var(--m-transition)]
            ${
              activeTab === tab.id
                ? 'border-[var(--m-brand)] text-[var(--m-brand)]'
                : 'border-transparent text-[color:var(--m-text-tertiary)] hover:text-[color:var(--m-text-secondary)] hover:border-[var(--m-border)]'
            }
          `}
          style={{ fontSize: '11px' }}
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
  return <div className={`p-3 ${className}`}>{children}</div>;
}
