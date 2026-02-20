import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, ExternalLink, CheckCircle, Clock, Send } from 'lucide-react';
import { getExtensionScrapeQueue, submitExtensionContent } from '../../utils/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, EmptyState, Badge } from '../ui';
import type { ScrapeQueueItem } from '../../utils/types';

export function ScrapeQueuePanel() {
  const { isAuthenticated } = useAuth();
  const tab = useCurrentTab();
  const [queue, setQueue] = useState<ScrapeQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchBanner, setMatchBanner] = useState<ScrapeQueueItem | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getExtensionScrapeQueue();
    if (res.success && res.data) {
      setQueue(res.data);
    } else {
      setError(res.error || 'Failed to fetch queue');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchQueue();
    }
  }, [isAuthenticated, fetchQueue]);

  // Listen for scrape queue match notifications from background worker
  useEffect(() => {
    const handler = (message: { action: string; match?: ScrapeQueueItem }) => {
      if (message.action === 'scrapeQueueMatch' && message.match) {
        setMatchBanner(message.match);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const submitContent = async (item: ScrapeQueueItem) => {
    if (!tab?.url) return;

    setSubmitting(item.id);

    // Extract HTML from the current page
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) {
      setSubmitting(null);
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'copyFullHTML' });
      if (response?.html) {
        const result = await submitExtensionContent(item.topic_id, item.source_id, response.html);
        if (result.success) {
          setQueue((prev) => prev.filter((q) => q.id !== item.id));
        }
      }
    } catch {
      // Content script may not be loaded
    } finally {
      setSubmitting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Clock className="w-10 h-10" />}
        title="Sign in Required"
        description="Sign in to view your scrape queue from the research system."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--m-brand)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Background worker detected a queue match for current tab */}
      {matchBanner && (
        <div className="p-2.5 bg-[var(--m-warning-subtle)] border border-[var(--m-warning-text)]/20 rounded-[var(--m-radius-md)] flex items-center gap-2">
          <Send className="w-4 h-4 text-[var(--m-warning-text)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--m-warning-text)]">
              This page is in your scrape queue
            </p>
            <p className="text-[10px] text-[color:var(--m-text-tertiary)] truncate">
              {matchBanner.title || matchBanner.url}
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              submitContent(matchBanner);
              setMatchBanner(null);
            }}
            disabled={submitting === matchBanner.id}
          >
            {submitting === matchBanner.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Submit
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
          Scrape Queue
        </span>
        <Button size="sm" variant="ghost" icon onClick={fetchQueue}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[var(--m-error)]">{error}</p>
      )}

      {queue.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="w-8 h-8" />}
          title="Queue Empty"
          description="No pending pages to scrape. Items will appear here when the research system needs content from specific URLs."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {queue.map((item) => {
            const isCurrentPage = tab?.url === item.url;
            return (
              <div
                key={item.id}
                className="p-2.5 bg-[var(--m-bg-card)] rounded-[var(--m-radius-md)] border border-[var(--m-border)]"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[color:var(--m-text-primary)] truncate">
                      {item.title || new URL(item.url).hostname}
                    </p>
                    <p className="text-xs text-[color:var(--m-text-tertiary)] truncate">
                      {item.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isCurrentPage && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => submitContent(item)}
                        disabled={submitting === item.id}
                      >
                        {submitting === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        Submit
                      </Button>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-[var(--m-bg-hover)] rounded-[var(--m-radius-sm)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                    </a>
                  </div>
                </div>
                {isCurrentPage && (
                  <Badge variant="success" className="mt-1.5">Current Page</Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
