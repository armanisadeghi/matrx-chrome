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
      <header className="flex items-center justify-between px-4 py-3 bg-[var(--m-bg-card)] border-b border-[var(--m-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--m-radius-md)] bg-[var(--m-brand)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <h1 className="text-[var(--m-text-md)] font-semibold text-[var(--m-text-primary)] leading-tight">
              Matrx
            </h1>
            <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
              Web Intelligence Platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon onClick={openOptions} title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Page Info */}
      {tab && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--m-bg-inset)] border-b border-[var(--m-border)]">
          <Globe className="w-3.5 h-3.5 text-[var(--m-text-tertiary)]" />
          <span className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] truncate flex-1">
            {tab.domain}
          </span>
          {!isAuthenticated && (
            <Badge variant="warning">Not signed in</Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {/* Quick Actions */}
        <Card>
          <CardBody className="!p-3">
            <h2 className="text-[var(--m-text-sm)] font-semibold text-[var(--m-text-primary)] mb-2">
              Quick Extract
            </h2>
            <ExtractionPanel />
          </CardBody>
        </Card>

        {/* Open Full UI */}
        <Button variant="secondary" block onClick={openSidePanel}>
          <ExternalLink className="w-4 h-4" />
          Open Full Side Panel
        </Button>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1.5 p-3
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <MessageSquare className="w-5 h-5 text-[var(--m-brand)]" />
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-secondary)]">
              AI Chat
            </span>
          </button>
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1.5 p-3
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Sparkles className="w-5 h-5 text-[var(--m-warning-text)]" />
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-secondary)]">
              Analyze Page
            </span>
          </button>
          <button
            onClick={openSidePanel}
            className="flex flex-col items-center gap-1.5 p-3
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Globe className="w-5 h-5 text-[var(--m-success-text)]" />
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-secondary)]">
              Browser Control
            </span>
          </button>
          <button
            onClick={openOptions}
            className="flex flex-col items-center gap-1.5 p-3
              bg-[var(--m-bg-card)] border border-[var(--m-border)]
              rounded-[var(--m-radius-md)] cursor-pointer
              hover:bg-[var(--m-bg-hover)] hover:border-[var(--m-border-strong)]
              transition-all"
          >
            <Settings className="w-5 h-5 text-[var(--m-text-tertiary)]" />
            <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-secondary)]">
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
