import { useState, useEffect } from 'react';

interface TabInfo {
  id: number;
  url: string;
  title: string;
  domain: string;
  favIconUrl?: string;
}

export function useCurrentTab() {
  const [tab, setTab] = useState<TabInfo | null>(null);

  useEffect(() => {
    async function loadTab() {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (activeTab?.id && activeTab.url) {
        setTab({
          id: activeTab.id,
          url: activeTab.url,
          title: activeTab.title || '',
          domain: new URL(activeTab.url).hostname,
          favIconUrl: activeTab.favIconUrl,
        });
      }
    }
    loadTab();

    const listener = (message: { action: string; url?: string; tabId?: number }) => {
      if (message.action === 'tabUpdated' && message.url) {
        try {
          setTab((prev) => ({
            id: message.tabId || prev?.id || 0,
            url: message.url!,
            title: prev?.title || '',
            domain: new URL(message.url!).hostname,
            favIconUrl: prev?.favIconUrl,
          }));
        } catch {
          // invalid url
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return tab;
}
