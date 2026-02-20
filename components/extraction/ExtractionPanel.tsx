import { useState } from 'react';
import {
  FileText,
  Sparkles,
  Target,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Card, CardBody, StatusMessage, Badge } from '../ui';
import type { ExtractionMethod } from '../../utils/types';

interface ExtractionResult {
  html: string;
  size: number;
  method: ExtractionMethod;
}

export function ExtractionPanel() {
  const tab = useCurrentTab();
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const extract = async (method: ExtractionMethod) => {
    if (!tab?.id) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const actionMap: Record<ExtractionMethod, string> = {
      full: 'copyFullHTML',
      smart: 'copySmartHTML',
      'custom-smart': 'copyCustomSmartHTML',
      'custom-range': 'extractCustomRange',
    };

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: actionMap[method],
      });
      if (response.success) {
        setResult({
          html: response.html || response.content || '',
          size: response.size || 0,
          method,
        });
      } else {
        setError(response.error || 'Extraction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to communicate with page');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.html) return;
    try {
      await navigator.clipboard.writeText(result.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback via background
      chrome.runtime.sendMessage({ action: 'copyToClipboard', text: result.html });
    }
  };

  const downloadAsFile = () => {
    if (!result?.html) return;
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab?.domain || 'page'}-extraction.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          onClick={() => extract('full')}
          loading={loading}
          className="text-[11px]"
        >
          <FileText className="w-3.5 h-3.5" />
          Full HTML
        </Button>
        <Button
          variant="primary"
          onClick={() => extract('smart')}
          loading={loading}
          className="text-[11px]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Smart HTML
        </Button>
        <Button
          variant="secondary"
          onClick={() => extract('custom-smart')}
          loading={loading}
          className="text-[11px]"
        >
          <Target className="w-3.5 h-3.5" />
          Custom Smart
        </Button>
        <Button
          variant="secondary"
          onClick={() => extract('custom-range')}
          loading={loading}
          className="text-[11px]"
        >
          <Target className="w-3.5 h-3.5" />
          Custom Range
        </Button>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {result && (
        <Card>
          <CardBody className="!p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">Extracted</Badge>
                <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                  {(result.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" icon onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[var(--m-success)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button size="sm" variant="ghost" icon onClick={downloadAsFile}>
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <pre className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] bg-[var(--m-bg-inset)] p-2 rounded-[var(--m-radius-sm)] max-h-[200px] overflow-auto whitespace-pre-wrap break-words">
              {result.html.substring(0, 2000)}
              {result.html.length > 2000 && '\n\n... (truncated)'}
            </pre>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
