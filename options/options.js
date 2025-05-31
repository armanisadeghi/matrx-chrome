document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settingsForm');
    const testBtn = document.getElementById('testBtn');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');

    // Load existing configuration
    loadConfiguration();

    // Handle form submission
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConfiguration();
    });

    // Handle test connection
    testBtn.addEventListener('click', async () => {
        await testConnection();
    });

    async function loadConfiguration() {
        try {
            const config = await getStoredConfig();
            
            if (config.url) {
                document.getElementById('supabaseUrl').value = config.url;
            }
            if (config.anonKey) {
                document.getElementById('supabaseAnonKey').value = config.anonKey;
            }
            if (config.tableName) {
                document.getElementById('supabaseTableName').value = config.tableName;
            }
            if (config.userId) {
                document.getElementById('userId').value = config.userId;
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    async function saveConfiguration() {
        try {
            const url = document.getElementById('supabaseUrl').value.trim();
            const anonKey = document.getElementById('supabaseAnonKey').value.trim();
            const tableName = document.getElementById('supabaseTableName').value.trim() || 'html_extractions';
            const userId = document.getElementById('userId').value.trim();

            if (!url || !anonKey || !userId) {
                showStatus('error', 'Please fill in all required fields');
                return;
            }

            // Validate URL format
            try {
                new URL(url);
            } catch {
                showStatus('error', 'Please enter a valid Supabase URL');
                return;
            }

            showStatus('loading', 'Saving configuration...');

            // Save to Chrome storage
            await new Promise((resolve, reject) => {
                chrome.storage.sync.set({
                    supabaseUrl: url,
                    supabaseAnonKey: anonKey,
                    supabaseTableName: tableName,
                    userId: userId
                }, () => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve();
                    }
                });
            });

            showStatus('success', 'Configuration saved successfully!');

        } catch (error) {
            console.error('Save failed:', error);
            showStatus('error', `Failed to save configuration: ${error.message}`);
        }
    }

    async function testConnection() {
        try {
            const url = document.getElementById('supabaseUrl').value.trim();
            const anonKey = document.getElementById('supabaseAnonKey').value.trim();
            const tableName = document.getElementById('supabaseTableName').value.trim() || 'html_extractions';

            if (!url || !anonKey) {
                showStatus('error', 'Please fill in URL and anon key before testing');
                return;
            }

            testBtn.disabled = true;
            testBtn.textContent = 'Testing...';
            showStatus('loading', 'Testing connection to Supabase...');

            // Test connection by making a simple query
            const response = await fetch(`${url}/rest/v1/${tableName}?limit=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showStatus('success', 'Connection successful! Your configuration is working.');
            } else {
                const errorText = await response.text();
                let errorMessage = 'Connection failed';
                
                if (response.status === 401) {
                    errorMessage = 'Authentication failed - check your anon key';
                } else if (response.status === 404) {
                    errorMessage = `Table "${tableName}" not found - please create it first`;
                } else {
                    errorMessage = `Connection failed (${response.status}): ${errorText}`;
                }
                
                showStatus('error', errorMessage);
            }

        } catch (error) {
            console.error('Test failed:', error);
            showStatus('error', `Test failed: ${error.message}`);
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
        }
    }

    function getStoredConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName', 'userId'], (result) => {
                resolve({
                    url: result.supabaseUrl || '',
                    anonKey: result.supabaseAnonKey || '',
                    tableName: result.supabaseTableName || 'html_extractions',
                    userId: result.userId || ''
                });
            });
        });
    }

    function showStatus(type, message) {
        statusDiv.style.display = 'block';
        statusDiv.className = `status ${type}`;
        statusMessage.textContent = message;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }
});

// Global function for copy button
function copyToClipboard(button) {
    const codeBlock = button.parentElement.querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Copy SQL';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Copy failed';
        
        setTimeout(() => {
            button.textContent = 'Copy SQL';
        }, 2000);
    });
} 