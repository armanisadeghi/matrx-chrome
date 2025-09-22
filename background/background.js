// Background service worker for Matrx extension
console.log('Matrx background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Matrx extension installed');
        
        // Set default configuration
        chrome.storage.sync.set({
            supabaseUrl: '',
            supabaseAnonKey: '',
            supabaseTableName: 'html_extractions',
            userId: ''
        });
        
        // Open options page for initial setup
        chrome.tabs.create({ url: 'options/options.html' });
    }
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
    // Open the side panel for the current tab
    await chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        // Get Supabase configuration
        chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName', 'userId'], (result) => {
            sendResponse({
                url: result.supabaseUrl,
                anonKey: result.supabaseAnonKey,
                tableName: result.supabaseTableName || 'html_extractions',
                userId: result.userId
            });
        });
        return true; // Keep the message channel open
    }
    
    if (request.action === 'saveConfig') {
        // Save Supabase configuration
        chrome.storage.sync.set({
            supabaseUrl: request.config.url,
            supabaseAnonKey: request.config.anonKey,
            supabaseTableName: request.config.tableName || 'html_extractions',
            userId: request.config.userId
        }, () => {
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open
    }
    
    if (request.action === 'copyToClipboard') {
        // Handle copy request from blob URL
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
                // Use the background script's clipboard access
                await navigator.clipboard.writeText(contentToCopy);
                sendResponse({ success: true });
                
                // Clean up old content after successful copy
                setTimeout(() => {
                    chrome.storage.local.remove([request.contentId]);
                }, 5000);
            } catch (error) {
                console.error('Copy failed:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
        return true; // Keep the message channel open for async response
    }
});

// Optional: Add context menu for quick access
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
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { 
            action: 'extractHTML',
            url: tab.url 
        });
    }
}); 