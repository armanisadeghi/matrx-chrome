document.addEventListener('DOMContentLoaded', async () => {
    const extractBtn = document.getElementById('extractBtn');
    const copyFullBtn = document.getElementById('copyFullBtn');
    const copySmartBtn = document.getElementById('copySmartBtn');
    const copyCustomSmartBtn = document.getElementById('copyCustomSmartBtn');
    const testApiBtn = document.getElementById('testApiBtn');
    const testApiSmartBtn = document.getElementById('testApiSmartBtn');
    const testApiCustomSmartBtn = document.getElementById('testApiCustomSmartBtn');
    const geminiExtractFullBtn = document.getElementById('geminiExtractFullBtn');
    const geminiExtractSmartBtn = document.getElementById('geminiExtractSmartBtn');
    const geminiExtractCustomBtn = document.getElementById('geminiExtractCustomBtn');
    const geminiResponseDiv = document.getElementById('geminiResponse');
    const geminiResponseContent = document.getElementById('geminiResponseContent');
    const copyGeminiBtn = document.getElementById('copyGeminiBtn');
    const expandGeminiBtn = document.getElementById('expandGeminiBtn');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');
    const currentUrlSpan = document.getElementById('currentUrl');
    const settingsLink = document.getElementById('settingsLink');
    const aiResponseDiv = document.getElementById('aiResponse');
    const aiResponseContent = document.getElementById('aiResponseContent');
    const expandAiContentBtn = document.getElementById('expandAiContentBtn');
    const expandResearchBtn = document.getElementById('expandResearchBtn');
    const expandMarkdownBtn = document.getElementById('expandMarkdownBtn');
    const expandJsonBtn = document.getElementById('expandJsonBtn');
    const expandFullResponseBtn = document.getElementById('expandFullResponseBtn');
    const copyAiBtn = document.getElementById('copyAiBtn');
    
    // Store all AI data formats
    let currentAiData = {
        ai_content: '',
        ai_research_content: '',
        markdown_renderable: '',
        organized_data: '',
        full_response: ''
    };
    let currentActiveTab = 'ai_content';
    let currentGeminiContent = '';
    let geminiClient = null;

    // Get current tab URL and load saved data
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentUrlSpan.textContent = tab.url;
        
        // Try to load saved AI data for this URL
        await loadSavedAiData(tab.url);
        
        // Initialize Gemini client
        await initializeGeminiClient();
    } catch (error) {
        currentUrlSpan.textContent = 'Unable to get URL';
    }

    // Handle settings link click
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        window.close();
    });

    // Handle expand AI content buttons click
    expandAiContentBtn.addEventListener('click', () => {
        if (currentAiData.ai_content) {
            openSingleContentInNewTab('AI Content', currentAiData.ai_content);
        } else {
            alert('No AI content available');
        }
    });

    expandResearchBtn.addEventListener('click', () => {
        if (currentAiData.ai_research_content) {
            openSingleContentInNewTab('Research Content', currentAiData.ai_research_content);
        } else {
            alert('No research content available');
        }
    });

    expandMarkdownBtn.addEventListener('click', () => {
        if (currentAiData.markdown_renderable) {
            openMarkdownViewer(currentAiData.markdown_renderable);
        } else {
            alert('No markdown content available');
        }
    });

    expandJsonBtn.addEventListener('click', () => {
        if (currentAiData.organized_data) {
            // Format JSON for better readability
            let jsonContent = currentAiData.organized_data;
            if (typeof jsonContent === 'object') {
                jsonContent = JSON.stringify(jsonContent, null, 2);
            }
            openSingleContentInNewTab('JSON Data', jsonContent);
        } else {
            alert('No JSON data available');
        }
    });

    expandFullResponseBtn.addEventListener('click', () => {
        if (currentAiData.full_response) {
            // Format full response JSON for better readability
            let responseContent = currentAiData.full_response;
            if (typeof responseContent === 'object') {
                responseContent = JSON.stringify(responseContent, null, 2);
            }
            openSingleContentInNewTab('Full API Response', responseContent);
        } else {
            alert('No full response data available');
        }
    });

    // Handle copy AI content button click
    copyAiBtn.addEventListener('click', async () => {
        try {
            const content = currentAiData[currentActiveTab];
            if (content) {
                await navigator.clipboard.writeText(content);
                
                // Show temporary feedback
                const originalText = copyAiBtn.textContent;
                copyAiBtn.textContent = '✅ Copied!';
                copyAiBtn.disabled = true;
                
                setTimeout(() => {
                    copyAiBtn.textContent = originalText;
                    copyAiBtn.disabled = false;
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to copy AI content:', error);
        }
    });

    // Handle AI tab switching
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-tab')) {
            const tabName = e.target.dataset.tab;
            switchAiTab(tabName);
        }
    });

    // Handle extract button click
    extractBtn.addEventListener('click', async () => {
        try {
            // Disable button and show loading state
            setButtonLoading(extractBtn, true);
            showStatus('loading', 'Extracting HTML content...');

            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if we can access this tab
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot extract content from Chrome internal pages');
            }

            // Send message to content script to extract HTML
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractHTML',
                url: tab.url 
            });

            if (response.success) {
                if (response.savedToDatabase) {
                    showStatus('success', `Successfully extracted ${response.size} characters of HTML content and saved to database!`);
                } else if (response.warning) {
                    showStatus('success', `Extracted ${response.size} characters of HTML content. ${response.warning}`);
                } else {
                    showStatus('success', `Successfully extracted ${response.size} characters of HTML content!`);
                }
            } else {
                throw new Error(response.error || 'Failed to extract HTML');
            }

        } catch (error) {
            console.error('Extraction failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            // Reset button state
            setButtonLoading(extractBtn, false);
        }
    });

    // Handle copy full HTML button click
    copyFullBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(copyFullBtn, true);
            showStatus('loading', 'Copying full HTML to clipboard...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copyFullHTML'
            });

            if (response && response.success) {
                await navigator.clipboard.writeText(response.html);
                showStatus('success', `Copied ${response.size} characters to clipboard!`);
            } else {
                throw new Error(response?.error || 'Failed to copy HTML');
            }

        } catch (error) {
            console.error('Copy failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            setButtonLoading(copyFullBtn, false);
        }
    });

    // Handle copy smart HTML button click
    copySmartBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(copySmartBtn, true);
            showStatus('loading', 'Copying smart HTML to clipboard...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copySmartHTML'
            });

            if (response && response.success) {
                await navigator.clipboard.writeText(response.html);
                showStatus('success', `Copied ${response.size} characters of clean HTML to clipboard!`);
            } else {
                throw new Error(response?.error || 'Failed to copy smart HTML');
            }

        } catch (error) {
            console.error('Smart copy failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            setButtonLoading(copySmartBtn, false);
        }
    });

    // Handle copy custom smart HTML button click
    copyCustomSmartBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(copyCustomSmartBtn, true);
            showStatus('loading', 'Copying custom smart HTML to clipboard...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copyCustomSmartHTML'
            });

            if (response && response.success) {
                await navigator.clipboard.writeText(response.html);
                showStatus('success', `Copied ${response.size} characters of custom HTML to clipboard!`);
            } else {
                throw new Error(response?.error || 'Failed to copy custom smart HTML');
            }

        } catch (error) {
            console.error('Custom smart copy failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            setButtonLoading(copyCustomSmartBtn, false);
        }
    });

    // Handle test API button click
    testApiBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(testApiBtn, true);
            showStatus('loading', 'Processing with AI...');
            hideAiResponse();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get HTML content from the current page
            const htmlResponse = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copyFullHTML'
            });

            if (!htmlResponse || !htmlResponse.success) {
                throw new Error(htmlResponse?.error || 'Failed to get HTML content');
            }

            // Prepare API request data
            const apiData = {
                taskName: "parse_html",
                taskData: {
                    html_content: htmlResponse.html,
                    page_url: tab.url
                }
            };

            // Make API request
            const apiResponse = await fetch('https://8000-jatindotpy-matrxscraper-iklzanw3l2b.ws-us120.gitpod.io/execute_task/default_service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });

            if (!apiResponse.ok) {
                throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
            }

            const result = await apiResponse.json();

            if (!result.success) {
                throw new Error(result.message || 'API processing failed');
            }

            // Extract all data formats from response
            const data = result.response?.data?.[0];
            
            if (data) {
                currentAiData = {
                    ai_content: data.ai_content || 'No AI content available',
                    ai_research_content: data.ai_research_content || 'No research content available',
                    markdown_renderable: data.markdown_renderable || 'No markdown content available',
                    organized_data: data.organized_data || 'No JSON data available',
                    full_response: result || 'No full response available'
                };
                
                // Save data to chrome storage for persistence
                await saveAiDataToStorage(currentAiData, tab.url);
                
                showAiResponse();
                showStatus('success', 'AI processing completed successfully!');
            } else {
                throw new Error('No data found in response');
            }

        } catch (error) {
            console.error('API test failed:', error);
            showStatus('error', `Error: ${error.message}`);
            hideAiResponse();
        } finally {
            setButtonLoading(testApiBtn, false);
        }
    });

    // Handle test API smart button click
    testApiSmartBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(testApiSmartBtn, true);
            showStatus('loading', 'Processing with AI (Smart HTML)...');
            hideAiResponse();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get Smart HTML content from the current page
            const htmlResponse = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copySmartHTML'
            });

            if (!htmlResponse || !htmlResponse.success) {
                throw new Error(htmlResponse?.error || 'Failed to get smart HTML content');
            }

            // Prepare API request data
            const apiData = {
                taskName: "parse_html",
                taskData: {
                    html_content: htmlResponse.html,
                    page_url: tab.url
                }
            };

            // Make API request
            const apiResponse = await fetch('https://8000-jatindotpy-matrxscraper-iklzanw3l2b.ws-us120.gitpod.io/execute_task/default_service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });

            if (!apiResponse.ok) {
                throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
            }

            const result = await apiResponse.json();

            if (!result.success) {
                throw new Error(result.message || 'API processing failed');
            }

            // Extract all data formats from response
            const data = result.response?.data?.[0];
            
            if (data) {
                currentAiData = {
                    ai_content: data.ai_content || 'No AI content available',
                    ai_research_content: data.ai_research_content || 'No research content available',
                    markdown_renderable: data.markdown_renderable || 'No markdown content available',
                    organized_data: data.organized_data || 'No JSON data available',
                    full_response: result || 'No full response available'
                };
                
                // Save data to chrome storage for persistence
                await saveAiDataToStorage(currentAiData, tab.url);
                
                showAiResponse();
                showStatus('success', 'AI processing (Smart HTML) completed successfully!');
            } else {
                throw new Error('No data found in response');
            }

        } catch (error) {
            console.error('API smart test failed:', error);
            showStatus('error', `Error: ${error.message}`);
            hideAiResponse();
        } finally {
            setButtonLoading(testApiSmartBtn, false);
        }
    });

    // Handle test API custom smart button click
    testApiCustomSmartBtn.addEventListener('click', async () => {
        try {
            setButtonLoading(testApiCustomSmartBtn, true);
            showStatus('loading', 'Processing with AI (Custom Smart HTML)...');
            hideAiResponse();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get Custom Smart HTML content from the current page
            const htmlResponse = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copyCustomSmartHTML'
            });

            if (!htmlResponse || !htmlResponse.success) {
                throw new Error(htmlResponse?.error || 'Failed to get custom smart HTML content');
            }

            // Prepare API request data
            const apiData = {
                taskName: "parse_html",
                taskData: {
                    html_content: htmlResponse.html,
                    page_url: tab.url
                }
            };

            // Make API request
            const apiResponse = await fetch('https://8000-jatindotpy-matrxscraper-iklzanw3l2b.ws-us120.gitpod.io/execute_task/default_service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });

            if (!apiResponse.ok) {
                throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
            }

            const result = await apiResponse.json();

            if (!result.success) {
                throw new Error(result.message || 'API processing failed');
            }

            // Extract all data formats from response
            const data = result.response?.data?.[0];
            
            if (data) {
                currentAiData = {
                    ai_content: data.ai_content || 'No AI content available',
                    ai_research_content: data.ai_research_content || 'No research content available',
                    markdown_renderable: data.markdown_renderable || 'No markdown content available',
                    organized_data: data.organized_data || 'No JSON data available',
                    full_response: result || 'No full response available'
                };
                
                // Save data to chrome storage for persistence
                await saveAiDataToStorage(currentAiData, tab.url);
                
                showAiResponse();
                showStatus('success', 'AI processing (Custom Smart HTML) completed successfully!');
            } else {
                throw new Error('No data found in response');
            }

        } catch (error) {
            console.error('API custom smart test failed:', error);
            showStatus('error', `Error: ${error.message}`);
            hideAiResponse();
        } finally {
            setButtonLoading(testApiCustomSmartBtn, false);
        }
    });

    // Handle Gemini extract full HTML button click
    geminiExtractFullBtn.addEventListener('click', async () => {
        await handleGeminiExtraction('full');
    });

    // Handle Gemini extract smart HTML button click
    geminiExtractSmartBtn.addEventListener('click', async () => {
        await handleGeminiExtraction('smart');
    });

    // Handle Gemini extract custom HTML button click
    geminiExtractCustomBtn.addEventListener('click', async () => {
        await handleGeminiExtraction('custom');
    });

    // Handle copy Gemini content button click
    copyGeminiBtn.addEventListener('click', async () => {
        try {
            if (currentGeminiContent) {
                await navigator.clipboard.writeText(currentGeminiContent);
                
                // Show temporary feedback
                const originalText = copyGeminiBtn.textContent;
                copyGeminiBtn.textContent = '✅ Copied!';
                copyGeminiBtn.disabled = true;
                
                setTimeout(() => {
                    copyGeminiBtn.textContent = originalText;
                    copyGeminiBtn.disabled = false;
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to copy Gemini content:', error);
        }
    });

    // Handle expand Gemini content button click
    expandGeminiBtn.addEventListener('click', () => {
        if (currentGeminiContent) {
            openSingleContentInNewTab('Gemini Extracted Content', currentGeminiContent);
        } else {
            alert('No extracted content available');
        }
    });

    async function ensureContentScript(tabId) {
        try {
            // Try to ping the content script
            await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (error) {
            // Content script not available, inject it
            console.log('Content script not found, injecting...');
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content/content.js']
                });
                // Wait a moment for the script to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (injectionError) {
                throw new Error('Unable to access page content. Please refresh the page and try again.');
            }
        }
    }

    function setButtonLoading(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        button.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnLoader.style.display = isLoading ? 'inline' : 'none';
    }

    function showStatus(type, message) {
        statusDiv.style.display = 'block';
        statusDiv.className = `status ${type}`;
        statusMessage.textContent = message;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    function showAiResponse() {
        aiResponseDiv.style.display = 'block';
        switchAiTab(currentActiveTab);
    }

    function hideAiResponse() {
        aiResponseDiv.style.display = 'none';
        aiResponseContent.textContent = '';
        currentAiData = {
            ai_content: '',
            ai_research_content: '',
            markdown_renderable: '',
            organized_data: '',
            full_response: ''
        };
    }

    function switchAiTab(tabName) {
        currentActiveTab = tabName;
        
        // Update tab active states
        document.querySelectorAll('.ai-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update content
        aiResponseContent.textContent = currentAiData[tabName] || 'No content available';
    }

    function openMarkdownViewer(markdownContent) {
        console.log('Opening markdown viewer with content:', markdownContent.substring(0, 100) + '...');
        
        try {
            // Create self-contained HTML with embedded markdown viewer
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrx - Markdown Content</title>
    <script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; min-height: 100vh; display: flex; flex-direction: column; }
        .header { 
            background: rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 30px; margin-bottom: 30px;
            text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .header h1 { color: white; font-size: 32px; font-weight: 700; margin-bottom: 10px; }
        .subtitle { color: rgba(255, 255, 255, 0.8); font-size: 16px; margin-bottom: 25px; }
        .header-actions { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .toggle-btn, .copy-btn {
            background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px; padding: 12px 20px; color: white; font-size: 14px; font-weight: 500;
            cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(5px);
        }
        .toggle-btn:hover, .copy-btn:hover {
            background: rgba(255, 255, 255, 0.3); border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        .copy-btn:disabled { background: rgba(34, 197, 94, 0.3); border-color: rgba(34, 197, 94, 0.5); cursor: not-allowed; transform: none; }
        .content-wrapper {
            flex: 1; background: white; border-radius: 16px; overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .rendered-content, .raw-content { padding: 40px; min-height: 500px; max-height: 80vh; overflow-y: auto; }
        .raw-content { background: #1e293b; color: #e2e8f0; }
        .raw-content pre { margin: 0; background: none; padding: 0; border-radius: 0; white-space: pre-wrap; word-wrap: break-word; }
        
        /* Markdown styling */
        .rendered-content h1, .rendered-content h2, .rendered-content h3, .rendered-content h4, .rendered-content h5, .rendered-content h6 {
            color: #1e293b; font-weight: 700; margin-top: 2em; margin-bottom: 1em; line-height: 1.3;
        }
        .rendered-content h1 { font-size: 2.5em; border-bottom: 3px solid #667eea; padding-bottom: 0.5em; margin-top: 0; }
        .rendered-content h2 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
        .rendered-content h3 { font-size: 1.5em; color: #475569; }
        .rendered-content h4 { font-size: 1.25em; color: #64748b; }
        .rendered-content p { margin-bottom: 1.5em; line-height: 1.7; color: #374151; }
        .rendered-content ul, .rendered-content ol { margin-bottom: 1.5em; padding-left: 2em; }
        .rendered-content li { margin-bottom: 0.5em; line-height: 1.6; }
        .rendered-content blockquote {
            border-left: 4px solid #667eea; background: #f8fafc; margin: 1.5em 0; padding: 1em 2em;
            font-style: italic; color: #64748b; border-radius: 0 8px 8px 0;
        }
        .rendered-content code {
            background: #f1f5f9; color: #be185d; padding: 0.2em 0.4em; border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.9em;
        }
        .rendered-content pre {
            background: #1e293b; color: #e2e8f0; padding: 1.5em; border-radius: 8px;
            overflow-x: auto; margin: 1.5em 0; line-height: 1.5; position: relative;
        }
        .rendered-content pre code { background: none; color: inherit; padding: 0; border-radius: 0; font-size: inherit; }
        .rendered-content table {
            width: 100%; border-collapse: collapse; margin: 1.5em 0; border-radius: 8px;
            overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .rendered-content th, .rendered-content td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .rendered-content th { background: #667eea; color: white; font-weight: 600; }
        .rendered-content tr:nth-child(even) { background: #f8fafc; }
        .rendered-content a { color: #667eea; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s ease; }
        .rendered-content a:hover { border-bottom-color: #667eea; }
        .rendered-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .rendered-content hr { border: none; height: 2px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 2em 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Matrx - Markdown Content</h1>
            <p class="subtitle">AI-processed markdown content from your webpage</p>
            <div class="header-actions">
                <button id="toggleView" class="toggle-btn">🔄 Show Raw</button>
                <button id="copyBtn" class="copy-btn">📋 Copy Content</button>
            </div>
        </div>
        
        <div class="content-wrapper">
            <div id="renderedContent" class="rendered-content"></div>
            <div id="rawContent" class="raw-content" style="display: none;">
                <pre><code id="rawMarkdown"></code></pre>
            </div>
        </div>
    </div>

    <script>
        const markdownContent = ${JSON.stringify(markdownContent)};
        let isRenderedView = true;
        
        // Configure marked.js
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true
        });
        
        function renderMarkdown() {
            const renderedContent = document.getElementById('renderedContent');
            const rawMarkdown = document.getElementById('rawMarkdown');
            
            try {
                const htmlContent = marked.parse(markdownContent);
                const sanitizedHtml = DOMPurify.sanitize(htmlContent);
                renderedContent.innerHTML = sanitizedHtml;
                rawMarkdown.textContent = markdownContent;
                
                // Add copy buttons to code blocks
                addCodeBlockCopyButtons();
            } catch (error) {
                console.error('Error rendering markdown:', error);
                renderedContent.innerHTML = '<div style="color: #ef4444; text-align: center; padding: 2em;">Failed to render markdown content</div>';
            }
        }
        
        function addCodeBlockCopyButtons() {
            const codeBlocks = document.querySelectorAll('pre');
            codeBlocks.forEach(pre => {
                const copyBtn = document.createElement('button');
                copyBtn.innerHTML = '📋';
                copyBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: white; padding: 4px 8px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.2s ease;';
                pre.appendChild(copyBtn);
                
                pre.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
                pre.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');
                
                copyBtn.addEventListener('click', async () => {
                    const code = pre.querySelector('code').textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        copyBtn.innerHTML = '✅';
                        setTimeout(() => copyBtn.innerHTML = '📋', 1500);
                    } catch (error) {
                        copyBtn.innerHTML = '❌';
                        setTimeout(() => copyBtn.innerHTML = '📋', 1500);
                    }
                });
            });
        }
        
        function toggleView() {
            const renderedContent = document.getElementById('renderedContent');
            const rawContent = document.getElementById('rawContent');
            const toggleBtn = document.getElementById('toggleView');
            
            isRenderedView = !isRenderedView;
            
            if (isRenderedView) {
                renderedContent.style.display = 'block';
                rawContent.style.display = 'none';
                toggleBtn.textContent = '🔄 Show Raw';
            } else {
                renderedContent.style.display = 'none';
                rawContent.style.display = 'block';
                toggleBtn.textContent = '🔄 Show Rendered';
            }
        }
        
        async function copyContent() {
            const copyBtn = document.getElementById('copyBtn');
            try {
                const contentToCopy = isRenderedView 
                    ? document.getElementById('renderedContent').textContent 
                    : markdownContent;
                    
                await navigator.clipboard.writeText(contentToCopy);
                
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅ Copied!';
                copyBtn.disabled = true;
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Failed to copy:', error);
                copyBtn.textContent = '❌ Failed';
                setTimeout(() => copyBtn.textContent = '📋 Copy Content', 2000);
            }
        }
        
        // Event listeners
        document.getElementById('toggleView').addEventListener('click', toggleView);
        document.getElementById('copyBtn').addEventListener('click', copyContent);
        
        // Initialize
        renderMarkdown();
    </script>
</body>
</html>`;
            
            // Create blob URL
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Opening markdown viewer tab');
            chrome.tabs.create({ url: url });
            
        } catch (error) {
            console.error('Error opening markdown viewer:', error);
            alert('Error opening markdown viewer: ' + error.message);
        }
    }

    function openSingleContentInNewTab(contentType, content) {
        console.log('Opening single content in new tab:', contentType);
        
        try {
            // Create simple HTML with just the single content
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matrx - ${contentType}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #64748b;
            margin: 10px 0 0 0;
            font-size: 14px;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            white-space: pre-wrap;
            word-wrap: break-word;
            border: 1px solid #e2e8f0;
            min-height: 400px;
            font-size: 14px;
            line-height: 1.6;
        }
        .actions {
            margin-top: 30px;
            text-align: center;
        }
        .copy-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
        }
        .copy-btn:hover {
            background: #5a67d8;
        }
        .copy-btn:disabled {
            background: #22c55e;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Matrx - ${contentType}</h1>
        <p>AI-processed content from your webpage</p>
    </div>
    
    <div class="content" id="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    
    <div class="actions">
        <button class="copy-btn" onclick="copyContent()">📋 Copy Content</button>
    </div>

    <script>
        const content = ${JSON.stringify(content)};
        
        async function copyContent() {
            try {
                await navigator.clipboard.writeText(content);
                
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Failed to copy:', error);
                alert('Failed to copy content');
            }
        }
    </script>
</body>
</html>`;
            
            // Create blob URL
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Opening tab with URL:', url);
            chrome.tabs.create({ url: url });
            
        } catch (error) {
            console.error('Error opening single content:', error);
            alert('Error opening full view: ' + error.message);
        }
    }

    // Storage functions for data persistence
    async function saveAiDataToStorage(aiData, url) {
        try {
            const storageKey = `matrx_ai_data_${btoa(url).slice(0, 50)}`;
            const dataToSave = {
                data: aiData,
                url: url,
                timestamp: Date.now()
            };
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            console.log('AI data saved to storage for URL:', url);
        } catch (error) {
            console.error('Failed to save AI data:', error);
        }
    }

    async function loadSavedAiData(url) {
        try {
            const storageKey = `matrx_ai_data_${btoa(url).slice(0, 50)}`;
            const result = await chrome.storage.local.get([storageKey]);
            
            if (result[storageKey]) {
                const savedData = result[storageKey];
                // Check if data is not too old (1 hour)
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - savedData.timestamp < oneHour) {
                    currentAiData = savedData.data;
                    showAiResponse();
                    showStatus('success', 'Loaded previously processed AI data for this page!');
                    console.log('Loaded AI data from storage for URL:', url);
                } else {
                    // Remove old data
                    await chrome.storage.local.remove([storageKey]);
                    console.log('Removed expired AI data for URL:', url);
                }
            }
        } catch (error) {
            console.error('Failed to load saved AI data:', error);
        }
    }

    // Gemini-specific functions
    async function initializeGeminiClient() {
        try {
            // Load Gemini client script
            await loadGeminiScript();
            
            if (window.GeminiClient) {
                geminiClient = new window.GeminiClient();
                const initialized = await geminiClient.initialize();
                
                if (!initialized) {
                    console.warn('Gemini client not configured - API key missing');
                    // Update UI to show configuration needed
                    updateGeminiButtonsState(false);
                } else {
                    console.log('Gemini client initialized successfully');
                    updateGeminiButtonsState(true);
                }
            }
        } catch (error) {
            console.error('Failed to initialize Gemini client:', error);
            updateGeminiButtonsState(false);
        }
    }

    function loadGeminiScript() {
        return new Promise((resolve, reject) => {
            if (window.GeminiClient) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/gemini-client.js');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Gemini client script'));
            document.head.appendChild(script);
        });
    }

    function updateGeminiButtonsState(enabled) {
        const buttons = [geminiExtractFullBtn, geminiExtractSmartBtn, geminiExtractCustomBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = !enabled;
                if (!enabled) {
                    btn.title = 'Configure Gemini API key in settings to enable';
                } else {
                    btn.title = '';
                }
            }
        });
    }

    async function handleGeminiExtraction(type) {
        if (!geminiClient || !geminiClient.isConfigured()) {
            showStatus('error', 'Gemini API key not configured. Please add your API key in settings.');
            return;
        }

        const button = type === 'full' ? geminiExtractFullBtn : 
                      type === 'smart' ? geminiExtractSmartBtn : 
                      geminiExtractCustomBtn;

        try {
            setButtonLoading(button, true);
            showStatus('loading', `Extracting content with Gemini AI (${type} HTML)...`);
            hideGeminiResponse();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get HTML content based on type
            let action;
            switch (type) {
                case 'full':
                    action = 'copyFullHTML';
                    break;
                case 'smart':
                    action = 'copySmartHTML';
                    break;
                case 'custom':
                    action = 'copyCustomSmartHTML';
                    break;
                default:
                    throw new Error('Invalid extraction type');
            }

            const htmlResponse = await chrome.tabs.sendMessage(tab.id, { action });

            if (!htmlResponse || !htmlResponse.success) {
                throw new Error(htmlResponse?.error || `Failed to get ${type} HTML content`);
            }

            // Extract content using Gemini
            const extractedContent = await geminiClient.extractContentFromHTML(htmlResponse.html);
            
            currentGeminiContent = extractedContent;
            showGeminiResponse(extractedContent);
            showStatus('success', `Successfully extracted ${extractedContent.length} characters of clean text!`);

        } catch (error) {
            console.error(`Gemini ${type} extraction failed:`, error);
            showStatus('error', `Error: ${error.message}`);
            hideGeminiResponse();
        } finally {
            setButtonLoading(button, false);
        }
    }

    function showGeminiResponse(content) {
        geminiResponseDiv.style.display = 'block';
        geminiResponseContent.textContent = content;
    }

    function hideGeminiResponse() {
        geminiResponseDiv.style.display = 'none';
        geminiResponseContent.textContent = '';
        currentGeminiContent = '';
    }
}); 