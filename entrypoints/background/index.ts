// Background Service Worker — Message hub for all extension contexts
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

  // Tab updates — notify side panel
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
        // Use offscreen document or fallback
        navigator.clipboard.writeText(request.text).then(
          () => sendResponse({ success: true }),
          (err) => sendResponse({ success: false, error: err.message }),
        );
        return true;
      }
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
