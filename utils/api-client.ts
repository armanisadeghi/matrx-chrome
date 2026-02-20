// ============================================
// Matrx API Client — FastAPI endpoint integration
// REST + SSE streaming for all backend services
// ============================================

import { getAccessToken } from './auth';
import type {
  ApiResponse,
  StreamChunk,
  SseEvent,
  UnifiedChatRequest,
  AgentExecuteRequest,
  QuickScrapeRequest,
  SearchKeywordsRequest,
  SearchAndScrapeRequest,
  ResearchTopic,
  ResearchKeyword,
  ResearchSource,
  ResearchContent,
  ResearchTag,
  ResearchTemplate,
  ResearchSynthesis,
  ResearchDocument,
  ResearchMedia,
  ScrapeQueueItem,
  ToolDefinition,
} from './types';

let baseUrl = '';

export function setApiBaseUrl(url: string) {
  baseUrl = url.replace(/\/$/, '');
}

export async function getApiBaseUrl(): Promise<string> {
  if (baseUrl) return baseUrl;
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiBaseUrl'], (result) => {
      baseUrl = result.apiBaseUrl || '';
      resolve(baseUrl);
    });
  });
}

async function buildHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================
// Core HTTP methods
// ============================================

export async function apiGet<T = unknown>(
  path: string,
): Promise<ApiResponse<T>> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function apiPatch<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function apiDelete<T = unknown>(
  path: string,
): Promise<ApiResponse<T>> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  try {
    const res = await fetch(url, { method: 'DELETE', headers });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `${res.status}: ${text}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// ============================================
// SSE Streaming — reads Server-Sent Events
// ============================================

export async function apiStream(
  path: string,
  body: unknown,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    onChunk({ type: 'error', content: `${res.status}: ${text}` });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onChunk({ type: 'error', content: 'No response body' });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Handle SSE format: data: {...}\n\n
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          onChunk({
            type: 'text',
            content: parsed.content || parsed.text || parsed.delta || '',
          });
        } catch {
          // Non-JSON SSE data, treat as raw text
          onChunk({ type: 'text', content: trimmed.slice(6) });
        }
      } else if (trimmed) {
        // Plain chunked text
        onChunk({ type: 'text', content: trimmed });
      }
    }
  }

  onChunk({ type: 'done', content: '' });
}

// Rich SSE stream — parses full event objects (status, data, completion, error, end)
export async function apiStreamEvents(
  path: string,
  body: unknown,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${await getApiBaseUrl()}${path}`;
  const headers = await buildHeaders();

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    onEvent({ type: 'error', data: { message: `${res.status}: ${text}` } });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onEvent({ type: 'error', data: { message: 'No response body' } });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          onEvent({
            type: parsed.type || 'data',
            data: parsed,
          });
        } catch {
          onEvent({ type: 'data', data: { raw: trimmed.slice(6) } });
        }
      }
    }
  }

  onEvent({ type: 'end', data: {} });
}

// ============================================
// Health
// ============================================

export function healthCheck() {
  return apiGet<{ status: string; service: string; timestamp: string }>('/health/');
}

export function healthCheckDetailed() {
  return apiGet<{ status: string; components: Record<string, unknown> }>('/health/detailed');
}

// ============================================
// AI — Chat & Agent Execution
// ============================================

export function unifiedChat(
  request: UnifiedChatRequest,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
) {
  return apiStream('/ai/chat/unified', request, onChunk, signal);
}

export function executeAgent(
  request: AgentExecuteRequest,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/ai/agent/execute', request, onEvent, signal);
}

export function warmAgent(promptId: string, isBuiltin = false) {
  return apiPost<{ status: string; prompt_id: string }>('/ai/agent/warm', {
    prompt_id: promptId,
    is_builtin: isBuiltin,
  });
}

export function cancelRequest(requestId: string) {
  return apiPost<{ status: string; request_id: string }>(`/ai/cancel/${requestId}`, {});
}

// ============================================
// Scraper
// ============================================

export function quickScrape(
  request: QuickScrapeRequest,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/scraper/quick-scrape', request, onEvent, signal);
}

export function searchKeywords(
  request: SearchKeywordsRequest,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/scraper/search', request, onEvent, signal);
}

export function searchAndScrape(
  request: SearchAndScrapeRequest,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/scraper/search-and-scrape', request, onEvent, signal);
}

export function scraperMicCheck(
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/scraper/mic-check', {}, onEvent, signal);
}

// ============================================
// Tools
// ============================================

export function listTools(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiGet<{ tools: ToolDefinition[]; count: number }>(`/tools/test/list${query}`);
}

export function getToolDetail(toolName: string) {
  return apiGet<{ tool: ToolDefinition }>(`/tools/test/${encodeURIComponent(toolName)}`);
}

export function createToolTestSession() {
  return apiPost<{ conversation_id: string; user_id: string }>('/tools/test/session', {});
}

export function executeToolTest(
  toolName: string,
  args: Record<string, unknown>,
  conversationId: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents('/tools/test/execute', {
    tool_name: toolName,
    arguments: args,
    conversation_id: conversationId,
  }, onEvent, signal);
}

// ============================================
// Research — Templates
// ============================================

export function listTemplates() {
  return apiGet<ResearchTemplate[]>('/research/templates/list');
}

export function createTemplate(template: { name: string; description?: string }) {
  return apiPost<ResearchTemplate>('/research/templates', template);
}

export function getTemplate(templateId: string) {
  return apiGet<ResearchTemplate>(`/research/templates/${templateId}`);
}

// ============================================
// Research — Extension Integration
// ============================================

export function getExtensionScrapeQueue() {
  return apiGet<ScrapeQueueItem[]>('/research/extension/scrape-queue');
}

export function submitExtensionContent(
  topicId: string,
  sourceId: string,
  htmlContent: string,
) {
  return apiPost(`/research/topics/${topicId}/sources/${sourceId}/extension-content`, {
    html_content: htmlContent,
  });
}

// ============================================
// Research — Setup & Suggestions
// ============================================

export function suggestResearchSetup(topicName: string, topicDescription: string) {
  return apiPost('/research/suggest', {
    topic_name: topicName,
    topic_description: topicDescription,
  });
}

// ============================================
// Research — Topics
// ============================================

export function createTopic(projectId: string, topic: { name: string; description?: string }) {
  return apiPost<ResearchTopic>(`/research/projects/${projectId}/topics`, topic);
}

export function listTopics(projectId: string) {
  return apiGet<ResearchTopic[]>(`/research/projects/${projectId}/topics`);
}

export function getTopic(topicId: string) {
  return apiGet<ResearchTopic>(`/research/topics/${topicId}`);
}

export function updateTopic(topicId: string, updates: Partial<ResearchTopic>) {
  return apiPatch<ResearchTopic>(`/research/topics/${topicId}`, updates);
}

// ============================================
// Research — Keywords
// ============================================

export function addKeywords(topicId: string, keywords: string[]) {
  return apiPost<ResearchKeyword[]>(`/research/topics/${topicId}/keywords`, { keywords });
}

export function getKeywords(topicId: string) {
  return apiGet<ResearchKeyword[]>(`/research/topics/${topicId}/keywords`);
}

export function deleteKeyword(topicId: string, keywordId: string) {
  return apiDelete(`/research/topics/${topicId}/keywords/${keywordId}`);
}

// ============================================
// Research — Search & Scrape (SSE streaming)
// ============================================

export function triggerSearch(
  topicId: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(`/research/topics/${topicId}/search`, {}, onEvent, signal);
}

export function triggerScrape(
  topicId: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(`/research/topics/${topicId}/scrape`, {}, onEvent, signal);
}

export function rescrapeSource(
  topicId: string,
  sourceId: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(
    `/research/topics/${topicId}/sources/${sourceId}/rescrape`,
    {},
    onEvent,
    signal,
  );
}

export function runPipeline(
  topicId: string,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(`/research/topics/${topicId}/run`, {}, onEvent, signal);
}

// ============================================
// Research — Sources
// ============================================

export interface SourceFilters {
  keyword_id?: string;
  scrape_status?: string;
  source_type?: string;
  hostname?: string;
  is_included?: boolean;
  origin?: string;
  limit?: number;
  offset?: number;
}

export function getSources(topicId: string, filters?: SourceFilters) {
  const params = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) params.set(key, String(value));
    }
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet<ResearchSource[]>(`/research/topics/${topicId}/sources${query}`);
}

export function updateSource(topicId: string, sourceId: string, updates: Partial<ResearchSource>) {
  return apiPatch<ResearchSource>(`/research/topics/${topicId}/sources/${sourceId}`, updates);
}

export function bulkUpdateSources(
  topicId: string,
  action: 'include' | 'exclude' | 'mark_stale' | 'mark_complete',
  sourceIds: string[],
) {
  return apiPatch<{ updated: number }>(`/research/topics/${topicId}/sources/bulk`, {
    action,
    source_ids: sourceIds,
  });
}

// ============================================
// Research — Content
// ============================================

export function getSourceContent(topicId: string, sourceId: string) {
  return apiGet<ResearchContent[]>(`/research/topics/${topicId}/sources/${sourceId}/content`);
}

export function editContent(topicId: string, contentId: string, content: string) {
  return apiPatch<ResearchContent>(`/research/topics/${topicId}/content/${contentId}`, { content });
}

export function pasteContent(
  topicId: string,
  sourceId: string,
  content: string,
  contentType = 'text/html',
) {
  return apiPost<ResearchContent>(
    `/research/topics/${topicId}/sources/${sourceId}/content`,
    { content, content_type: contentType },
  );
}

// ============================================
// Research — Analysis
// ============================================

export function analyzeSource(
  topicId: string,
  sourceId: string,
  agentType: string,
  agentId?: string,
) {
  return apiPost(`/research/topics/${topicId}/sources/${sourceId}/analyze`, {
    agent_type: agentType,
    agent_id: agentId,
  });
}

export function retryAnalysis(topicId: string, analysisId: string) {
  return apiPost(`/research/topics/${topicId}/analyses/${analysisId}/retry`, {});
}

export function retryAllFailed(topicId: string) {
  return apiPost<{ retried: number }>(`/research/topics/${topicId}/retry-failed`, {});
}

export function analyzeAll(
  topicId: string,
  sourceIds: string[],
  agentType: string,
  agentId: string | undefined,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(
    `/research/topics/${topicId}/analyze-all`,
    { source_ids: sourceIds, agent_type: agentType, agent_id: agentId },
    onEvent,
    signal,
  );
}

// ============================================
// Research — Synthesis & Documents
// ============================================

export function synthesize(
  topicId: string,
  request: { scope: string; keyword_id?: string; iteration_mode?: string; agent_id?: string },
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
) {
  return apiStreamEvents(`/research/topics/${topicId}/synthesize`, request, onEvent, signal);
}

export function getSynthesis(topicId: string, scope: string, keywordId?: string) {
  const params = new URLSearchParams({ scope });
  if (keywordId) params.set('keyword_id', keywordId);
  return apiGet<ResearchSynthesis[]>(`/research/topics/${topicId}/synthesis?${params.toString()}`);
}

export function generateDocument(topicId: string) {
  return apiPost<ResearchDocument>(`/research/topics/${topicId}/document`, {});
}

export function getDocument(topicId: string) {
  return apiGet<ResearchDocument | null>(`/research/topics/${topicId}/document`);
}

export function getDocumentVersions(topicId: string) {
  return apiGet<ResearchDocument[]>(`/research/topics/${topicId}/document/versions`);
}

export function exportDocument(topicId: string, format = 'json') {
  return apiGet(`/research/topics/${topicId}/document/export?format=${format}`);
}

export function getTopicCosts(topicId: string) {
  return apiGet(`/research/topics/${topicId}/costs`);
}

// ============================================
// Research — Tags
// ============================================

export function getTags(topicId: string) {
  return apiGet<ResearchTag[]>(`/research/topics/${topicId}/tags`);
}

export function createTag(topicId: string, name: string, description?: string) {
  return apiPost<ResearchTag>(`/research/topics/${topicId}/tags`, { name, description });
}

export function updateTag(topicId: string, tagId: string, updates: Partial<ResearchTag>) {
  return apiPatch<ResearchTag>(`/research/topics/${topicId}/tags/${tagId}`, updates);
}

export function deleteTag(topicId: string, tagId: string) {
  return apiDelete(`/research/topics/${topicId}/tags/${tagId}`);
}

export function assignTagsToSource(
  topicId: string,
  sourceId: string,
  tagIds: string[],
  isPrimarySource = false,
) {
  return apiPost(`/research/topics/${topicId}/sources/${sourceId}/tags`, {
    tag_ids: tagIds,
    is_primary_source: isPrimarySource,
  });
}

export function consolidateTag(topicId: string, tagId: string) {
  return apiPost(`/research/topics/${topicId}/tags/${tagId}/consolidate`, {});
}

export function suggestTags(topicId: string, sourceId: string) {
  return apiPost(`/research/topics/${topicId}/sources/${sourceId}/suggest-tags`, {});
}

// ============================================
// Research — Links & Media
// ============================================

export function getExtractedLinks(topicId: string) {
  return apiGet(`/research/topics/${topicId}/links`);
}

export function addLinksToScope(topicId: string, urls: string[]) {
  return apiPost(`/research/topics/${topicId}/links/add-to-scope`, { urls });
}

export function getMedia(topicId: string, mediaType?: string, isRelevant?: boolean) {
  const params = new URLSearchParams();
  if (mediaType) params.set('media_type', mediaType);
  if (isRelevant !== undefined) params.set('is_relevant', String(isRelevant));
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet<ResearchMedia[]>(`/research/topics/${topicId}/media${query}`);
}

export function updateMedia(topicId: string, mediaId: string, updates: Partial<ResearchMedia>) {
  return apiPatch<ResearchMedia>(`/research/topics/${topicId}/media/${mediaId}`, updates);
}

export function transcribeSource(topicId: string, sourceId: string) {
  return apiPost(`/research/topics/${topicId}/sources/${sourceId}/transcribe`, {});
}
