import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  FileText,
  Eye,
  EyeOff,
  Tag,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  getSourceContent,
  updateSource,
  rescrapeSource,
  getTags,
  assignTagsToSource,
  suggestTags,
} from '../../utils/api-client';
import { Button, Badge } from '../ui';
import type { ResearchSource, ResearchContent, ResearchTag, SseEvent } from '../../utils/types';

interface SourceDetailViewProps {
  topicId: string;
  source: ResearchSource;
  onBack: () => void;
  onSourceUpdated: (source: ResearchSource) => void;
}

export function SourceDetailView({ topicId, source, onBack, onSourceUpdated }: SourceDetailViewProps) {
  const [content, setContent] = useState<ResearchContent[]>([]);
  const [tags, setTags] = useState<ResearchTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescraping, setRescraping] = useState(false);
  const [rescrapStatus, setRescrapStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [loadingTags, setLoadingTags] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);

  useEffect(() => {
    loadData();
  }, [source.id]);

  const loadData = async () => {
    setLoading(true);
    const [contentRes, tagRes] = await Promise.all([
      getSourceContent(topicId, source.id),
      getTags(topicId),
    ]);
    if (contentRes.success && contentRes.data) setContent(contentRes.data);
    if (tagRes.success && tagRes.data) setTags(tagRes.data);
    setLoading(false);
  };

  const handleToggleIncluded = async () => {
    const res = await updateSource(topicId, source.id, { is_included: !source.is_included });
    if (res.success && res.data) onSourceUpdated(res.data);
  };

  const handleRescrape = async () => {
    setRescraping(true);
    setRescrapStatus('Starting rescrape...');
    await rescrapeSource(
      topicId,
      source.id,
      (event: SseEvent) => {
        if (event.type === 'status') {
          setRescrapStatus((event.data.message as string) || 'Scraping...');
        }
      },
    );
    setRescraping(false);
    setRescrapStatus('');
    // Reload content after rescrape
    const contentRes = await getSourceContent(topicId, source.id);
    if (contentRes.success && contentRes.data) setContent(contentRes.data);
  };

  const handleSuggestTags = async () => {
    setSuggestingTags(true);
    const res = await suggestTags(topicId, source.id);
    if (res.success) {
      // Reload tags after suggestion
      const tagRes = await getTags(topicId);
      if (tagRes.success && tagRes.data) setTags(tagRes.data);
    }
    setSuggestingTags(false);
  };

  const handleAssignTag = async (tagId: string) => {
    setLoadingTags(true);
    await assignTagsToSource(topicId, source.id, [tagId]);
    setLoadingTags(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(source.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentContent = content.find((c) => c.is_current);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--m-border)]">
        <Button size="sm" variant="ghost" icon onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[var(--m-text-sm)] font-medium text-[var(--m-text-primary)] truncate flex-1">
          {source.title || source.hostname || 'Source'}
        </span>
        <Badge
          variant={
            source.scrape_status === 'scraped' ? 'success'
              : source.scrape_status === 'failed' ? 'error'
              : 'default'
          }
        >
          {source.scrape_status}
        </Badge>
      </div>

      {/* Rescrape status */}
      {rescraping && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--m-brand-subtle)] border-b border-[var(--m-border)]">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--m-brand)]" />
          <span className="text-[var(--m-text-xs)] text-[var(--m-brand)]">{rescrapStatus}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--m-brand)]" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* URL & Meta */}
            <div className="p-2.5 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)]">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--m-text-xs)] text-[var(--m-brand)] hover:underline truncate flex-1"
                >
                  {source.url}
                </a>
                <button onClick={copyUrl} className="p-1 hover:bg-[var(--m-bg-hover)] rounded cursor-pointer transition-colors">
                  {copied ? <Check className="w-3 h-3 text-[var(--m-success)]" /> : <Copy className="w-3 h-3 text-[var(--m-text-tertiary)]" />}
                </button>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[var(--m-bg-hover)] rounded cursor-pointer transition-colors">
                  <ExternalLink className="w-3 h-3 text-[var(--m-text-tertiary)]" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2 text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                <span>Type: {source.source_type}</span>
                <span>Origin: {source.origin}</span>
                {source.hostname && <span>Host: {source.hostname}</span>}
                {source.rank != null && <span>Rank: {source.rank}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={handleToggleIncluded}>
                {source.is_included ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {source.is_included ? 'Exclude' : 'Include'}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleRescrape} disabled={rescraping} loading={rescraping}>
                <RefreshCw className="w-3.5 h-3.5" />
                Rescrape
              </Button>
              <Button size="sm" variant="secondary" onClick={handleSuggestTags} disabled={suggestingTags} loading={suggestingTags}>
                <Tag className="w-3.5 h-3.5" />
                Suggest Tags
              </Button>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)] mb-1 block">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAssignTag(tag.id)}
                      disabled={loadingTags}
                      className="px-2 py-0.5 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] text-[var(--m-text-secondary)] rounded-[var(--m-radius-full)] hover:bg-[var(--m-brand-subtle)] hover:text-[var(--m-brand)] cursor-pointer transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content versions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[var(--m-text-tertiary)]" />
                <span className="text-[var(--m-text-xs)] font-medium text-[var(--m-text-primary)]">
                  Content ({content.length} version{content.length !== 1 ? 's' : ''})
                </span>
              </div>

              {content.length === 0 ? (
                <div className="p-3 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)] text-center">
                  <AlertTriangle className="w-5 h-5 text-[var(--m-text-tertiary)] mx-auto mb-1" />
                  <p className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                    No content captured yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {content.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-[var(--m-radius-md)] border ${
                        c.is_current
                          ? 'border-[var(--m-brand)] bg-[var(--m-brand-subtle)]'
                          : 'border-[var(--m-border)] bg-[var(--m-bg-card)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={c.is_current ? 'success' : 'default'}>
                            v{c.version}
                          </Badge>
                          <Badge variant={c.is_good_scrape ? 'success' : 'warning'}>
                            {c.is_good_scrape ? 'Good' : 'Poor'}
                          </Badge>
                          <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                            {c.char_count.toLocaleString()} chars
                          </span>
                        </div>
                        <span className="text-[var(--m-text-xs)] text-[var(--m-text-tertiary)]">
                          {c.capture_method}
                        </span>
                      </div>

                      {c.failure_reason && (
                        <p className="text-[var(--m-text-xs)] text-[var(--m-error)] mb-1">
                          {c.failure_reason}
                        </p>
                      )}

                      {/* Content preview */}
                      {c.content && (
                        <div>
                          <button
                            onClick={() => setExpandedContent(expandedContent === c.id ? null : c.id)}
                            className="text-[var(--m-text-xs)] text-[var(--m-brand)] hover:underline cursor-pointer"
                          >
                            {expandedContent === c.id ? 'Hide content' : 'Show content'}
                          </button>
                          {expandedContent === c.id && (
                            <pre className="mt-1 p-2 text-[var(--m-text-xs)] bg-[var(--m-bg-inset)] rounded-[var(--m-radius-sm)] overflow-auto max-h-[200px] whitespace-pre-wrap break-words">
                              {c.content.slice(0, 5000)}
                              {c.content.length > 5000 && '\n... (truncated)'}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
