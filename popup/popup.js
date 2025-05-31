document.addEventListener('DOMContentLoaded', async () => {
    const extractBtn = document.getElementById('extractBtn');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');
    const currentUrlSpan = document.getElementById('currentUrl');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const settingsLink = document.getElementById('settingsLink');

    // Get current tab URL
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentUrlSpan.textContent = tab.url;
    } catch (error) {
        currentUrlSpan.textContent = 'Unable to get URL';
    }

    // Handle settings link click
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        window.close();
    });

    // Handle extract button click
    extractBtn.addEventListener('click', async () => {
        try {
            // Disable button and show loading state
            extractBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
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
                showStatus('success', `Successfully extracted ${response.size} characters of HTML content!`);
            } else {
                throw new Error(response.error || 'Failed to extract HTML');
            }

        } catch (error) {
            console.error('Extraction failed:', error);
            showStatus('error', `Error: ${error.message}`);
        } finally {
            // Reset button state
            extractBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

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
}); 