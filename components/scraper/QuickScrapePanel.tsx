import { useState, useRef, useEffect } from 'react';
import {
  Download,
  Loader2,
  Globe,
  StopCircle,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Plus,
  X,
} from 'lucide-react';
import { quickScrape, pasteContent, listTopics, getSources } from '../../utils/api-client';
import { fetchUserProjects } from '../../utils/supabase-queries';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentTab } from '../../hooks/useCurrentTab';
import { Button, EmptyState, Badge } from '../ui';
import type { SseEvent, ResearchTopic } from '../../utils/types';

interface ScrapeResult {
  url: string;
  status: 'pending' | 'scraping' | 'done' | 'error';
  content?: string;
  charCount?: number;
  error?: string;
}

export function QuickScrapePanel() {
  const { isAuthenticated } = useAuth();
  const tab = useCurrentTab();
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [scraping, setScraping] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // "Add to Research" state
  const [showAddToResearch, setShowAddToResearch] = useState<ScrapeResult | null>(null);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Fetch user projects on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProjects().then(setProjects);
    }
  }, [isAuthenticated]);

  // Fetch topics when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      listTopics(selectedProjectId).then((res) => {
        if (res.success && res.data) setTopics(res.data);
      });
    } else {
      setTopics([]);
    }
  }, [selectedProjectId]);

  const scrapeCurrentPage = async () => {
    if (!tab?.url) return;
    await runScrape([tab.url]);
  };

  const scrapeUrls = async () => {
    const urlList = urls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));
    if (urlList.length === 0) return;
    await runScrape(urlList);
  };

  const runScrape = async (urlList: string[]) => {
    setScraping(true);
    setResults(urlList.map((url) => ({ url, status: 'pending' })));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await quickScrape(
        {
          urls: urlList,
          use_cache: true,
          stream: true,
          get_text_data: true,
          get_links: true,
          get_overview: true,
        },
        (event: SseEvent) => {
          if (event.type === 'data' && event.data.url) {
            const url = event.data.url as string;
            setResults((prev) =>
              prev.map((r) =>
                r.url === url
                  ? {
                      ...r,
                      status: event.data.error ? 'error' : 'done',
                      content: (event.data.text_data as string) || (event.data.content as string),
                      charCount: (event.data.char_count as number) || ((event.data.text_data as string)?.length ?? 0),
                      error: event.data.error as string | undefined,
                    }
                  : r,
              ),
            );
          } else if (event.type === 'status') {
            const url = event.data.url as string;
            if (url) {
              setResults((prev) =>
                prev.map((r) => (r.url === url ? { ...r, status: 'scraping' } : r)),
              );
            }
          }
        },
        controller.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResults((prev) =>
          prev.map((r) =>
            r.status === 'pending' || r.status === 'scraping'
              ? { ...r, status: 'error', error: 'Scrape failed' }
              : r,
          ),
        );
      }
    } finally {
      setScraping(false);
      abortRef.current = null;
    }
  };

  const stopScraping = () => {
    abortRef.current?.abort();
    setScraping(false);
  };

  const copyResult = (result: ScrapeResult) => {
    if (result.content) {
      navigator.clipboard.writeText(result.content);
    }
  };

  const submitToResearch = async () => {
    if (!showAddToResearch?.content || !selectedTopicId) return;
    setSubmitting(true);
    setSubmitStatus('idle');

    // First, find if there's already a source for this URL in the topic
    const sourcesRes = await getSources(selectedTopicId, { limit: 200 });
    const existingSource = sourcesRes.data?.find(
      (s) => s.url === showAddToResearch.url,
    );

    if (existingSource) {
      // Submit content to existing source
      const res = await pasteContent(
        selectedTopicId,
        existingSource.id,
        showAddToResearch.content!,
        'text/html',
      );
      setSubmitStatus(res.success ? 'success' : 'error');
    } else {
      // No existing source — paste as new content (backend may auto-create source)
      // For now, show a message that the URL needs to be added as a source first
      setSubmitStatus('error');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Globe className="w-10 h-10" />}
        title="Sign in Required"
        description="Sign in to use the scraper to fetch and extract content from web pages."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Scrape current page */}
      <div className="bg-[var(--m-bg-card)] rounded-[var(--m-radius-lg)] border border-[var(--m-border)] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
            Current Page
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={scrapeCurrentPage}
            disabled={scraping || !tab?.url}
          >
            {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Scrape
          </Button>
        </div>
        <p className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] truncate">
          {tab?.url || 'No page loaded'}
        </p>
      </div>

      {/* Batch scrape */}
      <div className="bg-[var(--m-bg-card)] rounded-[var(--m-radius-lg)] border border-[var(--m-border)] p-3">
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)] block mb-2">
          Batch Scrape
        </span>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Paste URLs here (one per line)..."
          rows={4}
          className="w-full px-3 py-2 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-md)] text-[var(--m-text-primary)] placeholder:text-[var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)] resize-none"
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="primary" onClick={scrapeUrls} disabled={scraping || !urls.trim()}>
            {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Scrape All
          </Button>
          {scraping && (
            <Button size="sm" variant="secondary" onClick={stopScraping}>
              <StopCircle className="w-3.5 h-3.5" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
            Results ({results.filter((r) => r.status === 'done').length}/{results.length})
          </span>
          {results.map((result, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 bg-[var(--m-bg-card)] rounded-[var(--m-radius-md)] border border-[var(--m-border)]"
            >
              {result.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-[var(--m-success-text)] shrink-0" />}
              {result.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-[var(--m-error)] shrink-0" />}
              {result.status === 'scraping' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--m-brand)] shrink-0" />}
              {result.status === 'pending' && <Globe className="w-3.5 h-3.5 text-[var(--m-text-tertiary)] shrink-0" />}
              <span className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] truncate flex-1">
                {new URL(result.url).hostname}
              </span>
              {result.charCount !== undefined && (
                <Badge variant="info">{Math.round(result.charCount / 1024)}KB</Badge>
              )}
              {result.status === 'done' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyResult(result)}
                    className="text-[var(--m-text-xs)] text-[var(--m-brand)] hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setShowAddToResearch(result);
                      setSubmitStatus('idle');
                    }}
                    className="text-[var(--m-text-xs)] text-[var(--m-success-text)] hover:underline cursor-pointer flex items-center gap-0.5"
                    title="Add to research topic"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Research
                  </button>
                </div>
              )}
              {result.error && (
                <span className="text-[var(--m-text-xs)] text-[var(--m-error)]">{result.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add to Research Modal */}
      {showAddToResearch && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowAddToResearch(null)}
          />
          <div className="fixed inset-x-3 top-1/4 z-50 bg-[var(--m-bg-card)] border border-[var(--m-border)] rounded-[var(--m-radius-lg)] shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--m-brand)]" />
                <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)]">
                  Add to Research
                </span>
              </div>
              <button
                onClick={() => setShowAddToResearch(null)}
                className="p-1 rounded-[var(--m-radius-sm)] hover:bg-[var(--m-bg-hover)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[var(--m-text-tertiary)]" />
              </button>
            </div>

            <p className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] truncate mb-3">
              {showAddToResearch.url}
            </p>

            {/* Project selector */}
            <label className="block mb-2">
              <span className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] mb-1 block">
                Project
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full px-2 py-1.5 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[var(--m-text-primary)] focus:outline-none focus:border-[var(--m-brand)]"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Topic selector */}
            <label className="block mb-3">
              <span className="text-[var(--m-text-xs)] text-[var(--m-text-secondary)] mb-1 block">
                Research Topic
              </span>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={!selectedProjectId || topics.length === 0}
                className="w-full px-2 py-1.5 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[var(--m-text-primary)] focus:outline-none focus:border-[var(--m-brand)] disabled:opacity-50"
              >
                <option value="">Select topic...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Status messages */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-1.5 mb-3 p-2 bg-[var(--m-success-subtle)] rounded-[var(--m-radius-sm)]">
                <CheckCircle className="w-3.5 h-3.5 text-[var(--m-success-text)]" />
                <span className="text-[var(--m-text-xs)] text-[var(--m-success-text)]">
                  Content submitted to research topic
                </span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-1.5 mb-3 p-2 bg-[var(--m-error-subtle)] rounded-[var(--m-radius-sm)]">
                <AlertCircle className="w-3.5 h-3.5 text-[var(--m-error)]" />
                <span className="text-[var(--m-text-xs)] text-[var(--m-error)]">
                  URL not found as a source in this topic. Add it as a source first via the Research tab.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={submitToResearch}
                disabled={!selectedTopicId || submitting || submitStatus === 'success'}
                loading={submitting}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Submit Content
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddToResearch(null)}>
                {submitStatus === 'success' ? 'Done' : 'Cancel'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
