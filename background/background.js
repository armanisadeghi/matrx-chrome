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