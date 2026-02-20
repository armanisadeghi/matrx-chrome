import { useState, useEffect } from 'react';
import { Target, Play, Search, Copy, Check } from 'lucide-react';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, Input, Card, CardBody, StatusMessage, Badge } from '../ui';

export function CustomRangePanel() {
  const tab = useCurrentTab();
  const [startMarker, setStartMarker] = useState('');
  const [endMarker, setEndMarker] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load saved markers for this domain
  useEffect(() => {
    if (!tab?.domain) return;
    chrome.storage.local.get([`markers_${tab.domain}`], (data) => {
      const saved = data[`markers_${tab.domain}`];
      if (saved) {
        setStartMarker(saved.start || '');
        setEndMarker(saved.end || '');
      }
    });
  }, [tab?.domain]);

  const saveMarkers = () => {
    if (!tab?.domain) return;
    chrome.storage.local.set({
      [`markers_${tab.domain}`]: { start: startMarker, end: endMarker },
    });
  };

  const testMarker = async (marker: string, type: 'start' | 'end') => {
    if (!tab?.id || !marker) return;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'testHtmlMarker',
        marker,
        type,
      });
      if (response.success) {
        setTestResult(`${type} marker found ${response.count} time(s)`);
      } else {
        setTestResult(response.error || 'Marker not found');
      }
    } catch {
      setTestResult('Could not communicate with page');
    }
  };

  const extract = async () => {
    if (!tab?.id || !startMarker || !endMarker) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractCustomRange',
        startMarker,
        endMarker,
      });
      if (response.success) {
        setResult(response.content);
        setResultSize(response.size);
        saveMarkers();
      } else {
        setError(response.error || 'Extraction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-1">
          <div className="flex-1">
            <Input
              label="Start Marker"
              placeholder='e.g., <div class="content">'
              value={startMarker}
              onChange={(e) => setStartMarker(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon
            onClick={() => testMarker(startMarker, 'start')}
            title="Test marker"
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-end gap-1">
          <div className="flex-1">
            <Input
              label="End Marker"
              placeholder='e.g., <div id="footer">'
              value={endMarker}
              onChange={(e) => setEndMarker(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon
            onClick={() => testMarker(endMarker, 'end')}
            title="Test marker"
          >
            <Search className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {testResult && (
        <StatusMessage type="info">{testResult}</StatusMessage>
      )}

      <Button variant="primary" onClick={extract} loading={loading} block>
        <Target className="w-4 h-4" />
        Extract Range
      </Button>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {result && (
        <Card>
          <CardBody className="!p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="success">{(resultSize / 1024).toFixed(1)} KB</Badge>
              <Button size="sm" variant="ghost" icon onClick={copyToClipboard}>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[var(--m-success)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <pre className="text-xs text-[color:var(--m-text-secondary)] bg-[var(--m-bg-inset)] p-2 rounded-[var(--m-radius-sm)] max-h-[200px] overflow-auto whitespace-pre-wrap break-words">
              {result.substring(0, 2000)}
              {result.length > 2000 && '\n\n... (truncated)'}
            </pre>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
