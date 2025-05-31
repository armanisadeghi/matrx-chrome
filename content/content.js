// Content script that runs on all web pages
console.log('HTML Extractor content script loaded');

// Initialize socket client
let socketClient = null;

// Import and initialize socket client
async function initializeSocket() {
    try {
        // Import the socket client
        await import(chrome.runtime.getURL('socket/socket-client.js'));
        
        // Give it a moment to initialize
        setTimeout(() => {
            if (window.ExtensionSocketClient) {
                socketClient = new window.ExtensionSocketClient();
                socketClient.initialize();
                console.log('Socket client initialized in content script');
            }
        }, 100);
    } catch (error) {
        console.warn('Socket client initialization failed:', error);
        // Continue without socket functionality
    }
}

// Initialize socket when script loads
initializeSocket();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractHTML') {
        handleHTMLExtraction(request.url)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        // Keep the message channel open for async response
        return true;
    }
});

async function handleHTMLExtraction(url) {
    try {
        // Get configuration first to check if user_id is set
        const config = await getSupabaseConfig();
        
        if (!config.userId) {
            throw new Error('User ID not configured. Please set your User ID in extension settings.');
        }

        // Extract HTML content
        const htmlContent = document.documentElement.outerHTML;
        const pageTitle = document.title;
        const extractedAt = new Date().toISOString();
        
        // Get meta information
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
        
        // Prepare data for Supabase
        const extractionData = {
            url: url,
            title: pageTitle,
            html_content: htmlContent,
            meta_description: metaDescription,
            meta_keywords: metaKeywords,
            content_length: htmlContent.length,
            extracted_at: extractedAt,
            user_agent: navigator.userAgent,
            user_id: config.userId
        };

        // Emit to Socket.IO server BEFORE saving to Supabase
        if (socketClient && socketClient.isConnected) {
            console.log('Emitting extraction event to server...');
            socketClient.emitHtmlExtraction(extractionData);
        } else {
            console.warn('Socket not connected, extraction will not be sent to backend');
        }

        // Send to Supabase
        const supabaseResult = await sendToSupabase(extractionData);
        
        if (supabaseResult.success) {
            // Emit successful save event to socket
            if (socketClient && socketClient.isConnected) {
                socketClient.emitExtractionSaved(extractionData, supabaseResult);
            }

            return {
                success: true,
                size: htmlContent.length,
                title: pageTitle,
                id: supabaseResult.id,
                socketConnected: socketClient ? socketClient.isConnected : false
            };
        } else {
            throw new Error(supabaseResult.error);
        }
        
    } catch (error) {
        console.error('HTML extraction failed:', error);
        
        // Emit error event to socket
        if (socketClient && socketClient.isConnected) {
            socketClient.emitExtractionError(error, url);
        }
        
        throw error;
    }
}

async function sendToSupabase(data) {
    try {
        // Get Supabase configuration from storage
        const config = await getSupabaseConfig();
        
        if (!config.url || !config.anonKey) {
            throw new Error('Supabase configuration not found. Please configure your Supabase settings.');
        }

        const response = await fetch(`${config.url}/rest/v1/${config.tableName || 'html_extractions'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.anonKey}`,
                'apikey': config.anonKey,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return {
            success: true,
            id: result[0]?.id || 'unknown'
        };
        
    } catch (error) {
        console.error('Supabase upload failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getSupabaseConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName', 'userId'], (result) => {
            resolve({
                url: result.supabaseUrl,
                anonKey: result.supabaseAnonKey,
                tableName: result.supabaseTableName || 'html_extractions',
                userId: result.userId
            });
        });
    });
}

// Listen for socket messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'socketMessage') {
        console.log('Received socket message:', request.type, request.data);
        
        // Handle different types of socket messages
        switch (request.type) {
            case 'extraction_processed':
                handleExtractionProcessed(request.data);
                break;
            case 'analysis_complete':
                handleAnalysisComplete(request.data);
                break;
            default:
                console.log('Unknown socket message type:', request.type);
        }
    }
});

function handleExtractionProcessed(data) {
    // Could show a notification or update UI
    console.log('Extraction processed by Python backend:', data);
    
    // Example: Show a subtle notification
    if (data.success) {
        showNotification('✅ Page processed successfully by backend', 'success');
    }
}

function handleAnalysisComplete(data) {
    console.log('Analysis complete:', data);
    showNotification('🔍 Analysis complete', 'info');
}

function showNotification(message, type = 'info') {
    // Create a simple notification overlay
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
} 