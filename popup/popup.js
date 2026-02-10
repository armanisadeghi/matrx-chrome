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
    
    // Gemini cached results elements
    const geminiSavedResults = document.getElementById('geminiSavedResults');
    const geminiSavedContent = document.getElementById('geminiSavedContent');
    const geminiCacheTime = document.getElementById('geminiCacheTime');
    const copyGeminiSavedBtn = document.getElementById('copyGeminiSavedBtn');
    const expandGeminiSavedBtn = document.getElementById('expandGeminiSavedBtn');
    const refreshGeminiBtn = document.getElementById('refreshGeminiBtn');
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
    
    // Custom Range elements
    const customRangeDomain = document.getElementById('customRangeDomain');
    const startMarkerInput = document.getElementById('startMarker');
    const endMarkerInput = document.getElementById('endMarker');
    const testStartMarkerBtn = document.getElementById('testStartMarkerBtn');
    const testEndMarkerBtn = document.getElementById('testEndMarkerBtn');
    const saveStartMarkerBtn = document.getElementById('saveStartMarkerBtn');
    const saveEndMarkerBtn = document.getElementById('saveEndMarkerBtn');
    const startMarkerResult = document.getElementById('startMarkerResult');
    const endMarkerResult = document.getElementById('endMarkerResult');
    const characterCount = document.getElementById('characterCount');
    const characterCountValue = document.getElementById('characterCountValue');
    const contentPreview = document.getElementById('contentPreview');
    const previewRangeBtn = document.getElementById('previewRangeBtn');
    const extractRangeBtn = document.getElementById('extractRangeBtn');
    const geminiRangeBtn = document.getElementById('geminiRangeBtn');
    const saveMarkersBtn = document.getElementById('saveMarkersBtn');
    const clearMarkersBtn = document.getElementById('clearMarkersBtn');
    const customRangeResults = document.getElementById('customRangeResults');
    const customRangeContent = document.getElementById('customRangeContent');
    const resultsLength = document.getElementById('resultsLength');
    const copyCustomRangeBtn = document.getElementById('copyCustomRangeBtn');
    const expandCustomRangeBtn = document.getElementById('expandCustomRangeBtn');
    
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
    let templateLoader = null;
    let currentUrl = '';
    let savedGeminiData = null;
    let currentCustomRangeContent = '';
    let currentDomain = '';

    // Get current tab URL and load saved data
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentUrl = tab.url;
        currentUrlSpan.textContent = currentUrl;
        
        // Extract domain for custom range
        try {
            const urlObj = new URL(currentUrl);
            currentDomain = urlObj.hostname;
            if (customRangeDomain) {
                customRangeDomain.textContent = currentDomain;
            }
        } catch (error) {
            currentDomain = 'unknown';
            if (customRangeDomain) {
                customRangeDomain.textContent = 'Unknown domain';
            }
        }
        
        // Try to load saved AI data for this URL
        await loadSavedAiData(currentUrl);
        
        // Try to load saved Gemini data for this URL
        await loadSavedGeminiData(currentUrl);
        
        // Try to load saved custom range markers for this domain
        await loadSavedCustomRangeMarkers(currentDomain);
        
        // Initialize Gemini client and template loader
        await initializeGeminiClient();
        templateLoader = new TemplateLoader();
        
        // Initialize tab system
        initializeTabSystem();
        
        // Prevent initial layout shifts
        stabilizeInitialLayout();
        
    } catch (error) {
        currentUrlSpan.textContent = 'Unable to get URL';
    }

    // Handle settings buttons click
    const headerSettingsBtn = document.getElementById('headerSettingsBtn');
    
    function openSettings(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        window.close();
    }
    
    if (settingsLink) {
        settingsLink.addEventListener('click', openSettings);
    }
    
    if (headerSettingsBtn) {
        headerSettingsBtn.addEventListener('click', openSettings);
    }

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

    // Custom Range Event Listeners
    if (testStartMarkerBtn) {
        testStartMarkerBtn.addEventListener('click', () => handleTestMarker('start'));
    }
    
    if (testEndMarkerBtn) {
        testEndMarkerBtn.addEventListener('click', () => handleTestMarker('end'));
    }
    
    if (saveStartMarkerBtn) {
        saveStartMarkerBtn.addEventListener('click', () => handleSaveIndividualMarker('start'));
    }
    
    if (saveEndMarkerBtn) {
        saveEndMarkerBtn.addEventListener('click', () => handleSaveIndividualMarker('end'));
    }
    
    if (previewRangeBtn) {
        previewRangeBtn.addEventListener('click', handlePreviewRange);
    }
    
    if (extractRangeBtn) {
        extractRangeBtn.addEventListener('click', handleExtractRange);
    }
    
    if (geminiRangeBtn) {
        geminiRangeBtn.addEventListener('click', handleGeminiRange);
    }
    
    if (saveMarkersBtn) {
        saveMarkersBtn.addEventListener('click', handleSaveMarkers);
    }
    
    if (clearMarkersBtn) {
        clearMarkersBtn.addEventListener('click', handleClearMarkers);
    }
    
    if (copyCustomRangeBtn) {
        copyCustomRangeBtn.addEventListener('click', handleCopyCustomRange);
    }
    
    if (expandCustomRangeBtn) {
        expandCustomRangeBtn.addEventListener('click', handleExpandCustomRange);
    }
    
    // Input change listeners for marker validation and auto-save
    if (startMarkerInput) {
        startMarkerInput.addEventListener('input', () => {
            validateMarkers();
            autoSaveMarkers();
        });
    }
    
    if (endMarkerInput) {
        endMarkerInput.addEventListener('input', () => {
            validateMarkers();
            autoSaveMarkers();
        });
    }

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

            // Get the backend API URL from settings
            const apiBaseUrl = await getApiBaseUrl();
            if (!apiBaseUrl) {
                throw new Error('Backend API URL not configured. Please set the Socket.IO Server URL in settings.');
            }

            // Make API request
            const apiResponse = await fetch(`${apiBaseUrl}/execute_task/default_service`, {
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

            // Get the backend API URL from settings
            const apiBaseUrl = await getApiBaseUrl();
            if (!apiBaseUrl) {
                throw new Error('Backend API URL not configured. Please set the Socket.IO Server URL in settings.');
            }

            // Make API request
            const apiResponse = await fetch(`${apiBaseUrl}/execute_task/default_service`, {
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

            // Get the backend API URL from settings
            const apiBaseUrl = await getApiBaseUrl();
            if (!apiBaseUrl) {
                throw new Error('Backend API URL not configured. Please set the Socket.IO Server URL in settings.');
            }

            // Make API request
            const apiResponse = await fetch(`${apiBaseUrl}/execute_task/default_service`, {
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
            openGeminiContentViewer(currentGeminiContent);
        } else {
            alert('No extracted content available');
        }
    });

    // Get the backend API base URL from settings (Socket.IO Server URL)
    async function getApiBaseUrl() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['socketServerUrl'], (result) => {
                const url = result.socketServerUrl || '';
                // Strip trailing slash if present
                resolve(url ? url.replace(/\/+$/, '') : '');
            });
        });
    }

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

    async function openSingleContentInNewTab(contentType, content) {
        console.log('Opening single content in new tab:', contentType);
        
        try {
            if (!templateLoader) {
                throw new Error('Template loader not initialized');
            }

            // Create HTML using template
            const htmlContent = await templateLoader.createBlobDocument('single-content', {
                contentType: contentType,
                content: content
            });
            
            // Create blob URL
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Opening single content tab with URL:', url);
            chrome.tabs.create({ url: url });
            
        } catch (error) {
            console.error('Error opening single content:', error);
            alert('Error opening full view: ' + error.message);
        }
    }

    function openGeminiContentViewer(content) {
        console.log('Opening Gemini content viewer with dual view');
        
        try {
            // Convert plain text to markdown by preserving structure
            const markdownContent = convertTextToMarkdown(content);
            
            // Use the existing markdown viewer but with our content
            // This avoids CSP issues by using the existing infrastructure
            openDualViewContentViewer('Gemini Extracted Content', content, markdownContent);
            
        } catch (error) {
            console.error('Error opening Gemini content viewer:', error);
            alert('Error opening Gemini content viewer: ' + error.message);
        }
    }

    async function openDualViewContentViewer(contentType, textContent, markdownContent) {
        console.log('Opening dual view content viewer:', contentType);
        
        try {
            if (!templateLoader) {
                throw new Error('Template loader not initialized');
            }

            // Parse the markdown content to HTML using the template loader's function
            const formattedHtml = templateLoader.parseSimpleMarkdown(markdownContent);
            
            // Get formatted text (plain text from HTML) for copying
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedHtml;
            const formattedText = tempDiv.textContent || tempDiv.innerText || '';
            
            // Create HTML using template with direct content embedding
            const htmlContent = await templateLoader.createBlobDocument('dual-view-content', {
                contentType: contentType,
                textContent: textContent,
                formattedHtml: formattedHtml,
                formattedText: formattedText,
                textContentEncoded: encodeURIComponent(textContent),
                formattedTextEncoded: encodeURIComponent(formattedText)
            });
            
            // Create blob URL
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            console.log('Opening dual view content tab with enhanced copy functionality');
            chrome.tabs.create({ url: url });
            
        } catch (error) {
            console.error('Error opening dual view content viewer:', error);
            alert('Error opening content viewer: ' + error.message);
        }
    }

    function convertTextToMarkdown(text) {
        // Convert plain text to markdown by detecting common patterns
        let markdown = text;
        
        // Convert lines that look like headers (lines followed by === or --- or starting with multiple spaces/caps)
        markdown = markdown.replace(/^(.+)\n={3,}$/gm, '# $1');
        markdown = markdown.replace(/^(.+)\n-{3,}$/gm, '## $1');
        
        // Convert lines that start with numbers followed by periods to ordered lists
        markdown = markdown.replace(/^\s*(\d+)\.\s+(.+)$/gm, '$1. $2');
        
        // Convert lines that start with bullet points or dashes to unordered lists
        markdown = markdown.replace(/^\s*[-•*]\s+(.+)$/gm, '- $1');
        
        // Convert URLs to markdown links
        markdown = markdown.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');
        
        // Convert text that looks like code (indented or between backticks)
        markdown = markdown.replace(/^    (.+)$/gm, '    $1'); // Keep existing code indentation
        
        // Add emphasis for text in ALL CAPS (but not single words)
        markdown = markdown.replace(/\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/g, '**$1**');
        
        // Preserve existing paragraph breaks
        markdown = markdown.replace(/\n\s*\n/g, '\n\n');
        
        return markdown;
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

    // Tab System Functions
    function initializeTabSystem() {
        console.log('Initializing tab system');
        
        // Add event listeners to tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                console.log('Tab clicked:', tabId, 'Target:', e.target.tagName, 'CurrentTarget:', e.currentTarget.tagName);
                switchTab(tabId);
            });
        });
        
        // Add event listeners to cached Gemini buttons
        if (copyGeminiSavedBtn) {
            copyGeminiSavedBtn.addEventListener('click', () => copyGeminiSaved());
        }
        
        if (expandGeminiSavedBtn) {
            expandGeminiSavedBtn.addEventListener('click', () => expandGeminiSaved());
        }
        
        if (refreshGeminiBtn) {
            refreshGeminiBtn.addEventListener('click', () => refreshGeminiData());
        }
    }
    
    function switchTab(tabId) {
        console.log('Switching to tab:', tabId);
        
        // Prevent layout shifts during tab switching
        const container = document.querySelector('.tab-content');
        if (container) {
            container.style.minHeight = container.offsetHeight + 'px';
        }
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) {
            targetPane.classList.add('active');
            
            // Reset min-height after animation
            setTimeout(() => {
                if (container) {
                    container.style.minHeight = '';
                }
            }, 250);
        }
    }

    // Gemini Local Storage Functions
    async function loadSavedGeminiData(url) {
        try {
            const storageKey = `matrx_gemini_${btoa(url).slice(0, 50)}`;
            const result = await chrome.storage.local.get([storageKey]);
            
            if (result[storageKey]) {
                const data = result[storageKey];
                
                // Check if data is not too old (24 hours)
                const twentyFourHours = 24 * 60 * 60 * 1000;
                if (Date.now() - data.timestamp < twentyFourHours) {
                    savedGeminiData = data;
                    showSavedGeminiResults(data);
                    console.log('Loaded saved Gemini data for URL:', url);
                } else {
                    // Remove expired data
                    await chrome.storage.local.remove([storageKey]);
                    console.log('Removed expired Gemini data for URL:', url);
                }
            }
        } catch (error) {
            console.error('Failed to load saved Gemini data:', error);
        }
    }
    
    async function saveGeminiData(url, content, extractionType) {
        try {
            const storageKey = `matrx_gemini_${btoa(url).slice(0, 50)}`;
            const dataToSave = {
                content: content,
                extractionType: extractionType,
                url: url,
                timestamp: Date.now()
            };
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            savedGeminiData = dataToSave;
            showSavedGeminiResults(dataToSave);
            console.log('Saved Gemini data for URL:', url);
        } catch (error) {
            console.error('Failed to save Gemini data:', error);
        }
    }
    
    function showSavedGeminiResults(data) {
        if (!geminiSavedResults || !data) return;
        
        // Show the saved results section
        geminiSavedResults.style.display = 'block';
        
        // Set content (truncated for preview)
        const previewContent = data.content.length > 200 
            ? data.content.substring(0, 200) + '...' 
            : data.content;
        geminiSavedContent.textContent = previewContent;
        
        // Set cache time
        const cacheDate = new Date(data.timestamp);
        const timeAgo = getTimeAgo(data.timestamp);
        geminiCacheTime.textContent = `Cached ${timeAgo} (${data.extractionType})`;
        geminiCacheTime.title = `Full timestamp: ${cacheDate.toLocaleString()}`;
    }
    
    function hideSavedGeminiResults() {
        if (geminiSavedResults) {
            geminiSavedResults.style.display = 'none';
        }
    }
    
    function getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }
    
    async function copyGeminiSaved() {
        if (!savedGeminiData) return;
        
        try {
            await navigator.clipboard.writeText(savedGeminiData.content);
            
            const originalText = copyGeminiSavedBtn.textContent;
            copyGeminiSavedBtn.textContent = '✅ Copied!';
            copyGeminiSavedBtn.disabled = true;
            
            setTimeout(() => {
                copyGeminiSavedBtn.textContent = originalText;
                copyGeminiSavedBtn.disabled = false;
            }, 1500);
        } catch (error) {
            console.error('Failed to copy saved Gemini content:', error);
        }
    }
    
    function expandGeminiSaved() {
        if (!savedGeminiData) return;
        
        openGeminiContentViewer(savedGeminiData.content);
    }
    
    async function refreshGeminiData() {
        // Hide saved results and clear cached data
        hideSavedGeminiResults();
        
        if (savedGeminiData) {
            try {
                const storageKey = `matrx_gemini_${btoa(currentUrl).slice(0, 50)}`;
                await chrome.storage.local.remove([storageKey]);
                savedGeminiData = null;
                
                showStatus('success', 'Cached Gemini data cleared. You can now extract fresh content.');
            } catch (error) {
                console.error('Failed to clear cached Gemini data:', error);
                showStatus('error', 'Failed to clear cached data');
            }
        }
    }
    
    // Prevent initial layout shifts
    function stabilizeInitialLayout() {
        // Set fixed dimensions for tab navigation to prevent reflow
        const tabNavigation = document.querySelector('.tab-navigation');
        if (tabNavigation) {
            tabNavigation.style.minHeight = '35px';
        }
        
        // Set minimum heights for content areas
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            tabContent.style.minHeight = '400px';
        }
        
        // Ensure all buttons have consistent dimensions
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.style.minHeight) {
                btn.style.minHeight = btn.offsetHeight + 'px';
            }
        });
        
        // Remove stabilization after initial render
        setTimeout(() => {
            if (tabNavigation) tabNavigation.style.minHeight = '';
            if (tabContent) tabContent.style.minHeight = '';
            document.querySelectorAll('button').forEach(btn => {
                btn.style.minHeight = '';
            });
        }, 100);
    }

    // Override the existing handleGeminiExtraction to include saving
    const originalHandleGeminiExtraction = handleGeminiExtraction;
    handleGeminiExtraction = async function(type) {
        // Call the original function
        await originalHandleGeminiExtraction.call(this, type);
        
        // If extraction was successful and we have content, save it
        if (currentGeminiContent && currentUrl) {
            await saveGeminiData(currentUrl, currentGeminiContent, type);
        }
    };

    // Custom Range Functions
    async function loadSavedCustomRangeMarkers(domain) {
        try {
            const storageKey = `matrx_custom_markers_${domain}`;
            const tempStorageKey = `matrx_temp_markers_${domain}`;
            
            // Try to load saved markers first
            const result = await chrome.storage.local.get([storageKey, tempStorageKey]);
            let markersToLoad = null;
            let isTemporary = false;
            
            // Check permanent markers first
            if (result[storageKey]) {
                const savedMarkers = result[storageKey];
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                
                if (Date.now() - savedMarkers.timestamp < thirtyDays) {
                    markersToLoad = savedMarkers;
                } else {
                    // Remove expired permanent data
                    await chrome.storage.local.remove([storageKey]);
                    console.log('Removed expired custom range markers for domain:', domain);
                }
            }
            
            // Check temporary markers (they take precedence if more recent)
            if (result[tempStorageKey]) {
                const tempMarkers = result[tempStorageKey];
                const oneHour = 60 * 60 * 1000; // Temporary markers expire after 1 hour
                
                if (Date.now() - tempMarkers.timestamp < oneHour) {
                    // Use temporary markers if they're more recent or if no permanent markers exist
                    if (!markersToLoad || tempMarkers.timestamp > markersToLoad.timestamp) {
                        markersToLoad = tempMarkers;
                        isTemporary = true;
                    }
                } else {
                    // Remove expired temporary data
                    await chrome.storage.local.remove([tempStorageKey]);
                    console.log('Removed expired temporary markers for domain:', domain);
                }
            }
            
            // Load the markers if we found any
            if (markersToLoad) {
                if (startMarkerInput) {
                    startMarkerInput.value = markersToLoad.startMarker || '';
                }
                if (endMarkerInput) {
                    endMarkerInput.value = markersToLoad.endMarker || '';
                }
                
                console.log(`Loaded ${isTemporary ? 'temporary' : 'saved'} custom range markers for domain:`, domain);
                
                // Show info about loaded markers
                if (isTemporary) {
                    showStatus('info', 'Loaded temporary markers from previous session');
                }
                
                // Validate markers after loading
                validateMarkers();
            }
        } catch (error) {
            console.error('Failed to load saved custom range markers:', error);
        }
    }

    async function saveCustomRangeMarkers(domain, startMarker, endMarker) {
        try {
            const storageKey = `matrx_custom_markers_${domain}`;
            const dataToSave = {
                startMarker: startMarker,
                endMarker: endMarker,
                domain: domain,
                timestamp: Date.now()
            };
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            console.log('Saved custom range markers for domain:', domain);
            showStatus('success', `Markers saved for ${domain}`);
        } catch (error) {
            console.error('Failed to save custom range markers:', error);
            showStatus('error', 'Failed to save markers');
        }
    }

    function validateMarkers() {
        const startMarker = startMarkerInput?.value?.trim() || '';
        const endMarker = endMarkerInput?.value?.trim() || '';
        
        const hasStartMarker = startMarker.length > 0;
        const hasEndMarker = endMarker.length > 0;
        const hasBothMarkers = hasStartMarker && hasEndMarker;
        
        // Enable/disable individual test buttons
        if (testStartMarkerBtn) {
            testStartMarkerBtn.disabled = !hasStartMarker;
        }
        
        if (testEndMarkerBtn) {
            testEndMarkerBtn.disabled = !hasEndMarker;
        }
        
        // Enable/disable individual save buttons
        if (saveStartMarkerBtn) {
            saveStartMarkerBtn.disabled = !hasStartMarker;
        }
        
        if (saveEndMarkerBtn) {
            saveEndMarkerBtn.disabled = !hasEndMarker;
        }
        
        // Enable/disable preview button based on both markers
        if (previewRangeBtn) {
            previewRangeBtn.disabled = !hasBothMarkers;
        }
        
        // Gemini button is enabled when both markers are present (does its own preview)
        if (geminiRangeBtn) {
            geminiRangeBtn.disabled = !hasBothMarkers;
        }
        
        // Extract button is enabled after preview shows content
        if (extractRangeBtn) {
            extractRangeBtn.disabled = true;
        }
        
        // Hide character count when markers change
        if (characterCount) {
            characterCount.style.display = 'none';
        }
        
        // Hide results when markers change
        if (customRangeResults) {
            customRangeResults.style.display = 'none';
        }
    }

    // Auto-save markers to prevent loss when inspecting page
    let autoSaveTimeout;
    function autoSaveMarkers() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(async () => {
            const startMarker = startMarkerInput?.value?.trim() || '';
            const endMarker = endMarkerInput?.value?.trim() || '';
            
            if (startMarker || endMarker) {
                try {
                    const storageKey = `matrx_temp_markers_${currentDomain}`;
                    const dataToSave = {
                        startMarker: startMarker,
                        endMarker: endMarker,
                        domain: currentDomain,
                        timestamp: Date.now(),
                        isTemporary: true
                    };
                    
                    await chrome.storage.local.set({ [storageKey]: dataToSave });
                    console.log('Auto-saved temporary markers for domain:', currentDomain);
                } catch (error) {
                    console.error('Failed to auto-save markers:', error);
                }
            }
        }, 1000); // Auto-save after 1 second of no typing
    }

    async function handleTestMarker(type) {
        const isStart = type === 'start';
        const markerInput = isStart ? startMarkerInput : endMarkerInput;
        const resultDiv = isStart ? startMarkerResult : endMarkerResult;
        const testBtn = isStart ? testStartMarkerBtn : testEndMarkerBtn;
        
        const marker = markerInput?.value?.trim() || '';
        
        if (!marker) {
            showMarkerResult(resultDiv, 'error', 'Please enter a marker to test');
            return;
        }

        try {
            setButtonLoading(testBtn, true);
            showMarkerResult(resultDiv, 'info', 'Testing marker...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Test the marker
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'testHtmlMarker',
                marker: marker,
                type: type
            });

            if (response && response.success) {
                const message = `✅ Found ${response.count} match${response.count !== 1 ? 'es' : ''} at position${response.count !== 1 ? 's' : ''}: ${response.positions.slice(0, 3).join(', ')}${response.count > 3 ? '...' : ''}`;
                showMarkerResult(resultDiv, 'success', message);
            } else {
                showMarkerResult(resultDiv, 'error', response?.error || 'Marker not found in HTML');
            }

        } catch (error) {
            console.error(`Test ${type} marker failed:`, error);
            showMarkerResult(resultDiv, 'error', `Error: ${error.message}`);
        } finally {
            setButtonLoading(testBtn, false);
        }
    }

    function showMarkerResult(resultDiv, type, message) {
        if (resultDiv) {
            resultDiv.className = `marker-result ${type}`;
            resultDiv.textContent = message;
            resultDiv.style.display = 'block';
        }
    }

    async function handleSaveIndividualMarker(type) {
        const isStart = type === 'start';
        const markerInput = isStart ? startMarkerInput : endMarkerInput;
        const resultDiv = isStart ? startMarkerResult : endMarkerResult;
        
        const marker = markerInput?.value?.trim() || '';
        
        if (!marker) {
            showMarkerResult(resultDiv, 'error', 'Please enter a marker to save');
            return;
        }

        try {
            // Load existing saved markers
            const storageKey = `matrx_custom_markers_${currentDomain}`;
            const result = await chrome.storage.local.get([storageKey]);
            const existingData = result[storageKey] || {};
            
            // Update only the specific marker
            const dataToSave = {
                ...existingData,
                [isStart ? 'startMarker' : 'endMarker']: marker,
                domain: currentDomain,
                timestamp: Date.now(),
                isTemporary: false
            };
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            
            showMarkerResult(resultDiv, 'success', `✅ ${isStart ? 'Start' : 'End'} marker saved for ${currentDomain}`);
            console.log(`Saved ${type} marker for domain:`, currentDomain);
        } catch (error) {
            console.error(`Failed to save ${type} marker:`, error);
            showMarkerResult(resultDiv, 'error', 'Failed to save marker');
        }
    }

    async function handlePreviewRange() {
        const startMarker = startMarkerInput?.value?.trim() || '';
        const endMarker = endMarkerInput?.value?.trim() || '';
        
        if (!startMarker || !endMarker) {
            showStatus('error', 'Please enter both start and end markers');
            return;
        }

        try {
            setButtonLoading(previewRangeBtn, true);
            showStatus('loading', 'Analyzing content between markers...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get text content and find range
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractCustomRange',
                startMarker: startMarker,
                endMarker: endMarker
            });

            if (response && response.success) {
                const contentLength = response.content.length;
                const previewText = response.content.substring(0, 200) + (contentLength > 200 ? '...' : '');
                
                // Show character count
                if (characterCountValue) {
                    characterCountValue.textContent = contentLength.toLocaleString();
                }
                
                if (contentPreview) {
                    contentPreview.textContent = previewText;
                }
                
                if (characterCount) {
                    characterCount.style.display = 'block';
                }
                
                // Enable extract buttons
                if (extractRangeBtn) {
                    extractRangeBtn.disabled = false;
                }
                
                if (geminiRangeBtn) {
                    geminiRangeBtn.disabled = false;
                }
                
                showStatus('success', `Found ${contentLength.toLocaleString()} characters between markers`);
            } else {
                throw new Error(response?.error || 'Failed to find content between markers');
            }

        } catch (error) {
            console.error('Preview range failed:', error);
            showStatus('error', `Error: ${error.message}`);
            
            // Hide character count on error
            if (characterCount) {
                characterCount.style.display = 'none';
            }
        } finally {
            setButtonLoading(previewRangeBtn, false);
        }
    }

    async function handleExtractRange() {
        const startMarker = startMarkerInput?.value?.trim() || '';
        const endMarker = endMarkerInput?.value?.trim() || '';
        
        if (!startMarker || !endMarker) {
            showStatus('error', 'Please enter both start and end markers');
            return;
        }

        try {
            setButtonLoading(extractRangeBtn, true);
            showStatus('loading', 'Extracting content between markers...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get content between markers
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractCustomRange',
                startMarker: startMarker,
                endMarker: endMarker
            });

            if (response && response.success) {
                currentCustomRangeContent = response.content;
                
                // Show results
                if (customRangeContent) {
                    customRangeContent.textContent = currentCustomRangeContent;
                }
                
                if (resultsLength) {
                    resultsLength.textContent = `${currentCustomRangeContent.length.toLocaleString()} characters`;
                }
                
                if (customRangeResults) {
                    customRangeResults.style.display = 'block';
                }
                
                showStatus('success', `Extracted ${currentCustomRangeContent.length.toLocaleString()} characters`);
            } else {
                throw new Error(response?.error || 'Failed to extract content between markers');
            }

        } catch (error) {
            console.error('Extract range failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            setButtonLoading(extractRangeBtn, false);
        }
    }

    async function handleGeminiRange() {
        if (!geminiClient || !geminiClient.isConfigured()) {
            showStatus('error', 'Gemini API key not configured. Please add your API key in settings.');
            return;
        }

        const startMarker = startMarkerInput?.value?.trim() || '';
        const endMarker = endMarkerInput?.value?.trim() || '';
        
        if (!startMarker || !endMarker) {
            showStatus('error', 'Please enter both start and end markers');
            return;
        }

        try {
            setButtonLoading(geminiRangeBtn, true);
            showStatus('loading', 'Analyzing content between markers...');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                throw new Error('Cannot access content from Chrome internal pages');
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Step 1: Get content between markers (like preview step)
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractCustomRange',
                startMarker: startMarker,
                endMarker: endMarker
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to extract content between markers');
            }

            const contentLength = response.content.length;
            
            // Step 2: Update character count display (like preview step)
            if (characterCountValue) {
                characterCountValue.textContent = contentLength.toLocaleString();
            }
            
            if (contentPreview) {
                const previewText = response.content.substring(0, 200) + (contentLength > 200 ? '...' : '');
                contentPreview.textContent = previewText;
            }
            
            if (characterCount) {
                characterCount.style.display = 'block';
            }
            
            // Enable other buttons now that we have valid content
            if (extractRangeBtn) {
                extractRangeBtn.disabled = false;
            }
            
            showStatus('loading', `Found ${contentLength.toLocaleString()} characters. Processing with Gemini...`);

            // Step 3: Process with Gemini (the expensive step)
            const extractedContent = await geminiClient.extractContentFromHTML(response.content);
            currentCustomRangeContent = extractedContent;
            
            // Step 4: Show results
            if (customRangeContent) {
                customRangeContent.textContent = currentCustomRangeContent;
            }
            
            if (resultsLength) {
                resultsLength.textContent = `${currentCustomRangeContent.length.toLocaleString()} characters (Gemini processed)`;
            }
            
            if (customRangeResults) {
                customRangeResults.style.display = 'block';
            }
            
            showStatus('success', `Extracted and processed ${currentCustomRangeContent.length.toLocaleString()} characters with Gemini`);

        } catch (error) {
            console.error('Gemini range extraction failed:', error);
            showStatus('error', `Error: ${error.message}`);
            
            // Hide character count on error
            if (characterCount) {
                characterCount.style.display = 'none';
            }
        } finally {
            setButtonLoading(geminiRangeBtn, false);
        }
    }

    async function handleSaveMarkers() {
        const startMarker = startMarkerInput?.value?.trim() || '';
        const endMarker = endMarkerInput?.value?.trim() || '';
        
        if (!startMarker || !endMarker) {
            showStatus('error', 'Please enter both start and end markers before saving');
            return;
        }

        await saveCustomRangeMarkers(currentDomain, startMarker, endMarker);
    }

    function handleClearMarkers() {
        if (startMarkerInput) {
            startMarkerInput.value = '';
        }
        
        if (endMarkerInput) {
            endMarkerInput.value = '';
        }
        
        // Hide character count and results
        if (characterCount) {
            characterCount.style.display = 'none';
        }
        
        if (customRangeResults) {
            customRangeResults.style.display = 'none';
        }
        
        // Reset button states
        validateMarkers();
        
        showStatus('success', 'Markers cleared');
    }

    async function handleCopyCustomRange() {
        try {
            if (currentCustomRangeContent) {
                await navigator.clipboard.writeText(currentCustomRangeContent);
                
                // Show temporary feedback
                const originalText = copyCustomRangeBtn.textContent;
                copyCustomRangeBtn.textContent = '✅ Copied!';
                copyCustomRangeBtn.disabled = true;
                
                setTimeout(() => {
                    copyCustomRangeBtn.textContent = originalText;
                    copyCustomRangeBtn.disabled = false;
                }, 1500);
                
                showStatus('success', 'Content copied to clipboard');
            }
        } catch (error) {
            console.error('Failed to copy custom range content:', error);
            showStatus('error', 'Failed to copy content');
        }
    }

    function handleExpandCustomRange() {
        if (currentCustomRangeContent) {
            openSingleContentInNewTab('Custom Range Content', currentCustomRangeContent);
        } else {
            showStatus('error', 'No custom range content available');
        }
    }
}); 