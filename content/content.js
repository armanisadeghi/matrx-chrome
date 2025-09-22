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
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'Content script is ready' });
        return true;
    }
    
    if (request.action === 'extractHTML') {
        handleHTMLExtraction(request.url)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        // Keep the message channel open for async response
        return true;
    }
    
    if (request.action === 'copyFullHTML') {
        handleFullHTMLCopy()
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
    
    if (request.action === 'copySmartHTML') {
        handleSmartHTMLCopy()
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
    
    if (request.action === 'copyCustomSmartHTML') {
        handleCustomSmartHTMLCopy()
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
    
    if (request.action === 'extractCustomRange') {
        handleCustomRangeExtraction(request.startMarker, request.endMarker)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
    
    if (request.action === 'testHtmlMarker') {
        handleTestHtmlMarker(request.marker, request.type)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
});

async function handleHTMLExtraction(url) {
    try {
        // Extract HTML content (this always works)
        const htmlContent = document.documentElement.outerHTML;
        const pageTitle = document.title;
        const extractedAt = new Date().toISOString();
        
        // Get meta information
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
        
        // Try to get user ID, but don't require it
        let userId = null;
        try {
            userId = await getUserId();
        } catch (error) {
            console.warn('Could not get user ID, continuing without it:', error);
        }
        
        // Prepare data for Supabase (if available)
        const extractionData = {
            url: url,
            title: pageTitle,
            html_content: htmlContent,
            meta_description: metaDescription,
            meta_keywords: metaKeywords,
            content_length: htmlContent.length,
            extracted_at: extractedAt,
            user_agent: navigator.userAgent,
            user_id: userId // Can be null
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

        // Try to send to Supabase (optional, the core functionality should work even if this fails)
        let supabaseResult = { success: false, error: 'Supabase not configured' };
        try {
            supabaseResult = await sendToSupabase(extractionData);
        } catch (error) {
            console.warn('Supabase upload failed, continuing anyway:', error);
            supabaseResult = { success: false, error: error.message };
        }
        
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
                socketConnected: socketConnected,
                savedToDatabase: true
            };
        } else {
            // Even if database save fails, we still extracted the HTML successfully
            console.warn('Database save failed, but extraction was successful:', supabaseResult.error);
            
            return {
                success: true,
                size: htmlContent.length,
                title: pageTitle,
                id: 'not-saved',
                socketConnected: socketConnected,
                savedToDatabase: false,
                warning: `HTML extracted successfully but not saved to database: ${supabaseResult.error}`
            };
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
            console.warn('Supabase configuration not found - skipping database save');
            return {
                success: false,
                error: 'Supabase not configured. Please configure your Supabase settings to save extractions to database.'
            };
        }

        // Get authentication headers if available
        let authHeaders = {
            'Content-Type': 'application/json',
            'apikey': config.anonKey,
            'Prefer': 'return=representation'
        };

        // Try to get auth token from supabaseAuth if available
        try {
            if (typeof window !== 'undefined' && window.supabaseAuth && window.supabaseAuth.isAuthenticated()) {
                const additionalHeaders = await window.supabaseAuth.getAuthHeaders();
                authHeaders = { ...authHeaders, ...additionalHeaders };
                console.log('Using authenticated request to Supabase');
            } else {
                // Use anon key as fallback
                authHeaders['Authorization'] = `Bearer ${config.anonKey}`;
                console.log('Using anonymous request to Supabase');
            }
        } catch (error) {
            console.warn('Failed to get auth headers, using anon key:', error);
            authHeaders['Authorization'] = `Bearer ${config.anonKey}`;
        }

        const response = await fetch(`${config.url}/rest/v1/${config.tableName || 'html_extractions'}`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase API error:', response.status, errorText);
            return {
                success: false,
                error: `Database error: ${response.status} - ${errorText}`
            };
        }

        const result = await response.json();
        console.log('Successfully saved to Supabase:', result[0]?.id);
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
        chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName'], (result) => {
            resolve({
                url: result.supabaseUrl,
                anonKey: result.supabaseAnonKey,
                tableName: result.supabaseTableName || 'html_extractions'
            });
        });
    });
}

async function getUserId() {
    try {
        // Try to get user ID from authentication first
        if (typeof window !== 'undefined' && window.supabaseAuth && window.supabaseAuth.isAuthenticated()) {
            const authUserId = await window.supabaseAuth.getUserId();
            if (authUserId) {
                return authUserId;
            }
        }
    } catch (error) {
        console.warn('Failed to get authenticated user ID:', error);
    }
    
    // Fallback to stored user ID (legacy support)
    try {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['userId'], (result) => {
                resolve(result.userId || null);
            });
        });
    } catch (error) {
        console.warn('Failed to get stored user ID:', error);
        return null;
    }
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

async function handleFullHTMLCopy() {
    try {
        const htmlContent = document.documentElement.outerHTML;
        
        return {
            success: true,
            html: htmlContent,
            size: htmlContent.length
        };
    } catch (error) {
        console.error('Full HTML copy failed:', error);
        throw error;
    }
}

async function handleSmartHTMLCopy() {
    try {
        const smartHTML = extractSmartHTML();
        
        return {
            success: true,
            html: smartHTML,
            size: smartHTML.length
        };
    } catch (error) {
        console.error('Smart HTML copy failed:', error);
        throw error;
    }
}

async function handleCustomSmartHTMLCopy() {
    try {
        const customSmartHTML = extractCustomSmartHTML();
        
        return {
            success: true,
            html: customSmartHTML,
            size: customSmartHTML.length
        };
    } catch (error) {
        console.error('Custom Smart HTML copy failed:', error);
        throw error;
    }
}

function extractSmartHTML() {
    // Create a clone of the document to manipulate without affecting the original
    const docClone = document.cloneNode(true);
    
    // Remove navigation, header, footer, and sidebar elements first
    const navigationSelectors = [
        'nav', 'header', 'footer', 'aside',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', '[role="complementary"]',
        '.nav', '.navigation', '.navbar', '.menu', '.header', '.footer', '.sidebar', '.aside',
        '#nav', '#navigation', '#navbar', '#menu', '#header', '#footer', '#sidebar', '#aside',
        '.site-header', '.site-footer', '.site-nav', '.main-nav', '.primary-nav', '.secondary-nav',
        '.breadcrumb', '.breadcrumbs', '.pagination', '.pager',
        '.social', '.social-links', '.social-media', '.share', '.sharing',
        '.advertisement', '.ads', '.ad', '.banner-ad', '.sponsored',
        '.cookie-notice', '.cookie-banner', '.gdpr-notice',
        '.newsletter', '.subscription', '.signup', '.subscribe'
    ];
    
    navigationSelectors.forEach(selector => {
        try {
            const elements = docClone.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        } catch (e) {
            // Ignore selector errors and continue
        }
    });
    
    // Remove scripts and other unwanted elements
    const elementsToRemove = [
        'script',
        'noscript', 
        'style',
        'link[rel="stylesheet"]',
        'meta[name="viewport"]',
        'meta[charset]',
        'meta[http-equiv]',
        'meta[name="generator"]',
        'meta[name="robots"]',
        'title' // Keep title in head but we'll add it back in a cleaner way
    ];
    
    elementsToRemove.forEach(selector => {
        const elements = docClone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // Remove comments
    removeComments(docClone);
    
    // Clean up head - keep only essential meta tags
    const head = docClone.querySelector('head');
    if (head) {
        // Keep only essential meta tags
        const essentialMeta = head.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"], meta[name="author"]');
        const title = document.querySelector('title');
        
        // Clear head and add back only essential elements
        head.innerHTML = '';
        
        // Add back title
        if (title) {
            const newTitle = docClone.createElement('title');
            newTitle.textContent = title.textContent;
            head.appendChild(newTitle);
        }
        
        // Add back essential meta tags
        essentialMeta.forEach(meta => {
            head.appendChild(meta.cloneNode(true));
        });
    }
    
    // Remove empty attributes and clean up body
    const body = docClone.querySelector('body');
    if (body) {
        cleanupElement(body);
    }
    
    // Remove data attributes that are typically not needed for content
    const allElements = docClone.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove data attributes except for important ones
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && 
                !attr.name.startsWith('data-id') && 
                !attr.name.startsWith('data-content') &&
                !attr.name.startsWith('data-src')) {
                el.removeAttribute(attr.name);
            }
        });
        
        // Remove event handlers
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
        
        // Remove empty class and id attributes
        if (el.getAttribute('class') === '') {
            el.removeAttribute('class');
        }
        if (el.getAttribute('id') === '') {
            el.removeAttribute('id');
        }
    });
    
    return docClone.documentElement.outerHTML;
}

function extractCustomSmartHTML() {
    // First, look for div with class="entry-content"
    const entryContentDiv = document.querySelector('div.entry-content');
    
    if (!entryContentDiv) {
        // If entry-content not found, fall back to regular Smart HTML
        console.log('entry-content div not found, falling back to Smart HTML');
        return extractSmartHTML();
    }
    
    console.log('Found entry-content div, extracting custom content');
    
    // Clone the entry-content div to manipulate without affecting original
    const entryClone = entryContentDiv.cloneNode(true);
    
    // Look for div with id="related-content" within the cloned content
    const relatedContentDiv = entryClone.querySelector('div[id="related-content"]');
    
    if (relatedContentDiv) {
        console.log('Found related-content div, removing it and everything after');
        // Remove the related-content div and all its siblings that come after it
        let currentElement = relatedContentDiv;
        while (currentElement) {
            const nextSibling = currentElement.nextSibling;
            currentElement.remove();
            currentElement = nextSibling;
        }
    }
    
    // Apply the same smart cleaning as regular Smart HTML
    cleanupCustomElement(entryClone);
    
    // Create a minimal HTML document with just the custom content
    const customDoc = document.implementation.createHTMLDocument('Custom Content');
    
    // Add essential meta tags to head
    const head = customDoc.querySelector('head');
    const title = document.querySelector('title');
    if (title) {
        const newTitle = customDoc.createElement('title');
        newTitle.textContent = title.textContent;
        head.appendChild(newTitle);
    }
    
    // Add essential meta tags from original document
    const essentialMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"], meta[name="author"]');
    essentialMeta.forEach(meta => {
        head.appendChild(meta.cloneNode(true));
    });
    
    // Replace body content with our custom content
    const body = customDoc.querySelector('body');
    body.innerHTML = '';
    body.appendChild(entryClone);
    
    return customDoc.documentElement.outerHTML;
}

function cleanupCustomElement(element) {
    // Remove scripts and other unwanted elements from the custom content
    const elementsToRemove = [
        'script',
        'noscript', 
        'style'
    ];
    
    elementsToRemove.forEach(selector => {
        const elements = element.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // Remove comments
    removeComments(element);
    
    // Remove data attributes and event handlers (same as Smart HTML)
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove data attributes except for important ones
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && 
                !attr.name.startsWith('data-id') && 
                !attr.name.startsWith('data-content') &&
                !attr.name.startsWith('data-src')) {
                el.removeAttribute(attr.name);
            }
        });
        
        // Remove event handlers
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
        
        // Remove empty class and id attributes
        if (el.getAttribute('class') === '') {
            el.removeAttribute('class');
        }
        if (el.getAttribute('id') === '') {
            el.removeAttribute('id');
        }
    });
    
    // Clean up empty elements and whitespace
    cleanupElement(element);
}

function removeComments(node) {
    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_COMMENT,
        null,
        false
    );
    
    const comments = [];
    let comment;
    while (comment = walker.nextNode()) {
        comments.push(comment);
    }
    
    comments.forEach(comment => {
        comment.parentNode.removeChild(comment);
    });
}

function cleanupElement(element) {
    // Remove empty text nodes and unnecessary whitespace
    const childNodes = Array.from(element.childNodes);
    childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Trim whitespace and remove if empty
            node.textContent = node.textContent.trim();
            if (node.textContent === '') {
                node.remove();
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively clean child elements
            cleanupElement(node);
            
            // Remove elements that are empty and not self-closing
            const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
            if (!selfClosingTags.includes(node.tagName.toLowerCase()) && 
                node.innerHTML.trim() === '' && 
                !node.hasAttributes()) {
                node.remove();
            }
        }
    });
}

async function handleTestHtmlMarker(marker, type) {
    try {
        // Get the HTML content of the entire page
        const pageHtml = document.documentElement.outerHTML;
        
        if (!pageHtml) {
            throw new Error('No HTML content found on the page');
        }
        
        // Find all occurrences of the marker in the HTML
        const positions = [];
        let searchPos = 0;
        
        while (true) {
            const pos = pageHtml.indexOf(marker, searchPos);
            if (pos === -1) break;
            positions.push(pos);
            searchPos = pos + 1;
        }
        
        if (positions.length === 0) {
            return {
                success: false,
                error: `${type === 'start' ? 'Start' : 'End'} marker not found in HTML: "${marker.substring(0, 50)}${marker.length > 50 ? '...' : ''}"`
            };
        }
        
        console.log(`HTML marker test successful: ${positions.length} matches found`);
        
        return {
            success: true,
            count: positions.length,
            positions: positions,
            marker: marker,
            type: type
        };
        
    } catch (error) {
        console.error('HTML marker test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function handleCustomRangeExtraction(startMarker, endMarker) {
    try {
        // Get the HTML content of the entire page
        const pageHtml = document.documentElement.outerHTML;
        
        if (!pageHtml) {
            throw new Error('No HTML content found on the page');
        }
        
        // Find start marker position in HTML
        const startPos = pageHtml.indexOf(startMarker);
        if (startPos === -1) {
            throw new Error(`Start marker not found in HTML: "${startMarker.substring(0, 50)}${startMarker.length > 50 ? '...' : ''}"`);
        }
        
        // Find end marker position after start position in HTML
        const endPos = pageHtml.indexOf(endMarker, startPos + startMarker.length);
        if (endPos === -1) {
            throw new Error(`End marker not found after start marker in HTML: "${endMarker.substring(0, 50)}${endMarker.length > 50 ? '...' : ''}"`);
        }
        
        // Extract HTML content between markers (including the start marker, excluding the end marker)
        const extractedHtml = pageHtml.substring(startPos, endPos + endMarker.length);
        
        if (!extractedHtml) {
            throw new Error('No HTML content found between the specified markers');
        }
        
        // Clean up the extracted HTML by creating a minimal document structure
        const cleanedHtml = createMinimalHtmlDocument(extractedHtml, startMarker, endMarker);
        
        console.log(`Custom range HTML extraction successful: ${cleanedHtml.length} characters`);
        
        return {
            success: true,
            content: cleanedHtml,
            size: cleanedHtml.length,
            startPosition: startPos,
            endPosition: endPos
        };
        
    } catch (error) {
        console.error('Custom range HTML extraction failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

function createMinimalHtmlDocument(extractedHtml, startMarker, endMarker) {
    // Create a minimal HTML document with the extracted content
    const title = document.title || 'Custom Range Content';
    
    // Get essential meta tags from the original document
    const metaDescription = document.querySelector('meta[name="description"]')?.outerHTML || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.outerHTML || '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${metaDescription}
    ${metaKeywords}
</head>
<body>
${extractedHtml}
</body>
</html>`;
} 