import { useState, useEffect } from 'react';
import { Link2, ExternalLink, RefreshCw } from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Badge, EmptyState } from '../ui';
import type { LinkInfo } from '../../utils/types';

export function LinkAnalysis() {
  const tab = useCurrentTab();
  const [links, setLinks] = useState<LinkInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'internal' | 'external'>('all');

  const analyze = async () => {
    if (!tab?.id) return;
    setLoading(true);
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageAnalysis',
        type: 'links',
      });
      if (response.success) {
        setLinks(response.data || []);
      }
    } catch {
      // Page might not be ready
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [tab?.url]);

  const filtered = links.filter((l) => {
    if (filter === 'internal') return !l.isExternal;
    if (filter === 'external') return l.isExternal;
    return true;
  });

  const internalCount = links.filter((l) => !l.isExternal).length;
  const externalCount = links.filter((l) => l.isExternal).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`text-[var(--m-text-xs)] px-2 py-0.5 rounded-[var(--m-radius-full)] cursor-pointer ${filter === 'all' ? 'bg-[var(--m-brand-subtle)] text-[var(--m-brand)]' : 'text-[var(--m-text-tertiary)] hover:text-[var(--m-text-secondary)]'}`}
          >
            All ({links.length})
          </button>
          <button
            onClick={() => setFilter('internal')}
            className={`text-[var(--m-text-xs)] px-2 py-0.5 rounded-[var(--m-radius-full)] cursor-pointer ${filter === 'internal' ? 'bg-[var(--m-brand-subtle)] text-[var(--m-brand)]' : 'text-[var(--m-text-tertiary)] hover:text-[var(--m-text-secondary)]'}`}
          >
            Internal ({internalCount})
          </button>
          <button
            onClick={() => setFilter('external')}
            className={`text-[var(--m-text-xs)] px-2 py-0.5 rounded-[var(--m-radius-full)] cursor-pointer ${filter === 'external' ? 'bg-[var(--m-brand-subtle)] text-[var(--m-brand)]' : 'text-[var(--m-text-tertiary)] hover:text-[var(--m-text-secondary)]'}`}
          >
            External ({externalCount})
          </button>
        </div>
        <Button size="sm" variant="ghost" icon onClick={analyze} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Link2 className="w-8 h-8" />}
          title="No links found"
        />
      ) : (
        <div className="flex flex-col gap-0.5 max-h-[400px] overflow-auto">
          {filtered.map((link, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] group"
            >
              {link.isExternal ? (
                <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-[var(--m-text-tertiary)]" />
              ) : (
                <Link2 className="w-3 h-3 shrink-0 mt-0.5 text-[var(--m-text-tertiary)]" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[var(--m-text-sm)] text-[var(--m-brand)] truncate">
                  {link.text || '(no text)'}
                </span>
                <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)] truncate">
                  {link.href}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
