import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  RefreshCw,
  Loader2,
  Search,
  Download,
  Zap,
  FileText,
  Tag,
  ArrowLeft,
  Plus,
  X,
  DollarSign,
  ScrollText,
} from 'lucide-react';
import {
  listTopics,
  createTopic,
  getKeywords,
  addKeywords,
  deleteKeyword,
  getSources,
  getTags,
  createTag,
  deleteTag,
  getDocument,
  generateDocument,
  exportDocument,
  getTopicCosts,
  triggerSearch,
  triggerScrape,
  runPipeline,
  suggestResearchSetup,
} from '../../utils/api-client';
import { fetchUserProjects } from '../../utils/supabase-queries';
import { useAuth } from '../../hooks/useAuth';
import { getLocal, setLocal } from '../../utils/storage';
import { Button, EmptyState, Badge } from '../ui';
import { SourceDetailView } from './SourceDetailView';
import type { ResearchTopic, ResearchKeyword, ResearchSource, ResearchTag, ResearchDocument, SseEvent } from '../../utils/types';

const STORAGE_KEY_PROJECT = 'matrx_default_project_id';

type View = 'topics' | 'new-topic' | 'topic-detail' | 'source-detail';

export function ResearchPanel() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>('topics');
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectId, setProjectId] = useState('');
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ResearchTopic | null>(null);
  const [keywords, setKeywords] = useState<ResearchKeyword[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [addingKeyword, setAddingKeyword] = useState(false);
  // Tags
  const [tags, setTags] = useState<ResearchTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  // Document & costs
  const [document, setDocument] = useState<ResearchDocument | null>(null);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [costs, setCosts] = useState<Record<string, unknown> | null>(null);
  // New topic form
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [creatingSuggestions, setCreatingSuggestions] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load projects and restore saved project selection
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const [userProjects, savedProjectId] = await Promise.all([
        fetchUserProjects(),
        getLocal<string>(STORAGE_KEY_PROJECT),
      ]);
      setProjects(userProjects);
      if (savedProjectId && userProjects.some((p) => p.id === savedProjectId)) {
        setProjectId(savedProjectId);
      } else if (userProjects.length === 1) {
        setProjectId(userProjects[0].id);
      }
    })();
  }, [isAuthenticated]);

  // Persist project selection
  useEffect(() => {
    if (projectId) {
      setLocal(STORAGE_KEY_PROJECT, projectId);
    }
  }, [projectId]);

  const fetchTopics = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await listTopics(projectId);
    if (res.success && res.data) {
      setTopics(res.data);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      fetchTopics();
    }
  }, [isAuthenticated, projectId, fetchTopics]);

  const openTopic = async (topic: ResearchTopic) => {
    setSelectedTopic(topic);
    setView('topic-detail');
    setLoading(true);

    const [kwRes, srcRes, tagRes, docRes, costRes] = await Promise.all([
      getKeywords(topic.id),
      getSources(topic.id, { limit: 50 }),
      getTags(topic.id),
      getDocument(topic.id),
      getTopicCosts(topic.id),
    ]);

    if (kwRes.success && kwRes.data) setKeywords(kwRes.data);
    if (srcRes.success && srcRes.data) setSources(srcRes.data);
    if (tagRes.success && tagRes.data) setTags(tagRes.data);
    if (docRes.success) setDocument(docRes.data || null);
    if (costRes.success && costRes.data) setCosts(costRes.data as Record<string, unknown>);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!selectedTopic) return;
    setRunning('search');
    setStatusMessage('Searching...');
    const controller = new AbortController();
    abortRef.current = controller;

    await triggerSearch(
      selectedTopic.id,
      (event: SseEvent) => {
        if (event.type === 'status') {
          setStatusMessage((event.data.message as string) || 'Searching...');
        }
      },
      controller.signal,
    );

    setRunning(null);
    setStatusMessage('');
    const srcRes = await getSources(selectedTopic.id, { limit: 50 });
    if (srcRes.success && srcRes.data) setSources(srcRes.data);
  };

  const handleAddKeyword = async () => {
    if (!selectedTopic || !newKeyword.trim()) return;
    setAddingKeyword(true);
    const res = await addKeywords(selectedTopic.id, [newKeyword.trim()]);
    if (res.success) {
      // Refresh keywords
      const kwRes = await getKeywords(selectedTopic.id);
      if (kwRes.success && kwRes.data) setKeywords(kwRes.data);
      setNewKeyword('');
    }
    setAddingKeyword(false);
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    if (!selectedTopic) return;
    await deleteKeyword(selectedTopic.id, keywordId);
    setKeywords((prev) => prev.filter((kw) => kw.id !== keywordId));
  };

  const handleAddTag = async () => {
    if (!selectedTopic || !newTagName.trim()) return;
    setAddingTag(true);
    const res = await createTag(selectedTopic.id, newTagName.trim());
    if (res.success && res.data) {
      setTags((prev) => [...prev, res.data!]);
      setNewTagName('');
    }
    setAddingTag(false);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!selectedTopic) return;
    await deleteTag(selectedTopic.id, tagId);
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleGenerateDocument = async () => {
    if (!selectedTopic) return;
    setGeneratingDoc(true);
    const res = await generateDocument(selectedTopic.id);
    if (res.success && res.data) setDocument(res.data);
    setGeneratingDoc(false);
  };

  const handleExportDocument = async () => {
    if (!selectedTopic) return;
    const res = await exportDocument(selectedTopic.id, 'json');
    if (res.success && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${selectedTopic.name.replace(/\s+/g, '_')}_document.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!newTopicName.trim()) return;
    setCreatingSuggestions(true);
    setSuggestedKeywords([]);
    setSelectedSuggestions(new Set());
    try {
      const res = await suggestResearchSetup(newTopicName.trim(), newTopicDescription.trim());
      if (res.success && res.data) {
        const data = res.data as { keywords?: string[] };
        const kws = data.keywords || [];
        setSuggestedKeywords(kws);
        setSelectedSuggestions(new Set(kws)); // Select all by default
      }
    } catch {
      // Suggestion failed silently — user can still create without them
    }
    setCreatingSuggestions(false);
  };

  const toggleSuggestion = (kw: string) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const handleCreateTopic = async () => {
    if (!projectId || !newTopicName.trim()) return;
    setCreatingTopic(true);
    const res = await createTopic(projectId, {
      name: newTopicName.trim(),
      description: newTopicDescription.trim() || undefined,
    });
    if (res.success && res.data) {
      const topic = res.data;
      // Add selected keywords if any
      const kws = Array.from(selectedSuggestions);
      if (kws.length > 0) {
        await addKeywords(topic.id, kws);
      }
      // Reset form state
      setNewTopicName('');
      setNewTopicDescription('');
      setSuggestedKeywords([]);
      setSelectedSuggestions(new Set());
      // Open the new topic
      setView('topics');
      await fetchTopics();
      openTopic(topic);
    }
    setCreatingTopic(false);
  };

  const handleScrape = async () => {
    if (!selectedTopic) return;
    setRunning('scrape');
    setStatusMessage('Scraping...');
    const controller = new AbortController();
    abortRef.current = controller;

    await triggerScrape(
      selectedTopic.id,
      (event: SseEvent) => {
        if (event.type === 'status') {
          setStatusMessage((event.data.message as string) || 'Scraping...');
        }
      },
      controller.signal,
    );

    setRunning(null);
    setStatusMessage('');
    const srcRes = await getSources(selectedTopic.id, { limit: 50 });
    if (srcRes.success && srcRes.data) setSources(srcRes.data);
  };

  const handleRunPipeline = async () => {
    if (!selectedTopic) return;
    setRunning('pipeline');
    setStatusMessage('Running full pipeline...');
    const controller = new AbortController();
    abortRef.current = controller;

    await runPipeline(
      selectedTopic.id,
      (event: SseEvent) => {
        if (event.type === 'status') {
          setStatusMessage((event.data.message as string) || 'Running...');
        }
      },
      controller.signal,
    );

    setRunning(null);
    setStatusMessage('');
    // Refresh both keywords and sources after pipeline
    const [kwRes, srcRes] = await Promise.all([
      getKeywords(selectedTopic.id),
      getSources(selectedTopic.id, { limit: 50 }),
    ]);
    if (kwRes.success && kwRes.data) setKeywords(kwRes.data);
    if (srcRes.success && srcRes.data) setSources(srcRes.data);
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<BookOpen className="w-10 h-10" />}
        title="Sign in Required"
        description="Sign in to access your research projects and manage topics."
      />
    );
  }

  // Topic list view
  if (view === 'topics') {
    return (
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
            Research Topics
          </span>
          <div className="flex items-center gap-2">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-[160px] px-2 py-1 text-xs bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[color:var(--m-text-primary)] focus:outline-none focus:border-[var(--m-brand)]"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button size="sm" variant="ghost" icon onClick={() => setView('new-topic')} disabled={!projectId} title="New topic">
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" icon onClick={fetchTopics} disabled={loading || !projectId}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {!projectId && (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="Select a Project"
            description={
              projects.length === 0
                ? 'No projects found. Create a project in the Matrx web app first.'
                : 'Choose a project above to load research topics.'
            }
          />
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--m-brand)]" />
          </div>
        )}

        {!loading && projectId && topics.length === 0 && (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="No Topics"
            description="No research topics found for this project."
          />
        )}

        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => openTopic(topic)}
            className="flex items-center gap-3 p-3 bg-[var(--m-bg-card)] rounded-[var(--m-radius-lg)] border border-[var(--m-border)] hover:bg-[var(--m-bg-hover)] transition-colors text-left cursor-pointer w-full"
          >
            <BookOpen className="w-4 h-4 text-[var(--m-brand)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[color:var(--m-text-primary)] truncate">
                {topic.name}
              </p>
              {topic.description && (
                <p className="text-xs text-[color:var(--m-text-tertiary)] truncate">
                  {topic.description}
                </p>
              )}
            </div>
            <Badge variant={topic.status === 'active' ? 'success' : 'default'}>
              {topic.status}
            </Badge>
            <ChevronRight className="w-4 h-4 text-[color:var(--m-text-tertiary)] shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  // New topic form
  if (view === 'new-topic') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--m-border)]">
          <Button size="sm" variant="ghost" icon onClick={() => setView('topics')}>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
            New Research Topic
          </span>
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-[color:var(--m-text-primary)] mb-1">
                Topic Name
              </label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g., Machine Learning in Healthcare"
                className="w-full px-2.5 py-1.5 text-sm bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[color:var(--m-text-primary)] placeholder:text-[color:var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[color:var(--m-text-primary)] mb-1">
                Description (optional)
              </label>
              <textarea
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                placeholder="Brief description of your research goals..."
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[color:var(--m-text-primary)] placeholder:text-[color:var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)] resize-none"
              />
            </div>

            {/* AI Keyword Suggestions */}
            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSuggestKeywords}
                disabled={!newTopicName.trim() || creatingSuggestions}
                loading={creatingSuggestions}
              >
                <Zap className="w-3.5 h-3.5" />
                Suggest Keywords
              </Button>

              {suggestedKeywords.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-[color:var(--m-text-tertiary)] mb-1.5">
                    Click to toggle — selected keywords will be added to the topic:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedKeywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => toggleSuggestion(kw)}
                        className={`px-2 py-0.5 text-xs font-medium rounded-[var(--m-radius-full)] cursor-pointer transition-colors ${
                          selectedSuggestions.has(kw)
                            ? 'bg-[var(--m-brand-subtle)] text-[var(--m-brand)] ring-1 ring-[var(--m-brand)]'
                            : 'bg-[var(--m-bg-inset)] text-[color:var(--m-text-tertiary)] line-through'
                        }`}
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleCreateTopic}
              disabled={!newTopicName.trim() || creatingTopic}
              loading={creatingTopic}
            >
              <Plus className="w-3.5 h-3.5" />
              Create Topic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Source detail view
  if (view === 'source-detail' && selectedSource && selectedTopic) {
    return (
      <SourceDetailView
        topicId={selectedTopic.id}
        source={selectedSource}
        onBack={() => setView('topic-detail')}
        onSourceUpdated={(updated) => {
          setSelectedSource(updated);
          setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />
    );
  }

  // Topic detail view
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--m-border)]">
        <Button size="sm" variant="ghost" icon onClick={() => setView('topics')}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="text-sm font-medium text-[color:var(--m-text-primary)] truncate">
          {selectedTopic?.name}
        </span>
        <Badge variant={selectedTopic?.status === 'active' ? 'success' : 'default'}>
          {selectedTopic?.status}
        </Badge>
      </div>

      {/* Status bar */}
      {running && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--m-brand-subtle)] border-b border-[var(--m-border)]">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--m-brand)]" />
          <span className="text-xs text-[var(--m-brand)]">{statusMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--m-brand)]" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={handleSearch} disabled={!!running}>
                <Search className="w-3.5 h-3.5" />
                Search
              </Button>
              <Button size="sm" variant="secondary" onClick={handleScrape} disabled={!!running}>
                <Download className="w-3.5 h-3.5" />
                Scrape
              </Button>
              <Button size="sm" variant="primary" onClick={handleRunPipeline} disabled={!!running}>
                <Zap className="w-3.5 h-3.5" />
                Full Pipeline
              </Button>
            </div>

            {/* Keywords */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
                  Keywords ({keywords.length})
                </span>
              </div>
              {/* Add keyword input */}
              <div className="flex items-center gap-1.5 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                  }}
                  placeholder="Add keyword..."
                  className="flex-1 px-2 py-1 text-xs bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[color:var(--m-text-primary)] placeholder:text-[color:var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)]"
                />
                <Button
                  size="sm"
                  variant="primary"
                  icon
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim() || addingKeyword}
                  loading={addingKeyword}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw) => (
                  <span
                    key={kw.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-[var(--m-radius-full)] ${
                      kw.is_stale
                        ? 'bg-[var(--m-warning-subtle)] text-[var(--m-warning-text)]'
                        : 'bg-[var(--m-bg-inset)] text-[color:var(--m-text-secondary)]'
                    }`}
                  >
                    {kw.keyword}
                    {kw.result_count > 0 && ` (${kw.result_count})`}
                    <button
                      onClick={() => handleDeleteKeyword(kw.id)}
                      className="p-0.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
                      title="Remove keyword"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {keywords.length === 0 && (
                  <span className="text-xs text-[color:var(--m-text-tertiary)]">
                    No keywords yet
                  </span>
                )}
              </div>
            </div>

            {/* Sources summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
                  Sources ({sources.length})
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <Badge variant="success">
                  {sources.filter((s) => s.scrape_status === 'scraped').length} scraped
                </Badge>
                <Badge variant="warning">
                  {sources.filter((s) => s.scrape_status === 'pending').length} pending
                </Badge>
                <Badge variant="error">
                  {sources.filter((s) => s.scrape_status === 'failed').length} failed
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[300px] overflow-auto">
                {sources.slice(0, 20).map((source) => (
                  <button
                    key={source.id}
                    onClick={() => {
                      setSelectedSource(source);
                      setView('source-detail');
                    }}
                    className="flex items-center gap-2 p-2 bg-[var(--m-bg-card)] rounded-[var(--m-radius-sm)] border border-[var(--m-border)] hover:bg-[var(--m-bg-hover)] cursor-pointer transition-colors text-left w-full"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[color:var(--m-text-primary)] truncate">
                        {source.title || source.hostname}
                      </p>
                      <p className="text-xs text-[color:var(--m-text-tertiary)] truncate">
                        {source.url}
                      </p>
                    </div>
                    <Badge
                      variant={
                        source.scrape_status === 'scraped'
                          ? 'success'
                          : source.scrape_status === 'failed'
                            ? 'error'
                            : 'default'
                      }
                    >
                      {source.scrape_status}
                    </Badge>
                  </button>
                ))}
                {sources.length > 20 && (
                  <p className="text-xs text-[color:var(--m-text-tertiary)] text-center py-1">
                    +{sources.length - 20} more sources
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
                  Tags ({tags.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-2 py-1 text-xs bg-[var(--m-bg-inset)] border border-[var(--m-border)] rounded-[var(--m-radius-sm)] text-[color:var(--m-text-primary)] placeholder:text-[color:var(--m-text-tertiary)] focus:outline-none focus:border-[var(--m-brand)]"
                />
                <Button
                  size="sm"
                  variant="primary"
                  icon
                  onClick={handleAddTag}
                  disabled={!newTagName.trim() || addingTag}
                  loading={addingTag}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-[var(--m-radius-full)] bg-[var(--m-brand-subtle)] text-[var(--m-brand)]"
                  >
                    {tag.name}
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="p-0.5 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
                      title="Remove tag"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-[color:var(--m-text-tertiary)]">
                    No tags yet
                  </span>
                )}
              </div>
            </div>

            {/* Document */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
                  Document
                </span>
              </div>
              {document ? (
                <div className="p-2.5 bg-[var(--m-bg-card)] rounded-[var(--m-radius-md)] border border-[var(--m-border)]">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={document.is_current ? 'success' : 'default'}>
                      v{document.version || 1}
                    </Badge>
                    <span className="text-xs text-[color:var(--m-text-tertiary)]">
                      {new Date(document.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {document.content && (
                    <p className="text-xs text-[color:var(--m-text-secondary)] line-clamp-3 mb-2">
                      {(document.content as string).slice(0, 200)}...
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleGenerateDocument} disabled={generatingDoc} loading={generatingDoc}>
                      <RefreshCw className="w-3 h-3" />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleExportDocument}>
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3">
                  <p className="text-xs text-[color:var(--m-text-tertiary)]">
                    No document generated yet
                  </p>
                  <Button size="sm" variant="primary" onClick={handleGenerateDocument} disabled={generatingDoc} loading={generatingDoc}>
                    <ScrollText className="w-3.5 h-3.5" />
                    Generate Document
                  </Button>
                </div>
              )}
            </div>

            {/* Costs */}
            {costs && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-[color:var(--m-text-tertiary)]" />
                  <span className="text-sm font-medium text-[color:var(--m-text-primary)]">
                    Costs
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--m-bg-inset)] rounded-[var(--m-radius-md)] text-xs flex flex-col gap-1">
                  {Object.entries(costs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[color:var(--m-text-tertiary)] capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[color:var(--m-text-primary)] font-medium">
                        {typeof value === 'number' ? `$${value.toFixed(4)}` : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
