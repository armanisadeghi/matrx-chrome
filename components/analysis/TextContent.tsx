import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Copy, Check } from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Badge, EmptyState } from '../ui';

export function TextContent() {
  const tab = useCurrentTab();
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyze = async () => {
    if (!tab?.id) return;
    setLoading(true);
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageAnalysis',
        type: 'text',
      });
      if (response.success) {
        setText(response.data?.text || '');
        setWordCount(response.data?.wordCount || 0);
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

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text && !loading) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="No text content"
        description="Navigate to a page to extract text content."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge>{wordCount.toLocaleString()} words</Badge>
          <span className="text-xs text-[color:var(--m-text-tertiary)]">
            {(text.length / 1024).toFixed(1)} KB
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon onClick={copyText}>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[var(--m-success)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button size="sm" variant="ghost" icon onClick={analyze} loading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)] p-3 max-h-[500px] overflow-auto">
        <p className="text-sm text-[color:var(--m-text-secondary)] whitespace-pre-wrap leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
