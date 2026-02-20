// Background Service Worker — Message hub for all extension contexts
import { initAuth, isAuthenticated, getAccessToken } from '../../utils/auth';
import { getApiBaseUrl } from '../../utils/api-client';
import type { ScrapeQueueItem } from '../../utils/types';

const ALARM_SCRAPE_QUEUE = 'matrx-scrape-queue-poll';

// In-memory scrape queue cache
let scrapeQueue: ScrapeQueueItem[] = [];

export default defineBackground(() => {
  console.log('[Matrx] Background service worker loaded');

  // Handle extension installation
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.storage.sync.set({
        supabaseTableName: 'html_extractions',
        apiBaseUrl: '',
        theme: 'dark',
      });
      chrome.tabs.create({ url: chrome.runtime.getURL('/options.html') });
    }

    // Context menu
    chrome.contextMenus.create({
      id: 'extractHTML',
      title: 'Extract with Matrx',
      contexts: ['page'],
    });
  });

  // Open side panel on icon click
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Initialize auth and start scrape queue polling
  initAuth().then(() => {
    if (isAuthenticated()) {
      refreshScrapeQueue();
      startQueuePolling();
    }
  });

  // Handle alarm-based polling (survives service worker restarts)
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_SCRAPE_QUEUE) {
      refreshScrapeQueue();
    }
  });

  // Re-check auth state when storage changes (user signs in/out)
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === 'local') {
      initAuth().then(() => {
        if (isAuthenticated()) {
          refreshScrapeQueue();
          startQueuePolling();
        } else {
          stopQueuePolling();
          scrapeQueue = [];
          chrome.action.setBadgeText({ text: '' });
        }
      });
    }
  });

  // Tab updates — notify side panel + check scrape queue
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
      chrome.runtime.sendMessage({
        action: 'tabUpdated',
        tabId,
        url: tab.url,
        status: changeInfo.status,
        urlChanged: !!changeInfo.url,
      }).catch(() => {
        // Side panel might not be open
      });

      // Check if this URL is in the scrape queue
      if (tab.url && changeInfo.status === 'complete') {
        checkUrlAgainstQueue(tab.url, tabId);
      }
    }
  });

  // Tab activated — check scrape queue for the new active tab
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      checkUrlAgainstQueue(tab.url, activeInfo.tabId);
    }
  });

  // Message routing
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'getConfig') {
      chrome.storage.sync.get(
        ['supabaseTableName', 'apiBaseUrl', 'theme'],
        (result) => {
          sendResponse({
            tableName: result.supabaseTableName || 'html_extractions',
            apiBaseUrl: result.apiBaseUrl || '',
            theme: result.theme || 'dark',
          });
        },
      );
      return true;
    }

    if (request.action === 'copyToClipboard') {
      if (request.text) {
        navigator.clipboard.writeText(request.text).then(
          () => sendResponse({ success: true }),
          (err: Error) => sendResponse({ success: false, error: err.message }),
        );
        return true;
      }
    }

    // Side panel can request the current scrape queue
    if (request.action === 'getScrapeQueue') {
      sendResponse({ queue: scrapeQueue });
      return true;
    }

    // Side panel can request a queue refresh
    if (request.action === 'refreshScrapeQueue') {
      refreshScrapeQueue().then(() => {
        sendResponse({ queue: scrapeQueue });
      });
      return true;
    }

    // Check if a specific URL matches the queue
    if (request.action === 'checkQueueMatch') {
      const match = findQueueMatch(request.url);
      sendResponse({ match });
      return true;
    }

    return false;
  });

  // Context menu click
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractHTML' && tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'extractHTML',
        url: tab.url,
      });
    }
  });
});

// --- Scrape Queue Functions ---

async function refreshScrapeQueue(): Promise<void> {
  if (!isAuthenticated()) return;

  try {
    const baseUrl = await getApiBaseUrl();
    if (!baseUrl) return;

    const token = await getAccessToken();
    if (!token) return;

    const res = await fetch(`${baseUrl}/research/extension/scrape-queue`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      scrapeQueue = Array.isArray(data) ? data : (data.data || []);

      // Update badge with pending count
      const pendingCount = scrapeQueue.filter(
        (item) => item.status === 'pending',
      ).length;
      chrome.action.setBadgeText({
        text: pendingCount > 0 ? String(pendingCount) : '',
      });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
    }
  } catch {
    // Silently fail — network might be unavailable
  }
}

function findQueueMatch(url: string): ScrapeQueueItem | null {
  if (!url) return null;
  const normalize = (u: string) => {
    try {
      const parsed = new URL(u);
      return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`;
    } catch {
      return u;
    }
  };
  const normalized = normalize(url);
  return (
    scrapeQueue.find(
      (item) =>
        item.status === 'pending' && normalize(item.url) === normalized,
    ) || null
  );
}

function checkUrlAgainstQueue(url: string, tabId: number): void {
  const match = findQueueMatch(url);
  if (match) {
    // Set a per-tab badge indicator
    chrome.action.setBadgeText({ text: '!', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b', tabId });

    // Notify the side panel about the match
    chrome.runtime.sendMessage({
      action: 'scrapeQueueMatch',
      match,
      tabId,
      url,
    }).catch(() => {
      // Side panel might not be open
    });
  } else {
    // Clear per-tab badge (restore global badge)
    const pendingCount = scrapeQueue.filter(
      (item) => item.status === 'pending',
    ).length;
    chrome.action.setBadgeText({
      text: pendingCount > 0 ? String(pendingCount) : '',
      tabId,
    });
  }
}

function startQueuePolling(): void {
  // chrome.alarms persists across service worker restarts
  chrome.alarms.create(ALARM_SCRAPE_QUEUE, { periodInMinutes: 5 });
}

function stopQueuePolling(): void {
  chrome.alarms.clear(ALARM_SCRAPE_QUEUE);
}
