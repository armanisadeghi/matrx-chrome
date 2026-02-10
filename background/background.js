// Background service worker for Matrx extension
console.log('Matrx background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Matrx extension installed');
        
        // Set default configuration (only user-configurable settings)
        chrome.storage.sync.set({
            supabaseTableName: 'html_extractions',
            socketServerUrl: '',
            geminiApiKey: ''
        });
        
        // Open options page for initial setup
        chrome.tabs.create({ url: 'options/options.html' });
    }
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
    await chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for tab updates (URL changes, page loads)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
        chrome.runtime.sendMessage({
            action: 'tabUpdated',
            tabId: tabId,
            url: tab.url,
            status: changeInfo.status,
            urlChanged: !!changeInfo.url
        }).catch(() => {
            // Side panel might not be open, which is fine
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        // Return user-configurable settings only (auth is handled by lib/auth.js)
        chrome.storage.sync.get(['supabaseTableName', 'socketServerUrl', 'geminiApiKey'], (result) => {
            sendResponse({
                tableName: result.supabaseTableName || 'html_extractions',
                socketServerUrl: result.socketServerUrl || '',
                geminiApiKey: result.geminiApiKey || ''
            });
        });
        return true;
    }
    
    if (request.action === 'copyToClipboard') {
        chrome.storage.local.get([request.contentId], async (result) => {
            const contentData = result[request.contentId];
            if (!contentData) {
                sendResponse({ success: false, error: 'Content not found' });
                return;
            }
            
            const contentToCopy = request.isFormattedView ? contentData.formattedText : contentData.textContent;
            
            if (!contentToCopy || contentToCopy.length === 0) {
                sendResponse({ success: false, error: 'No content available' });
                return;
            }
            
            try {
                await navigator.clipboard.writeText(contentToCopy);
                sendResponse({ success: true });
                
                setTimeout(() => {
                    chrome.storage.local.remove([request.contentId]);
                }, 5000);
            } catch (error) {
                console.error('Copy failed:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
        return true;
    }
});

// Context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extractHTML',
        title: 'Extract with Matrx',
        contexts: ['page']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extractHTML') {
        chrome.tabs.sendMessage(tab.id, { 
            action: 'extractHTML',
            url: tab.url 
        });
    }
});
