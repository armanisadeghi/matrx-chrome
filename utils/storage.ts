// ============================================
// Chrome Storage Helpers
// ============================================

import type { ExtensionSettings } from './types';

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ['apiBaseUrl', 'supabaseTableName', 'theme'],
      (result) => {
        resolve({
          apiBaseUrl: result.apiBaseUrl || '',
          supabaseTableName: result.supabaseTableName || 'html_extractions',
          theme: result.theme || 'dark',
        });
      },
    );
  });
}

export async function saveSettings(
  settings: Partial<ExtensionSettings>,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(settings, resolve);
  });
}

export async function getLocal<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? null);
    });
  });
}

export async function setLocal(
  key: string,
  value: unknown,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function removeLocal(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], resolve);
  });
}
