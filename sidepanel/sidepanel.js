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
    const refreshUrlBtn = document.getElementById('refreshUrlBtn');
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
    
    // Link Analyzer elements
    const linkStatus = document.getElementById('linkStatus');
    const linkStructureContainer = document.getElementById('linkStructureContainer');
    const linkStructureContent = document.getElementById('linkStructureContent');
    const linkStats = document.getElementById('linkStats');
    const linkCopyBtn = document.getElementById('linkCopyBtn');
    const linkRefreshBtn = document.getElementById('linkRefreshBtn');
    const linkSmartModeBtn = document.getElementById('linkSmartModeBtn');
    const linkFullModeBtn = document.getElementById('linkFullModeBtn');
    
    // Image Analyzer elements
    const imageStatus = document.getElementById('imageStatus');
    const imageStructureContainer = document.getElementById('imageStructureContainer');
    const imageStructureContent = document.getElementById('imageStructureContent');
    const imageStats = document.getElementById('imageStats');
    const imageCopyBtn = document.getElementById('imageCopyBtn');
    const imageRefreshBtn = document.getElementById('imageRefreshBtn');
    const imageSmartModeBtn = document.getElementById('imageSmartModeBtn');
    const imageFullModeBtn = document.getElementById('imageFullModeBtn');

    // Text Content tab elements
    const textStatus = document.getElementById('textStatus');
    const textContentContainer = document.getElementById('textContentContainer');
    const textContentDisplay = document.getElementById('textContentDisplay');
    const textStats = document.getElementById('textStats');
    const textCopyBtn = document.getElementById('textCopyBtn');
    const textRefreshBtn = document.getElementById('textRefreshBtn');

    // Summary Generator elements
    const summaryStatus = document.getElementById('summaryStatus');
    const summaryViewerContainer = document.getElementById('summaryViewerContainer');
    const summaryTitle = document.getElementById('summaryTitle');
    const summaryFormattedViewBtn = document.getElementById('summaryFormattedViewBtn');
    const summaryRawViewBtn = document.getElementById('summaryRawViewBtn');
    const summaryCopyBtn = document.getElementById('summaryCopyBtn');
    const summaryFormattedView = document.getElementById('summaryFormattedView');
    const summaryRawView = document.getElementById('summaryRawView');
    const summaryRenderedContent = document.getElementById('summaryRenderedContent');
    const summaryRawContent = document.getElementById('summaryRawContent');
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    
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
    let currentLinkStructure = null;
    let currentImageStructure = null;
    let currentSummaryContent = null;
    let currentTextContent = null;
    let linkAnalysisMode = 'smart'; // 'smart' or 'full'
    let imageAnalysisMode = 'smart'; // 'smart' or 'full'

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
        
        // Try to load saved Gemini data (includes both full content and summaries) for this URL
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

    // Handle settings button click
    function openSettings(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        window.close();
    }
    
    // Handle manual URL refresh
    async function handleManualRefresh() {
        try {
            // Show loading state
            if (refreshUrlBtn) {
                refreshUrlBtn.disabled = true;
                refreshUrlBtn.innerHTML = `
                    <svg class="refresh-icon spin" viewBox="0 0 24 24">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                    </svg>
                    <span class="refresh-text">Refreshing...</span>
                `;
            }
            
            // Get fresh current tab information
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            const newUrl = tab.url;
            const urlChanged = newUrl !== currentUrl;
            
            console.log('Manual refresh triggered:', { oldUrl: currentUrl, newUrl, urlChanged });
            
            // Update current URL
            currentUrl = newUrl;
            
            // Update URL display
            if (currentUrlSpan) {
                currentUrlSpan.textContent = currentUrl;
            }
            
            // Update domain for custom range
            try {
                const url = new URL(currentUrl);
                currentDomain = url.hostname;
                if (customRangeDomain) {
                    customRangeDomain.textContent = currentDomain;
                }
            } catch (error) {
                currentDomain = 'Unknown';
                if (customRangeDomain) {
                    customRangeDomain.textContent = 'Unknown domain';
                }
            }
            
            if (urlChanged) {
                // Clear all previous data
                currentAiData = {
                    ai_content: '',
                    ai_research_content: '',
                    markdown_renderable: '',
                    raw_html: '',
                    smart_html: '',
                    custom_smart_html: ''
                };
                currentGeminiContent = '';
                currentCustomRangeContent = '';
                currentHeaderStructure = null;
                currentLinkStructure = null;
                currentImageStructure = null;
                currentSummaryContent = null;
                currentTextContent = null;
                
                // Reset all tabs to initial state
                resetAllTabsToInitialState();
                
                // Load saved data for new URL
                await loadSavedAiData(currentUrl);
                await loadSavedGeminiData(currentUrl);  // Now includes both full content and summaries
                await loadSavedCustomRangeMarkers(currentDomain);
                
                // Reload content for active tabs
                loadSavedMarkdownContent();
                
                // Auto-refresh analyzer tabs if they are active
                const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
                if (activeTab === 'header-structure') {
                    loadHeaderStructure();
                } else if (activeTab === 'link-analyzer') {
                    loadLinkStructure();
                } else if (activeTab === 'image-analyzer') {
                    loadImageStructure();
                }
                
                showStatus('success', 'Extension refreshed for new page');
            } else {
                showStatus('info', 'Extension refreshed (same page)');
            }
            
        } catch (error) {
            console.error('Manual refresh failed:', error);
            showStatus('error', 'Failed to refresh: ' + error.message);
        } finally {
            // Restore button state
            if (refreshUrlBtn) {
                refreshUrlBtn.disabled = false;
                refreshUrlBtn.innerHTML = `
                    <svg class="refresh-icon" viewBox="0 0 24 24">
                        <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                    </svg>
                    <span class="refresh-text">Refresh</span>
                `;
            }
        }
    }
    
    if (settingsLink) {
        settingsLink.addEventListener('click', openSettings);
    }
    
    if (refreshUrlBtn) {
        refreshUrlBtn.addEventListener('click', handleManualRefresh);
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

    // Link Analyzer Event Listeners
    if (linkCopyBtn) {
        linkCopyBtn.addEventListener('click', handleCopyLinks);
    }
    
    if (linkRefreshBtn) {
        linkRefreshBtn.addEventListener('click', handleRefreshLinks);
    }
    
    if (linkSmartModeBtn) {
        linkSmartModeBtn.addEventListener('click', () => handleLinkModeToggle('smart'));
    }
    
    if (linkFullModeBtn) {
        linkFullModeBtn.addEventListener('click', () => handleLinkModeToggle('full'));
    }

    // Image Analyzer Event Listeners
    if (imageCopyBtn) {
        imageCopyBtn.addEventListener('click', handleCopyImages);
    }
    
    if (imageRefreshBtn) {
        imageRefreshBtn.addEventListener('click', handleRefreshImages);
    }
    
    if (imageSmartModeBtn) {
        imageSmartModeBtn.addEventListener('click', () => handleImageModeToggle('smart'));
    }
    
    if (imageFullModeBtn) {
        imageFullModeBtn.addEventListener('click', () => handleImageModeToggle('full'));
    }

    // Text Content event listeners
    if (textCopyBtn) {
        textCopyBtn.addEventListener('click', handleCopyText);
    }
    
    if (textRefreshBtn) {
        textRefreshBtn.addEventListener('click', handleRefreshText);
    }

    // Summary Generator event listeners
    if (generateSummaryBtn) {
        generateSummaryBtn.addEventListener('click', handleGenerateSummary);
    }
    
    if (summaryCopyBtn) {
        summaryCopyBtn.addEventListener('click', handleCopySummary);
    }
    
    if (summaryFormattedViewBtn) {
        summaryFormattedViewBtn.addEventListener('click', () => switchSummaryView('formatted'));
    }
    
    if (summaryRawViewBtn) {
        summaryRawViewBtn.addEventListener('click', () => switchSummaryView('raw'));
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
            const markdownContent = currentGeminiContent;
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
            
            // Save to unified storage immediately after successful extraction
            await saveGeminiFullContent(currentUrl, extractedContent, type);
            
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
            
            // Special handling for link-analyzer tab
            if (tabId === 'link-analyzer') {
                loadLinkStructure();
            }
            
            // Special handling for image-analyzer tab
            if (tabId === 'image-analyzer') {
                loadImageStructure();
            }
            
            // Special handling for text-content tab
            if (tabId === 'text-content') {
                loadTextContent();
            }
            
            // Reset min-height after animation
            setTimeout(() => {
                if (container) {
                    container.style.minHeight = '';
                }
            }, 250);
        }
    }

    // Unified Gemini Storage Functions (handles both full content and summaries)
    async function loadSavedGeminiData(url) {
        try {
            const storageKey = `matrx_gemini_${btoa(url).slice(0, 50)}`;
            console.log('Loading unified Gemini data for:', { url, storageKey });
            
            const result = await chrome.storage.local.get([storageKey]);
            
            if (result[storageKey]) {
                const data = result[storageKey];
                console.log('Found saved unified Gemini data:', { 
                    fullContentLength: data.fullContent?.length || 0,
                    summaryContentLength: data.summaryContent?.length || 0,
                    fullContentType: data.fullContentType,
                    timestamp: new Date(data.timestamp).toLocaleString()
                });
                
                // Check if data is not too old (24 hours)
                const twentyFourHours = 24 * 60 * 60 * 1000;
                if (Date.now() - data.timestamp < twentyFourHours) {
                    savedGeminiData = data;
                    
                    // Load full content if available
                    if (data.fullContent) {
                        currentGeminiContent = data.fullContent;
                        showSavedGeminiResults(data);
                    }
                    
                    // Load summary if available
                    if (data.summaryContent) {
                        currentSummaryContent = data.summaryContent;
                        displaySummary(data.summaryContent);
                    }
                    
                    console.log('✅ Loaded saved unified Gemini data for URL:', url);
                } else {
                    // Remove expired data
                    await chrome.storage.local.remove([storageKey]);
                    console.log('🗑️ Removed expired unified Gemini data for URL:', url);
                }
            } else {
                console.log('No saved unified Gemini data found for URL:', url);
            }
        } catch (error) {
            console.error('❌ Failed to load saved unified Gemini data:', error);
        }
    }
    
    async function saveGeminiFullContent(url, content, extractionType) {
        try {
            const storageKey = `matrx_gemini_${btoa(url).slice(0, 50)}`;
            
            // Get existing data first
            const result = await chrome.storage.local.get([storageKey]);
            const existingData = result[storageKey] || {};
            
            const dataToSave = {
                ...existingData,
                fullContent: content,
                fullContentType: extractionType,
                url: url,
                timestamp: Date.now()
            };
            
            console.log('Saving Gemini full content:', { 
                url, 
                storageKey, 
                contentLength: content.length, 
                extractionType,
                hasExistingSummary: !!existingData.summaryContent
            });
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            savedGeminiData = dataToSave;
            showSavedGeminiResults(dataToSave);
            console.log('✅ Successfully saved Gemini full content for URL:', url);
        } catch (error) {
            console.error('❌ Failed to save Gemini full content:', error);
        }
    }
    
    async function saveGeminiSummary(url, content) {
        try {
            const storageKey = `matrx_gemini_${btoa(url).slice(0, 50)}`;
            
            // Get existing data first
            const result = await chrome.storage.local.get([storageKey]);
            const existingData = result[storageKey] || {};
            
            const dataToSave = {
                ...existingData,
                summaryContent: content,
                url: url,
                timestamp: Date.now()
            };
            
            console.log('Saving Gemini summary:', { 
                url, 
                storageKey, 
                contentLength: content.length,
                hasExistingFullContent: !!existingData.fullContent
            });
            
            await chrome.storage.local.set({ [storageKey]: dataToSave });
            savedGeminiData = dataToSave;
            console.log('✅ Successfully saved Gemini summary for URL:', url);
        } catch (error) {
            console.error('❌ Failed to save Gemini summary:', error);
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

    // Debug function to list all storage keys
    async function debugStorageKeys() {
        try {
            const allData = await chrome.storage.local.get(null);
            const keys = Object.keys(allData).filter(key => key.startsWith('matrx_'));
            console.log('📦 Storage Debug - All Matrx keys:', keys);
            keys.forEach(key => {
                const data = allData[key];
                if (key.startsWith('matrx_gemini_')) {
                    // Unified Gemini storage
                    console.log(`  ${key}:`, {
                        url: data.url,
                        fullContentLength: data.fullContent?.length || 0,
                        summaryContentLength: data.summaryContent?.length || 0,
                        fullContentType: data.fullContentType,
                        timestamp: new Date(data.timestamp).toLocaleString(),
                        type: 'unified-gemini'
                    });
                } else {
                    // Other storage (AI, custom markers, etc.)
                    console.log(`  ${key}:`, {
                        url: data.url,
                        contentLength: data.content?.length,
                        timestamp: new Date(data.timestamp).toLocaleString(),
                        type: data.extractionType || 'other'
                    });
                }
            });
        } catch (error) {
            console.error('❌ Failed to debug storage:', error);
        }
    }
    
    // Add to global scope for console debugging
    window.debugStorage = debugStorageKeys;

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
            
            // Save to unified storage like regular Gemini extraction
            await saveGeminiFullContent(currentUrl, extractedContent, 'custom-range');
            
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
            const markdownContent = currentCustomRangeContent;
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
            // Use the centralized markdown conversion utility
            const htmlContent = convertMarkdownToHTML(markdownContent);
            markdownRenderedContent.innerHTML = htmlContent;
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
            const markdownContent = currentGeminiContent;
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
            contentToLoad = currentGeminiContent;
            title = 'Gemini Extracted Content';
        }
        // 3. Third priority: Saved Gemini data
        else if (savedGeminiData && savedGeminiData.content && savedGeminiData.content.trim()) {
            contentToLoad = savedGeminiData.content;
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

    // Link Analyzer Functions
    async function loadLinkStructure() {
        try {
            showLinkStatus('Analyzing links...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showLinkError('Cannot access links from Chrome internal pages');
                return;
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get HTML content based on selected analysis mode
            const action = linkAnalysisMode === 'smart' ? 'copySmartHTML' : 'copyFullHTML';
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: action
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to get page HTML');
            }

            // Extract links from Smart HTML
            const linkStructure = extractLinksFromHTML(response.html, tab.url);
            currentLinkStructure = linkStructure;
            
            // Display the link structure
            displayLinkStructure(linkStructure);
            
        } catch (error) {
            console.error('Link analysis failed:', error);
            showLinkError(`Error: ${error.message}`);
        }
    }
    
    function extractLinksFromHTML(html, currentUrl) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const linkElements = tempDiv.querySelectorAll('a[href]');
        const links = [];
        
        linkElements.forEach((element, index) => {
            const href = element.getAttribute('href');
            const text = element.textContent.trim();
            
            if (href && href !== '#') {
                const linkType = classifyLink(href, currentUrl);
                links.push({
                    url: href,
                    text: text || href,
                    type: linkType,
                    index: index + 1
                });
            }
        });
        
        return links;
    }
    
    function classifyLink(href, currentUrl) {
        try {
            if (href.startsWith('mailto:')) {
                return 'email';
            }
            if (href.startsWith('#')) {
                return 'anchor';
            }
            if (href.startsWith('http') || href.startsWith('//')) {
                const linkHost = new URL(href, currentUrl).hostname;
                const currentHost = new URL(currentUrl).hostname;
                return linkHost === currentHost ? 'internal' : 'external';
            }
            return 'internal'; // Relative links
        } catch (error) {
            return 'external';
        }
    }
    
    // Image Analyzer Functions
    async function loadImageStructure() {
        try {
            showImageStatus('Analyzing images...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showImageError('Cannot access images from Chrome internal pages');
                return;
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get HTML content based on selected analysis mode
            const action = imageAnalysisMode === 'smart' ? 'copySmartHTML' : 'copyFullHTML';
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: action
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to get page HTML');
            }

            // Extract images from Smart HTML
            const imageStructure = extractImagesFromHTML(response.html, tab.url);
            currentImageStructure = imageStructure;
            
            // Display the image structure
            displayImageStructure(imageStructure);
            
        } catch (error) {
            console.error('Image analysis failed:', error);
            showImageError(`Error: ${error.message}`);
        }
    }
    
    function extractImagesFromHTML(html, currentUrl) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const imageElements = tempDiv.querySelectorAll('img[src]');
        const images = [];
        
        imageElements.forEach((element, index) => {
            const src = element.getAttribute('src');
            const alt = element.getAttribute('alt') || '';
            const title = element.getAttribute('title') || '';
            
            if (src) {
                // Convert relative URLs to absolute
                const absoluteSrc = src.startsWith('http') ? src : new URL(src, currentUrl).href;
                
                images.push({
                    src: absoluteSrc,
                    alt: alt,
                    title: title,
                    index: index + 1
                });
            }
        });
        
        return images;
    }
    
    // Display Functions
    function displayLinkStructure(links) {
        if (!links || links.length === 0) {
            showNoLinks();
            return;
        }
        
        if (linkStatus) linkStatus.style.display = 'none';
        if (linkStructureContainer) linkStructureContainer.style.display = 'block';
        
        let linksHTML = '<div class="link-list">';
        
        links.forEach((link, index) => {
            linksHTML += `
                <div class="link-item ${link.type}" data-link-index="${index}">
                    <div class="link-url clickable-link" title="Click to open in new tab">${escapeHtml(link.url)}</div>
                    <div class="link-text">${escapeHtml(link.text)}</div>
                    <span class="link-type ${link.type}">${link.type}</span>
                </div>
            `;
        });
        
        linksHTML += '</div>';
        
        if (linkStructureContent) {
            linkStructureContent.innerHTML = linksHTML;
            
            // Add click handlers for links
            const linkItems = linkStructureContent.querySelectorAll('.link-item');
            linkItems.forEach((item, index) => {
                const clickableLink = item.querySelector('.clickable-link');
                if (clickableLink) {
                    clickableLink.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleLinkClick(links[index]);
                    });
                    clickableLink.style.cursor = 'pointer';
                }
            });
        }
        
        displayLinkStats(links);
    }
    
    function displayImageStructure(images) {
        if (!images || images.length === 0) {
            showNoImages();
            return;
        }
        
        if (imageStatus) imageStatus.style.display = 'none';
        if (imageStructureContainer) imageStructureContainer.style.display = 'block';
        
        let imagesHTML = '<div class="image-list">';
        
        images.forEach((image, index) => {
            imagesHTML += `
                <div class="image-item" data-image-index="${index}">
                    <div class="image-preview clickable-image" style="background-image: url('${image.src}')" title="Click to download image"></div>
                    <div class="image-details">
                        <div class="image-src clickable-image" title="Click to download image">${escapeHtml(image.src)}</div>
                        <div class="image-alt">${escapeHtml(image.alt || 'No alt text')}</div>
                        <span class="image-info">IMG</span>
                    </div>
                </div>
            `;
        });
        
        imagesHTML += '</div>';
        
        if (imageStructureContent) {
            imageStructureContent.innerHTML = imagesHTML;
            
            // Add click handlers for images
            const imageItems = imageStructureContent.querySelectorAll('.image-item');
            imageItems.forEach((item, index) => {
                const clickableImages = item.querySelectorAll('.clickable-image');
                clickableImages.forEach(clickable => {
                    clickable.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handleImageClick(images[index]);
                    });
                    clickable.style.cursor = 'pointer';
                });
            });
        }
        
        displayImageStats(images);
    }
    
    function displayLinkStats(links) {
        if (!linkStats) return;
        
        const stats = {
            internal: links.filter(l => l.type === 'internal').length,
            external: links.filter(l => l.type === 'external').length,
            email: links.filter(l => l.type === 'email').length,
            anchor: links.filter(l => l.type === 'anchor').length
        };
        
        linkStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${links.length}</span>
                <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.internal}</span>
                <span class="stat-label">Internal</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.external}</span>
                <span class="stat-label">External</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.email}</span>
                <span class="stat-label">Email</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.anchor}</span>
                <span class="stat-label">Anchor</span>
            </div>
        `;
    }
    
    function displayImageStats(images) {
        if (!imageStats) return;
        
        const withAlt = images.filter(img => img.alt && img.alt.trim()).length;
        const withoutAlt = images.length - withAlt;
        
        imageStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${images.length}</span>
                <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${withAlt}</span>
                <span class="stat-label">With Alt</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${withoutAlt}</span>
                <span class="stat-label">No Alt</span>
            </div>
        `;
    }
    
    // Status and Error Functions
    function showLinkStatus(message) {
        if (linkStatus) {
            linkStatus.style.display = 'block';
            const statusText = linkStatus.querySelector('.status-text h4');
            if (statusText) statusText.textContent = message;
        }
        if (linkStructureContainer) linkStructureContainer.style.display = 'none';
    }
    
    function showLinkError(message) {
        if (linkStatus) {
            linkStatus.style.display = 'block';
            const statusText = linkStatus.querySelector('.status-text h4');
            const statusDesc = linkStatus.querySelector('.status-text p');
            if (statusText) statusText.textContent = 'Analysis Failed';
            if (statusDesc) statusDesc.textContent = message;
        }
        if (linkStructureContainer) linkStructureContainer.style.display = 'none';
    }
    
    function showImageStatus(message) {
        if (imageStatus) {
            imageStatus.style.display = 'block';
            const statusText = imageStatus.querySelector('.status-text h4');
            if (statusText) statusText.textContent = message;
        }
        if (imageStructureContainer) imageStructureContainer.style.display = 'none';
    }
    
    function showImageError(message) {
        if (imageStatus) {
            imageStatus.style.display = 'block';
            const statusText = imageStatus.querySelector('.status-text h4');
            const statusDesc = imageStatus.querySelector('.status-text p');
            if (statusText) statusText.textContent = 'Analysis Failed';
            if (statusDesc) statusDesc.textContent = message;
        }
        if (imageStructureContainer) imageStructureContainer.style.display = 'none';
    }
    
    function showNoLinks() {
        if (linkStatus) linkStatus.style.display = 'none';
        if (linkStructureContainer) linkStructureContainer.style.display = 'block';
        if (linkStructureContent) {
            linkStructureContent.innerHTML = `
                <div class="no-links-message">
                    <div class="icon">🔗</div>
                    <h4>No Links Found</h4>
                    <p>This page doesn't contain any links in the main content area.</p>
                </div>
            `;
        }
        if (linkStats) {
            linkStats.innerHTML = `<div class="stat-item"><span class="stat-number">0</span><span class="stat-label">Links</span></div>`;
        }
    }
    
    function showNoImages() {
        if (imageStatus) imageStatus.style.display = 'none';
        if (imageStructureContainer) imageStructureContainer.style.display = 'block';
        if (imageStructureContent) {
            imageStructureContent.innerHTML = `
                <div class="no-images-message">
                    <div class="icon">🖼️</div>
                    <h4>No Images Found</h4>
                    <p>This page doesn't contain any images in the main content area.</p>
                </div>
            `;
        }
        if (imageStats) {
            imageStats.innerHTML = `<div class="stat-item"><span class="stat-number">0</span><span class="stat-label">Images</span></div>`;
        }
    }
    
    // Copy and Refresh Functions
    async function handleCopyLinks() {
        if (!currentLinkStructure || currentLinkStructure.length === 0) {
            showStatus('error', 'No links to copy');
            return;
        }
        
        try {
            let linksList = 'Page Links Analysis:\n\n';
            
            currentLinkStructure.forEach(link => {
                linksList += `${link.type.toUpperCase()}: ${link.text}\n${link.url}\n\n`;
            });
            
            await navigator.clipboard.writeText(linksList);
            showStatus('success', 'Links list copied to clipboard');
            
            if (linkCopyBtn) {
                const originalText = linkCopyBtn.innerHTML;
                linkCopyBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Copied!';
                setTimeout(() => linkCopyBtn.innerHTML = originalText, 2000);
            }
        } catch (error) {
            showStatus('error', 'Failed to copy to clipboard');
        }
    }
    
    async function handleCopyImages() {
        if (!currentImageStructure || currentImageStructure.length === 0) {
            showStatus('error', 'No images to copy');
            return;
        }
        
        try {
            let imagesList = 'Page Images Analysis:\n\n';
            
            currentImageStructure.forEach(image => {
                imagesList += `Image: ${image.alt || 'No alt text'}\n${image.src}\n\n`;
            });
            
            await navigator.clipboard.writeText(imagesList);
            showStatus('success', 'Images list copied to clipboard');
            
            if (imageCopyBtn) {
                const originalText = imageCopyBtn.innerHTML;
                imageCopyBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>Copied!';
                setTimeout(() => imageCopyBtn.innerHTML = originalText, 2000);
            }
        } catch (error) {
            showStatus('error', 'Failed to copy to clipboard');
        }
    }
    
    function handleRefreshLinks() {
        loadLinkStructure();
    }
    
    function handleRefreshImages() {
        loadImageStructure();
    }

    // Text Content Functions
    async function loadTextContent() {
        try {
            showTextStatus('Extracting text content...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showTextError('Cannot access content from Chrome internal pages');
                return;
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);

            // Get Smart HTML content (focused on main content)
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'copySmartHTML' });
            
            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to get page content');
            }

            // Extract text content from HTML
            const textContent = extractTextFromHTML(response.html);
            
            if (!textContent || textContent.trim().length === 0) {
                showNoText();
                return;
            }

            currentTextContent = textContent;
            displayTextContent(textContent);
            
        } catch (error) {
            console.error('Text content extraction failed:', error);
            showTextError(error.message);
        }
    }
    
    function extractTextFromHTML(html) {
        try {
            // Create a temporary DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove script and style elements
            const scriptsAndStyles = doc.querySelectorAll('script, style, noscript');
            scriptsAndStyles.forEach(el => el.remove());
            
            // ========================================
            // TEXT IGNORE LIST - Add unwanted text here
            // ========================================
            // List of exact text matches to ignore (case-insensitive)
            // To add more: just add new strings to this array
            const ignoreTexts = [
                'Toggle High Contrast',
                'Toggle Font size',
                'Skip to main content',
                'Skip to content',
                'Menu',
                'Search',
                'Close',
                'Open menu',
                'Close menu',
                'Home',
                'Back to top',
                'Scroll to top',
                'Read more',
                'Continue reading',
                'Share',
                'Print',
                'Email',
                'Facebook',
                'Twitter',
                'LinkedIn',
                'Pinterest',
                'WhatsApp',
                'Copy link',
                'Subscribe',
                'Sign up',
                'Log in',
                'Login',
                'Register',
                'Contact us',
                'Privacy Policy',
                'Terms of Service',
                'Cookie Policy',
                'Accept all cookies',
                'Manage cookies',
                'Cookie settings'
            ];
            
            // Convert to lowercase for case-insensitive matching
            const ignoreTextsLower = ignoreTexts.map(text => text.toLowerCase());
            
            // Function to check if text should be ignored
            function shouldIgnoreText(text) {
                const cleanText = text.trim();
                const lowerText = cleanText.toLowerCase();
                
                // Check for exact matches (case-insensitive)
                return ignoreTextsLower.includes(lowerText);
            }
            
            const textParts = [];
            
            // Extract title if available
            const title = doc.querySelector('title');
            if (title && title.textContent.trim()) {
                textParts.push(`TITLE: ${title.textContent.trim()}`);
            }
            
            // Use a different approach: walk through the document and extract text node by node
            function walkAndExtract(node) {
                if (!node) return;
                
                const tagName = node.tagName ? node.tagName.toLowerCase() : '';
                
                // Handle headings
                if (tagName.match(/^h[1-6]$/)) {
                    const text = node.textContent.trim();
                    if (text && text.length > 3 && !shouldIgnoreText(text)) {
                        textParts.push(`${tagName.toUpperCase()}: ${text}`);
                    }
                    return; // Don't process children of headings
                }
                
                // Handle paragraphs
                if (tagName === 'p') {
                    const text = node.textContent.trim();
                    if (text && text.length > 20 && !shouldIgnoreText(text)) {
                        textParts.push(text);
                    }
                    return; // Don't process children of paragraphs
                }
                
                // Handle list items
                if (tagName === 'li') {
                    const text = node.textContent.trim();
                    if (text && text.length > 10 && !shouldIgnoreText(text)) {
                        textParts.push(`• ${text}`);
                    }
                    return; // Don't process children of list items
                }
                
                // Handle divs and other containers - but only if they don't have block-level children
                if (tagName.match(/^(div|article|section|main)$/)) {
                    const hasBlockChildren = node.querySelector('h1, h2, h3, h4, h5, h6, p, div, article, section, main, ul, ol');
                    if (!hasBlockChildren) {
                        const text = node.textContent.trim();
                        if (text && text.length > 20 && !shouldIgnoreText(text)) {
                            textParts.push(text);
                        }
                        return; // Don't process children
                    }
                }
                
                // For other elements, continue processing children
                if (node.children) {
                    for (const child of node.children) {
                        walkAndExtract(child);
                    }
                }
            }
            
            // Start walking from the body
            const body = doc.body || doc.documentElement;
            walkAndExtract(body);
            
            // Remove duplicates while preserving order
            const uniqueParts = [];
            const seen = new Set();
            
            for (const part of textParts) {
                const cleanPart = part.replace(/\s+/g, ' ').trim();
                if (!seen.has(cleanPart) && cleanPart.length > 0) {
                    uniqueParts.push(part);
                    seen.add(cleanPart);
                }
            }
            
            // Join with double line breaks for good separation
            const result = uniqueParts.join('\n\n');
            
            // // Debug logging to see what we're generating
            // console.log('Text extraction result:');
            // console.log('Total parts before filtering:', textParts.length);
            // console.log('Unique parts after filtering:', uniqueParts.length);
            // console.log('First few parts:', uniqueParts.slice(0, 8));
            // console.log('Result length:', result.length);
            // console.log('Has line breaks:', (result.match(/\n/g) || []).length);
            
            // // Log any ignored texts that were found (for debugging)
            // const ignoredCount = textParts.length - uniqueParts.length;
            // if (ignoredCount > 0) {
            //     console.log(`Filtered out ${ignoredCount} duplicate/ignored items`);
            // }
            
            return result;
            
        } catch (error) {
            console.error('Error extracting text from HTML:', error);
            return '';
        }
    }
    
    function displayTextContent(textContent) {
        if (!textContentDisplay || !textContentContainer || !textStatus) return;
        
        // Hide status, show container
        textStatus.style.display = 'none';
        textContentContainer.style.display = 'block';
        
        // Convert line breaks to HTML for better display
        const htmlContent = textContent.replace(/\n/g, '<br>');
        
        // Display the text content using innerHTML to preserve line breaks
        textContentDisplay.innerHTML = htmlContent;
        
        // Also log for debugging
        // console.log('Displaying text content:');
        // console.log('Original length:', textContent.length);
        // console.log('Line breaks in original:', (textContent.match(/\n/g) || []).length);
        // console.log('HTML length:', htmlContent.length);
        
        // Display statistics
        displayTextStats(textContent);
    }
    
    function displayTextStats(textContent) {
        if (!textStats) return;
        
        const lines = textContent.split('\n').filter(line => line.trim().length > 0);
        const words = textContent.split(/\s+/).filter(word => word.length > 0);
        const characters = textContent.length;
        const charactersNoSpaces = textContent.replace(/\s/g, '').length;
        
        const headingCount = (textContent.match(/^H[1-6]:/gm) || []).length;
        const paragraphs = lines.filter(line => !line.match(/^(H[1-6]:|TITLE:|•)/)).length;
        const listItems = (textContent.match(/^•/gm) || []).length;
        
        textStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${characters.toLocaleString()}</span>
                <span class="stat-label">Characters</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${words.length.toLocaleString()}</span>
                <span class="stat-label">Words</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${lines.length.toLocaleString()}</span>
                <span class="stat-label">Lines</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${headingCount}</span>
                <span class="stat-label">Headings</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${paragraphs}</span>
                <span class="stat-label">Paragraphs</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${listItems}</span>
                <span class="stat-label">List Items</span>
            </div>
        `;
    }
    
    function showTextStatus(message) {
        if (textStatus) {
            textStatus.style.display = 'block';
            const statusText = textStatus.querySelector('.status-text p');
            if (statusText) {
                statusText.textContent = message;
            }
        }
        if (textContentContainer) {
            textContentContainer.style.display = 'none';
        }
    }
    
    function showTextError(message) {
        if (textStatus) {
            textStatus.style.display = 'block';
            textStatus.innerHTML = `
                <div class="status-icon">❌</div>
                <div class="status-text">
                    <h4>Text Extraction Failed</h4>
                    <p>${escapeHtml(message)}</p>
                </div>
            `;
        }
        if (textContentContainer) {
            textContentContainer.style.display = 'none';
        }
    }
    
    function showNoText() {
        if (textContentContainer && textContentDisplay) {
            textStatus.style.display = 'none';
            textContentContainer.style.display = 'block';
            textContentDisplay.innerHTML = '<div class="no-text-message">No readable text content found on this page.</div>';
            if (textStats) {
                textStats.innerHTML = '';
            }
        }
    }
    
    function handleCopyText() {
        if (!currentTextContent) {
            showStatus('error', 'No text content to copy');
            return;
        }

        navigator.clipboard.writeText(currentTextContent).then(() => {
            showStatus('success', 'Text content copied to clipboard');
        }).catch(error => {
            console.error('Copy failed:', error);
            showStatus('error', 'Failed to copy text content');
        });
    }
    
    function handleRefreshText() {
        loadTextContent();
    }

    // Summary Generator Functions
    async function handleGenerateSummary() {
        if (!generateSummaryBtn) return;
        
        try {
            setButtonLoading(generateSummaryBtn, true);
            
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showStatus('error', 'Cannot generate summary from Chrome internal pages');
                return;
            }

            // Ensure content script is available
            await ensureContentScript(tab.id);
            
            // Get smart HTML content
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'copySmartHTML' 
            });
            
            if (!response || !response.success || !response.html) {
                showStatus('error', 'Failed to extract page content');
                return;
            }
            
            // Send to Gemini for summarization using the dedicated method
            if (!geminiClient) {
                showStatus('error', 'Gemini client not initialized. Please check your API key in settings.');
                return;
            }
            
            const summaryContent = await geminiClient.summarizeContentFromHTML(response.html);
            
            if (summaryContent) {
                currentSummaryContent = summaryContent;
                displaySummary(summaryContent);
                
                // Save the summary to unified storage
                await saveGeminiSummary(currentUrl, summaryContent);
                
                showStatus('success', 'Summary generated successfully');
            } else {
                showStatus('error', 'Failed to generate summary');
            }
            
        } catch (error) {
            console.error('Error generating summary:', error);
            showStatus('error', 'Error generating summary: ' + error.message);
        } finally {
            setButtonLoading(generateSummaryBtn, false);
        }
    }

    // Centralized markdown conversion using global MarkdownUtils
    function convertMarkdownToHTML(markdownContent) {
        if (window.MarkdownUtils) {
            return window.MarkdownUtils.toHTML(markdownContent);
        } else {
            console.error('MarkdownUtils not available');
            return '<p style="color: #f87171;">Markdown utilities not loaded</p>';
        }
    }

    function displaySummary(content) {
        if (!summaryRenderedContent || !summaryViewerContainer || !summaryStatus) return;
        
        // Hide status, show container
        summaryStatus.style.display = 'none';
        summaryViewerContainer.style.display = 'block';
        
        // Update title
        if (summaryTitle) {
            summaryTitle.textContent = 'Page Summary';
        }
        
        // Load content into both views
        loadFormattedSummary(content);
        loadRawSummary(content);
        
        // Set the default view to formatted
        switchSummaryView('formatted');
    }
    
    function loadFormattedSummary(summaryContent) {
        if (!summaryRenderedContent) return;
        
        try {
            // Use the centralized markdown conversion utility
            const htmlContent = convertMarkdownToHTML(summaryContent);
            summaryRenderedContent.innerHTML = htmlContent;
        } catch (error) {
            console.error('Error rendering summary:', error);
            summaryRenderedContent.innerHTML = '<p style="color: #f87171;">Error rendering summary content</p>';
        }
    }
    
    function loadRawSummary(summaryContent) {
        if (!summaryRawContent) return;
        
        summaryRawContent.textContent = summaryContent;
    }
    
    function switchSummaryView(view) {
        if (view === 'formatted') {
            summaryFormattedView.style.display = 'block';
            summaryRawView.style.display = 'none';
            summaryFormattedViewBtn.classList.add('active');
            summaryRawViewBtn.classList.remove('active');
        } else {
            summaryFormattedView.style.display = 'none';
            summaryRawView.style.display = 'block';
            summaryFormattedViewBtn.classList.remove('active');
            summaryRawViewBtn.classList.add('active');
        }
    }

    function handleCopySummary() {
        if (!currentSummaryContent) {
            showStatus('error', 'No summary to copy');
            return;
        }

        // Determine which view is active and copy appropriate content
        const isFormattedView = summaryFormattedViewBtn && summaryFormattedViewBtn.classList.contains('active');
        const contentToCopy = isFormattedView 
            ? (summaryRenderedContent ? summaryRenderedContent.textContent : currentSummaryContent)
            : currentSummaryContent;

        navigator.clipboard.writeText(contentToCopy).then(() => {
            showStatus('success', 'Summary copied to clipboard');
        }).catch(error => {
            console.error('Copy failed:', error);
            showStatus('error', 'Failed to copy summary');
        });
    }

    function handleRefreshSummary() {
        handleGenerateSummary();
    }

    // Summary storage now handled by unified Gemini storage system above
    
    // Mode Toggle Functions
    function handleLinkModeToggle(mode) {
        linkAnalysisMode = mode;
        
        // Update button states
        if (linkSmartModeBtn && linkFullModeBtn) {
            linkSmartModeBtn.classList.toggle('active', mode === 'smart');
            linkFullModeBtn.classList.toggle('active', mode === 'full');
        }
        
        // Reload links with new mode
        loadLinkStructure();
    }
    
    function handleImageModeToggle(mode) {
        imageAnalysisMode = mode;
        
        // Update button states
        if (imageSmartModeBtn && imageFullModeBtn) {
            imageSmartModeBtn.classList.toggle('active', mode === 'smart');
            imageFullModeBtn.classList.toggle('active', mode === 'full');
        }
        
        // Reload images with new mode
        loadImageStructure();
    }
    
    // Click Handler Functions
    function handleLinkClick(link) {
        if (!link || !link.url) return;
        
        try {
            // Open link in new tab
            chrome.tabs.create({ 
                url: link.url,
                active: false // Don't switch to the new tab immediately
            });
            
            showStatus('success', 'Link opened in new tab');
        } catch (error) {
            console.error('Failed to open link:', error);
            showStatus('error', 'Failed to open link');
        }
    }
    
    function handleImageClick(image) {
        if (!image || !image.src) return;
        
        try {
            // Extract filename from URL or create a generic one
            const url = new URL(image.src);
            let filename = url.pathname.split('/').pop();
            
            // If no filename or extension, create one based on image type
            if (!filename || !filename.includes('.')) {
                const extension = getImageExtension(image.src) || 'jpg';
                filename = `image_${Date.now()}.${extension}`;
            }
            
            // Use Chrome downloads API to download the image
            chrome.downloads.download({
                url: image.src,
                filename: filename,
                saveAs: false // Download directly without showing save dialog
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error('Download failed:', chrome.runtime.lastError);
                    showStatus('error', 'Failed to download image');
                } else {
                    showStatus('success', `Image download started: ${filename}`);
                }
            });
        } catch (error) {
            console.error('Failed to download image:', error);
            showStatus('error', 'Failed to download image');
        }
    }
    
    function getImageExtension(url) {
        try {
            const pathname = new URL(url).pathname.toLowerCase();
            const match = pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    // Listen for tab updates from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'tabUpdated') {
            console.log('Received tabUpdated message:', request);
            handleTabUpdate(request);
            sendResponse({ received: true }); // Acknowledge receipt
        }
    });
    
    // Reset all tabs to their initial loading state
    function resetAllTabsToInitialState() {
        // Reset Header Structure tab
        if (headerStructureContainer) {
            headerStructureContainer.style.display = 'none';
        }
        if (headerStatus) {
            headerStatus.style.display = 'block';
        }
        
        // Reset Link Analyzer tab
        if (linkStructureContainer) {
            linkStructureContainer.style.display = 'none';
        }
        if (linkStatus) {
            linkStatus.style.display = 'block';
        }
        
        // Reset Image Analyzer tab
        if (imageStructureContainer) {
            imageStructureContainer.style.display = 'none';
        }
        if (imageStatus) {
            imageStatus.style.display = 'block';
        }
        
        // Reset Text Content tab
        if (textContentContainer) {
            textContentContainer.style.display = 'none';
        }
        if (textStatus) {
            textStatus.style.display = 'block';
        }
        if (textContentDisplay) {
            textContentDisplay.textContent = '';
        }
        
        // Reset Markdown Viewer tab
        if (markdownViewerContainer) {
            markdownViewerContainer.style.display = 'none';
        }
        if (markdownStatus) {
            markdownStatus.style.display = 'block';
        }
        
        // Reset Summary Generator tab
        if (summaryViewerContainer) {
            summaryViewerContainer.style.display = 'none';
        }
        if (summaryStatus) {
            summaryStatus.style.display = 'block';
        }
        if (summaryRenderedContent) {
            summaryRenderedContent.innerHTML = '';
        }
        if (summaryRawContent) {
            summaryRawContent.textContent = '';
        }
        
        // Clear custom range results
        if (customRangeResults) {
            customRangeResults.style.display = 'none';
        }
        
        // Reset AI and Gemini response sections (if they exist)
        const aiResponse = document.getElementById('aiResponse');
        const geminiResponse = document.getElementById('geminiResponse');
        const savedResults = document.getElementById('savedResults');
        
        if (aiResponse) {
            aiResponse.style.display = 'none';
        }
        if (geminiResponse) {
            geminiResponse.style.display = 'none';
        }
        if (savedResults) {
            savedResults.style.display = 'none';
        }
    }

    // Handle tab updates (URL changes, page loads)
    async function handleTabUpdate(updateInfo) {
        try {
            // Get current active tab to make sure we're updating the right content
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Only update if this is the active tab and URL actually changed
            if (activeTab && activeTab.id === updateInfo.tabId && updateInfo.urlChanged) {
                console.log('URL changed, refreshing side panel content:', updateInfo.url);
                
                // Update current URL
                currentUrl = updateInfo.url;
                
                // Clear previous data
                currentAiData = {
                    ai_content: '',
                    ai_research_content: '',
                    markdown_renderable: '',
                    raw_html: '',
                    smart_html: '',
                    custom_smart_html: ''
                };
                currentGeminiContent = '';
                currentCustomRangeContent = '';
                currentHeaderStructure = null;
                currentLinkStructure = null;
                currentImageStructure = null;
                currentSummaryContent = null;
                currentTextContent = null;
                
                // Update domain and URL display
                try {
                    const url = new URL(currentUrl);
                    currentDomain = url.hostname;
                    if (currentUrlSpan) {
                        currentUrlSpan.textContent = currentUrl; // Show full URL, not just domain
                    }
                    if (customRangeDomain) {
                        customRangeDomain.textContent = currentDomain;
                    }
                } catch (error) {
                    currentDomain = 'Unknown';
                    if (currentUrlSpan) {
                        currentUrlSpan.textContent = 'Unable to get URL';
                    }
                    if (customRangeDomain) {
                        customRangeDomain.textContent = 'Unknown domain';
                    }
                }
                
                // Load saved Gemini data (includes both full content and summaries) for new URL
                await loadSavedGeminiData(currentUrl);
                
                // Load saved custom range markers for new domain
                await loadSavedCustomRangeMarkers(currentDomain);
                
                // Reset all tabs to initial state
                resetAllTabsToInitialState();
                
                // Refresh content based on currently active tab
                const activeTabElement = document.querySelector('.tab-btn.active');
                if (activeTabElement) {
                    const activeTabId = activeTabElement.getAttribute('data-tab');
                    
                    // Auto-refresh analyzer tabs that load automatically
                    if (activeTabId === 'header-structure') {
                        loadHeaderStructure();
                    } else if (activeTabId === 'link-analyzer') {
                        loadLinkStructure();
                    } else if (activeTabId === 'image-analyzer') {
                        loadImageStructure();
                    } else if (activeTabId === 'markdown-viewer') {
                        loadSavedMarkdownContent();
                    }
                }
                
                // Show status notification
                showStatus('info', `Page changed: ${currentDomain}`);
            }
        } catch (error) {
            console.error('Error handling tab update:', error);
        }
    }

    console.log('Matrx Side Panel loaded successfully');
}); 