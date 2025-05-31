// Content script that runs on all web pages
console.log('HTML Extractor content script loaded');

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
        // Get configuration first to ensure user_id is available
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
            user_id: config.userId,
            url: url,
            title: pageTitle,
            html_content: htmlContent,
            meta_description: metaDescription,
            meta_keywords: metaKeywords,
            content_length: htmlContent.length,
            extracted_at: extractedAt,
            user_agent: navigator.userAgent
        };

        // Send to Supabase
        const supabaseResult = await sendToSupabase(extractionData);
        
        if (supabaseResult.success) {
            return {
                success: true,
                size: htmlContent.length,
                title: pageTitle,
                id: supabaseResult.id,
                userId: config.userId
            };
        } else {
            throw new Error(supabaseResult.error);
        }
        
    } catch (error) {
        console.error('HTML extraction failed:', error);
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
        chrome.storage.sync.get(['userId', 'supabaseUrl', 'supabaseAnonKey', 'supabaseTableName'], (result) => {
            resolve({
                userId: result.userId,
                url: result.supabaseUrl,
                anonKey: result.supabaseAnonKey,
                tableName: result.supabaseTableName || 'html_extractions'
            });
        });
    });
} 