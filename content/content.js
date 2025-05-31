// Content script that runs on all web pages
console.log('Matrx content script loaded');

// Initialize socket client (completely optional)
let socketClient = null;

// Try to initialize socket client, but don't let it break anything
async function initializeSocket() {
    try {
        // Import the socket client (non-blocking)
        await import(chrome.runtime.getURL('socket/socket-client.js'));
        
        // Give it a moment to initialize, but don't wait for it
        setTimeout(() => {
            try {
                if (window.ExtensionSocketClient) {
                    socketClient = new window.ExtensionSocketClient();
                    socketClient.initialize();
                    console.log('Socket client initialized successfully');
                }
            } catch (error) {
                console.warn('Socket client initialization failed, continuing without it:', error);
                socketClient = null;
            }
        }, 100);
    } catch (error) {
        console.warn('Socket import failed, continuing without socket functionality:', error);
        socketClient = null;
    }
}

// Initialize socket when script loads (but don't wait for it)
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

        // Try to emit to Socket.IO server (optional, non-blocking)
        let socketConnected = false;
        try {
            if (socketClient && socketClient.isConnected) {
                console.log('Emitting extraction event to server...');
                socketClient.emitHtmlExtraction(extractionData);
                socketConnected = true;
            } else {
                console.log('Socket not connected, skipping socket emission');
            }
        } catch (error) {
            console.warn('Socket emission failed, continuing anyway:', error);
        }

        // Send to Supabase (this is the core functionality that must work)
        const supabaseResult = await sendToSupabase(extractionData);
        
        if (supabaseResult.success) {
            // Try to emit successful save event to socket (optional)
            try {
                if (socketClient && socketClient.isConnected) {
                    socketClient.emitExtractionSaved(extractionData, supabaseResult);
                }
            } catch (error) {
                console.warn('Socket save emission failed:', error);
            }

            return {
                success: true,
                size: htmlContent.length,
                title: pageTitle,
                id: supabaseResult.id,
                socketConnected: socketConnected
            };
        } else {
            throw new Error(supabaseResult.error);
        }
        
    } catch (error) {
        console.error('HTML extraction failed:', error);
        
        // Try to emit error event to socket (optional)
        try {
            if (socketClient && socketClient.isConnected) {
                socketClient.emitExtractionError(error, url);
            }
        } catch (socketError) {
            console.warn('Socket error emission failed:', socketError);
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

// Listen for socket messages from background script (optional)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'socketMessage') {
        try {
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
        } catch (error) {
            console.warn('Socket message handling failed:', error);
        }
    }
});

function handleExtractionProcessed(data) {
    try {
        // Could show a notification or update UI
        console.log('Extraction processed by Python backend:', data);
        
        // Example: Show a subtle notification
        if (data.success) {
            showNotification('✅ Page processed successfully by backend', 'success');
        }
    } catch (error) {
        console.warn('Extraction processed handler failed:', error);
    }
}

function handleAnalysisComplete(data) {
    try {
        console.log('Analysis complete:', data);
        showNotification('🔍 Analysis complete', 'info');
    } catch (error) {
        console.warn('Analysis complete handler failed:', error);
    }
}

function showNotification(message, type = 'info') {
    try {
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
    } catch (error) {
        console.warn('Notification display failed:', error);
    }
} 