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
    const viewMarkdownBtn = document.getElementById('viewMarkdownBtn');
    const viewGeminiMarkdownBtn = document.getElementById('viewGeminiMarkdownBtn');
    
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
    
    // Markdown Viewer elements
    const markdownStatus = document.getElementById('markdownStatus');
    const markdownViewerContainer = document.getElementById('markdownViewerContainer');
    const markdownTitle = document.getElementById('markdownTitle');
    const formattedViewBtn = document.getElementById('formattedViewBtn');
    const rawViewBtn = document.getElementById('rawViewBtn');
    const markdownCopyBtn = document.getElementById('markdownCopyBtn');
    const formattedView = document.getElementById('formattedView');
    const rawView = document.getElementById('rawView');
    const markdownRenderedContent = document.getElementById('markdownRenderedContent');
    const markdownRawContent = document.getElementById('markdownRawContent');
    
    // Header Structure elements
    const headerStatus = document.getElementById('headerStatus');
    const headerStructureContainer = document.getElementById('headerStructureContainer');
    const headerStructureContent = document.getElementById('headerStructureContent');
    const headerStats = document.getElementById('headerStats');
    const headerCopyBtn = document.getElementById('headerCopyBtn');
    const headerRefreshBtn = document.getElementById('headerRefreshBtn');
    
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
    let currentMarkdownContent = '';
    let currentMarkdownView = 'formatted';
    let currentHeaderStructure = null;

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
        
        // Load saved markdown content for the markdown tab
        loadSavedMarkdownContent();
        
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

    // Handle view markdown button click for AI content
    if (viewMarkdownBtn) {
        viewMarkdownBtn.addEventListener('click', handleViewAiMarkdown);
    }

    // Handle view markdown button click for Gemini content
    if (viewGeminiMarkdownBtn) {
        viewGeminiMarkdownBtn.addEventListener('click', handleViewGeminiMarkdown);
    }

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

    // Markdown Viewer Event Listeners
    if (formattedViewBtn) {
        formattedViewBtn.addEventListener('click', () => switchMarkdownView('formatted'));
    }
    
    if (rawViewBtn) {
        rawViewBtn.addEventListener('click', () => switchMarkdownView('raw'));
    }
    
    if (markdownCopyBtn) {
        markdownCopyBtn.addEventListener('click', handleCopyMarkdown);
    }

    // Header Structure Event Listeners
    if (headerCopyBtn) {
        headerCopyBtn.addEventListener('click', handleCopyHeaders);
    }
    
    if (headerRefreshBtn) {
        headerRefreshBtn.addEventListener('click', handleRefreshHeaders);
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
            // Format Gemini content as markdown and open in markdown tab
            const markdownContent = `# Extracted Content\n\n${currentGeminiContent}`;
            openMarkdownViewer(markdownContent);
        } else {
            showStatus('error', 'No extracted content available');
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
        console.log('Opening markdown viewer in tab:', markdownContent.substring(0, 100) + '...');
        
        // Set the current markdown content
        currentMarkdownContent = markdownContent;
        
        // Switch to the markdown viewer tab
        switchTab('markdown-viewer');
        
        // Load the markdown content
        loadMarkdownContent(markdownContent);
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
            
            // Special handling for markdown-viewer tab
            if (tabId === 'markdown-viewer') {
                loadSavedMarkdownContent();
            }
            
            // Special handling for header-structure tab
            if (tabId === 'header-structure') {
                loadHeaderStructure();
            }
            
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
            
            // IMPORTANT: Also set currentGeminiContent so it integrates with the main Gemini system
            currentGeminiContent = extractedContent;
            
            // Save to storage like regular Gemini extraction
            await saveGeminiData(currentUrl, extractedContent, 'custom-range');
            
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
            // Format custom range content as markdown and open in markdown tab
            const markdownContent = `# Custom Range Extracted Content\n\n${currentCustomRangeContent}`;
            openMarkdownViewer(markdownContent);
        } else {
            showStatus('error', 'No custom range content available');
        }
    }

    // Markdown Viewer Functions
    function loadMarkdownContent(markdownContent) {
        if (!markdownContent || !markdownContent.trim()) {
            showMarkdownStatus();
            return;
        }
        
        currentMarkdownContent = markdownContent;
        
        // Hide status and show viewer
        if (markdownStatus) {
            markdownStatus.style.display = 'none';
        }
        
        if (markdownViewerContainer) {
            markdownViewerContainer.style.display = 'block';
        }
        
        // Update title
        if (markdownTitle) {
            markdownTitle.textContent = 'Markdown Content';
        }
        
        // Load content into both views
        loadFormattedMarkdown(markdownContent);
        loadRawMarkdown(markdownContent);
        
        // Set the current view
        switchMarkdownView(currentMarkdownView);
    }
    
    function loadFormattedMarkdown(markdownContent) {
        if (!markdownRenderedContent) return;
        
        try {
            // Simple markdown to HTML conversion (basic)
            let html = markdownContent
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
                .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                .replace(/`(.*?)`/gim, '<code>$1</code>')
                .replace(/^\* (.*$)/gim, '<li>$1</li>')
                .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
                .replace(/\n/gim, '<br>');
            
            // Wrap list items
            html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            
            markdownRenderedContent.innerHTML = html;
        } catch (error) {
            console.error('Error rendering markdown:', error);
            markdownRenderedContent.innerHTML = '<p style="color: #f87171;">Error rendering markdown content</p>';
        }
    }
    
    function loadRawMarkdown(markdownContent) {
        if (!markdownRawContent) return;
        
        markdownRawContent.textContent = markdownContent;
    }
    
    function switchMarkdownView(view) {
        currentMarkdownView = view;
        
        // Update button states
        if (formattedViewBtn && rawViewBtn) {
            formattedViewBtn.classList.toggle('active', view === 'formatted');
            rawViewBtn.classList.toggle('active', view === 'raw');
        }
        
        // Update view visibility
        if (formattedView && rawView) {
            formattedView.classList.toggle('active', view === 'formatted');
            rawView.classList.toggle('active', view === 'raw');
        }
    }
    
    function showMarkdownStatus() {
        if (markdownStatus) {
            markdownStatus.style.display = 'block';
        }
        
        if (markdownViewerContainer) {
            markdownViewerContainer.style.display = 'none';
        }
    }
    
    async function handleCopyMarkdown() {
        if (!currentMarkdownContent) {
            showStatus('error', 'No markdown content to copy');
            return;
        }
        
        try {
            const contentToCopy = currentMarkdownView === 'formatted' 
                ? markdownRenderedContent.textContent 
                : currentMarkdownContent;
                
            await navigator.clipboard.writeText(contentToCopy);
            showStatus('success', 'Markdown content copied to clipboard');
            
            // Update button text temporarily
            if (markdownCopyBtn) {
                const originalText = markdownCopyBtn.innerHTML;
                markdownCopyBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Copied!';
                setTimeout(() => {
                    markdownCopyBtn.innerHTML = originalText;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy markdown:', error);
            showStatus('error', 'Failed to copy to clipboard');
        }
    }

    function handleViewAiMarkdown() {
        const markdownContent = currentAiData.markdown_renderable;
        if (markdownContent && markdownContent.trim()) {
            openMarkdownViewer(markdownContent);
        } else {
            showStatus('error', 'No AI markdown content available');
        }
    }

    function handleViewGeminiMarkdown() {
        if (currentGeminiContent && currentGeminiContent.trim()) {
            // Format Gemini content as markdown
            const markdownContent = `# Extracted Content\n\n${currentGeminiContent}`;
            openMarkdownViewer(markdownContent);
        } else {
            showStatus('error', 'No Gemini content available');
        }
    }

    function loadSavedMarkdownContent() {
        // Try to load content in order of priority
        let contentToLoad = null;
        let title = 'Markdown Content';
        
        // 1. First priority: AI markdown content
        if (currentAiData.markdown_renderable && currentAiData.markdown_renderable.trim()) {
            contentToLoad = currentAiData.markdown_renderable;
            title = 'AI Generated Markdown';
        }
        // 2. Second priority: Current Gemini content
        else if (currentGeminiContent && currentGeminiContent.trim()) {
            contentToLoad = `# Extracted Content\n\n${currentGeminiContent}`;
            title = 'Gemini Extracted Content';
        }
        // 3. Third priority: Saved Gemini data
        else if (savedGeminiData && savedGeminiData.content && savedGeminiData.content.trim()) {
            contentToLoad = `# Extracted Content\n\n${savedGeminiData.content}`;
            title = 'Saved Gemini Content';
        }
        
        if (contentToLoad) {
            // Update title
            if (markdownTitle) {
                markdownTitle.textContent = title;
            }
            
            // Load the content
            loadMarkdownContent(contentToLoad);
        } else {
            // Show the status message if no content is available
            showMarkdownStatus();
        }
    }

    // Header Structure Functions
    async function loadHeaderStructure() {
        try {
            showHeaderStatus('Analyzing headers...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showHeaderError('Cannot access headers from Chrome internal pages');
                return;
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get full HTML content
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copyFullHTML'
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to get page HTML');
            }

            // Extract headers from HTML
            const headerStructure = extractHeadersFromHTML(response.html);
            currentHeaderStructure = headerStructure;
            
            // Display the header structure
            displayHeaderStructure(headerStructure);
            
        } catch (error) {
            console.error('Header analysis failed:', error);
            showHeaderError(`Error: ${error.message}`);
        }
    }
    
    function extractHeadersFromHTML(html) {
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find all header elements
        const headerElements = tempDiv.querySelectorAll('h1, h2, h3, h4');
        const headers = [];
        
        headerElements.forEach((element, index) => {
            const level = element.tagName.toLowerCase();
            const text = element.textContent.trim();
            
            if (text) { // Only include headers with text content
                headers.push({
                    level: level,
                    text: text,
                    index: index + 1
                });
            }
        });
        
        return headers;
    }
    
    function displayHeaderStructure(headers) {
        if (!headers || headers.length === 0) {
            showNoHeaders();
            return;
        }
        
        // Hide status and show container
        if (headerStatus) {
            headerStatus.style.display = 'none';
        }
        
        if (headerStructureContainer) {
            headerStructureContainer.style.display = 'block';
        }
        
        // Generate header outline HTML
        let outlineHTML = '<div class="header-outline">';
        
        headers.forEach(header => {
            outlineHTML += `
                <div class="header-item ${header.level}">
                    <span class="header-level">${header.level}</span>
                    <span class="header-text">${escapeHtml(header.text)}</span>
                </div>
            `;
        });
        
        outlineHTML += '</div>';
        
        // Display the outline
        if (headerStructureContent) {
            headerStructureContent.innerHTML = outlineHTML;
        }
        
        // Display statistics
        displayHeaderStats(headers);
    }
    
    function displayHeaderStats(headers) {
        if (!headerStats) return;
        
        const stats = {
            h1: headers.filter(h => h.level === 'h1').length,
            h2: headers.filter(h => h.level === 'h2').length,
            h3: headers.filter(h => h.level === 'h3').length,
            h4: headers.filter(h => h.level === 'h4').length
        };
        
        const total = headers.length;
        
        headerStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${total}</span>
                <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.h1}</span>
                <span class="stat-label">H1</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.h2}</span>
                <span class="stat-label">H2</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.h3}</span>
                <span class="stat-label">H3</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.h4}</span>
                <span class="stat-label">H4</span>
            </div>
        `;
    }
    
    function showHeaderStatus(message) {
        if (headerStatus) {
            headerStatus.style.display = 'block';
            const statusText = headerStatus.querySelector('.status-text h4');
            if (statusText) {
                statusText.textContent = message;
            }
        }
        
        if (headerStructureContainer) {
            headerStructureContainer.style.display = 'none';
        }
    }
    
    function showHeaderError(message) {
        if (headerStatus) {
            headerStatus.style.display = 'block';
            const statusText = headerStatus.querySelector('.status-text h4');
            const statusDesc = headerStatus.querySelector('.status-text p');
            if (statusText) {
                statusText.textContent = 'Analysis Failed';
            }
            if (statusDesc) {
                statusDesc.textContent = message;
            }
        }
        
        if (headerStructureContainer) {
            headerStructureContainer.style.display = 'none';
        }
    }
    
    function showNoHeaders() {
        if (headerStatus) {
            headerStatus.style.display = 'none';
        }
        
        if (headerStructureContainer) {
            headerStructureContainer.style.display = 'block';
        }
        
        if (headerStructureContent) {
            headerStructureContent.innerHTML = `
                <div class="no-headers-message">
                    <div class="icon">📄</div>
                    <h4>No Headers Found</h4>
                    <p>This page doesn't contain any H1, H2, H3, or H4 header elements, or they may be dynamically generated.</p>
                </div>
            `;
        }
        
        if (headerStats) {
            headerStats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">0</span>
                    <span class="stat-label">Headers</span>
                </div>
            `;
        }
    }
    
    async function handleCopyHeaders() {
        if (!currentHeaderStructure || currentHeaderStructure.length === 0) {
            showStatus('error', 'No header structure to copy');
            return;
        }
        
        try {
            // Generate text outline
            let outline = 'Page Header Outline:\n\n';
            
            currentHeaderStructure.forEach(header => {
                const indent = '  '.repeat(['h1', 'h2', 'h3', 'h4'].indexOf(header.level));
                outline += `${indent}${header.level.toUpperCase()}: ${header.text}\n`;
            });
            
            await navigator.clipboard.writeText(outline);
            showStatus('success', 'Header outline copied to clipboard');
            
            // Update button text temporarily
            if (headerCopyBtn) {
                const originalText = headerCopyBtn.innerHTML;
                headerCopyBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Copied!';
                setTimeout(() => {
                    headerCopyBtn.innerHTML = originalText;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy headers:', error);
            showStatus('error', 'Failed to copy to clipboard');
        }
    }
    
    function handleRefreshHeaders() {
        loadHeaderStructure();
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    console.log('Matrx Side Panel loaded successfully');
}); 