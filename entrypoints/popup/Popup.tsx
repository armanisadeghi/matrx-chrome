import { useState } from 'react';
import {
  Scan,
  FileText,
  Sparkles,
  MessageSquare,
  Settings,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Card, CardBody, Badge, StatusMessage } from '../../components/ui';
import { AuthStatus } from '../../components/auth/AuthStatus';
import { ExtractionPanel } from '../../components/extraction/ExtractionPanel';

export function Popup() {
  useTheme();
  const { isAuthenticated } = useAuth();
  const tab = useCurrentTab();

  const openSidePanel = async () => {
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-[360px] max-h-[500px] flex flex-col bg-[var(--m-bg-page)]">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2.5 bg-[var(--m-bg-card)] border-b border-[var(--m-border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[var(--m-radius-sm)] bg-[var(--m-brand)] flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: '11px' }}>M</span>
          </div>
          <div>
            <h1 className="font-semibold text-[color:var(--m-text-primary)] leading-tight" style={{ fontSize: '13px' }}>
              Matrx
            </h1>
            <p className="text-[color:var(--m-text-tertiary)]" style={{ fontSize: '10px' }}>
              Web Intelligence Platform
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" icon onClick={openOptions} title="Settings">
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </header>

      {/* Page Info */}
      {tab && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--m-bg-inset)] border-b border-[var(--m-border)]">
          <Globe className="w-3 h-3 text-[color:var(--m-text-tertiary)]" />
          <span className="text-[color:var(--m-text-secondary)] truncate flex-1" style={{ fontSize: '11px' }}>
            {tab.domain}
          </span>
          {!isAuthenticated && (
            <Badge variant="warning">Not signed in</Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-3 py-3 flex flex-col gap-2.5">
        {/* Quick Actions */}
        <Card>
          <CardBody className="!px-3 !py-2.5">
            <h2 className="font-semibold text-[color:var(--m-text-primary)] mb-2" style={{ fontSize: '12px' }}>
              Quick Extract
            </h2>
            <ExtractionPanel />
          </CardBody>
        </Card>

        {/* Open Full UI */}
        <Button variant="secondary" block onClick={openSidePanel}>
          <ExternalLink className="w-3.5 h-3.5" />
          Open Full Side Panel
        </Button>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1 px-2 py-2.5
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <MessageSquare className="w-4 h-4 text-[var(--m-brand)]" />
            <span className="font-medium text-[color:var(--m-text-secondary)]" style={{ fontSize: '11px' }}>
              AI Chat
            </span>
          </button>
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1 px-2 py-2.5
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Sparkles className="w-4 h-4 text-[var(--m-warning-text)]" />
            <span className="font-medium text-[color:var(--m-text-secondary)]" style={{ fontSize: '11px' }}>
              Analyze Page
            </span>
          </button>
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1 px-2 py-2.5
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Globe className="w-4 h-4 text-[var(--m-success-text)]" />
            <span className="font-medium text-[color:var(--m-text-secondary)]" style={{ fontSize: '11px' }}>
              Browser Control
            </span>
          </button>
          <button
            onClick={openOptions}
            className="flex flex-col items-center gap-1 px-2 py-2.5
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Settings className="w-4 h-4 text-[color:var(--m-text-tertiary)]" />
            <span className="font-medium text-[color:var(--m-text-secondary)]" style={{ fontSize: '11px' }}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
