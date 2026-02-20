import { useState, useEffect } from 'react';
import { Heading1, RefreshCw } from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Badge, EmptyState, StatusMessage } from '../ui';
import type { HeaderInfo } from '../../utils/types';

export function HeaderAnalysis() {
  const tab = useCurrentTab();
  const [headers, setHeaders] = useState<HeaderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!tab?.id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageAnalysis',
        type: 'headers',
      });
      if (response.success) {
        setHeaders(response.data || []);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [tab?.url]);

  const levelColors: Record<number, string> = {
    1: 'text-[var(--m-brand)]',
    2: 'text-[var(--m-success-text)]',
    3: 'text-[var(--m-warning-text)]',
    4: 'text-[var(--m-text-secondary)]',
    5: 'text-[var(--m-text-tertiary)]',
    6: 'text-[var(--m-text-tertiary)]',
  };

  if (error) {
    return <StatusMessage type="error">{error}</StatusMessage>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[var(--m-text-sm)] text-[var(--m-text-secondary)]">
          {headers.length} headers found
        </span>
        <Button size="sm" variant="ghost" icon onClick={analyze} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {headers.length === 0 && !loading ? (
        <EmptyState
          icon={<Heading1 className="w-8 h-8" />}
          title="No headers found"
          description="This page doesn't contain any heading elements."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {headers.map((h, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)]"
              style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
            >
              <Badge
                variant={h.level <= 2 ? 'info' : 'default'}
                className="shrink-0 text-[10px] !px-1.5"
              >
                H{h.level}
              </Badge>
              <span
                className={`text-[var(--m-text-sm)] leading-snug ${levelColors[h.level] || ''}`}
              >
                {h.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
