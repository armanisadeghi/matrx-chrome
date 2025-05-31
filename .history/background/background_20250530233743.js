// Background service worker for HTML Extractor extension
console.log('HTML Extractor background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('HTML Extractor extension installed');
        
        // Set default configuration
        chrome.storage.sync.set({
            supabaseUrl: '',
            supabaseAnonKey: '',
            supabaseTableName: 'html_extractions'
        });
        
        // Open options page for initial setup
        chrome.tabs.create({ url: 'options/options.html' });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        // Get Supabase configuration
        chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName'], (result) => {
            sendResponse({
                url: result.supabaseUrl,
                anonKey: result.supabaseAnonKey,
                tableName: result.supabaseTableName || 'html_extractions'
            });
        });
        return true; // Keep the message channel open
    }
    
    if (request.action === 'saveConfig') {
        // Save Supabase configuration
        chrome.storage.sync.set({
            supabaseUrl: request.config.url,
            supabaseAnonKey: request.config.anonKey,
            supabaseTableName: request.config.tableName || 'html_extractions'
        }, () => {
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open
    }
});

// Optional: Add context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extractHTML',
        title: 'Extract HTML to Supabase',
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