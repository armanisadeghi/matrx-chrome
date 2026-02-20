// ============================================
// Matrx API Client — FastAPI endpoint integration
// Replaces Socket.IO with REST + SSE streaming
// ============================================

import { getAccessToken } from './auth';
import type { ApiResponse, StreamChunk } from './types';

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

// Standard REST calls
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

// Streaming endpoint — reads SSE/chunked responses
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
