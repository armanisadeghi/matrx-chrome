document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settingsForm');
    const testBtn = document.getElementById('testBtn');
    const testSocketBtn = document.getElementById('testSocketBtn');
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

    // Handle test socket connection
    testSocketBtn.addEventListener('click', async () => {
        await testSocketConnection();
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
            if (config.socketServerUrl) {
                document.getElementById('socketServerUrl').value = config.socketServerUrl;
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
            const socketServerUrl = document.getElementById('socketServerUrl').value.trim() || 'http://localhost:8000';

            if (!url || !anonKey || !userId) {
                showStatus('error', 'Please fill in all required fields');
                return;
            }

            // Validate URL formats
            try {
                new URL(url);
                new URL(socketServerUrl);
            } catch {
                showStatus('error', 'Please enter valid URLs');
                return;
            }

            showStatus('loading', 'Saving configuration...');

            // Save to Chrome storage
            await new Promise((resolve, reject) => {
                chrome.storage.sync.set({
                    supabaseUrl: url,
                    supabaseAnonKey: anonKey,
                    supabaseTableName: tableName,
                    userId: userId,
                    socketServerUrl: socketServerUrl
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

            console.log('Testing connection with:', { url, tableName, anonKeyLength: anonKey.length });

            // Test connection by making a simple query
            const testUrl = `${url}/rest/v1/${tableName}?limit=1`;
            console.log('Making request to:', testUrl);
            
            const response = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                showStatus('success', 'Connection successful! Your configuration is working.');
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                
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

    async function testSocketConnection() {
        try {
            const socketServerUrl = document.getElementById('socketServerUrl').value.trim() || 'http://localhost:8000';

            // Validate URL format
            try {
                new URL(socketServerUrl);
            } catch {
                showStatus('error', 'Please enter a valid Socket.IO server URL');
                return;
            }

            testSocketBtn.disabled = true;
            testSocketBtn.textContent = 'Testing...';
            showStatus('loading', 'Testing Socket.IO connection...');

            // Try to connect to the Socket.IO server
            const { io } = await import('https://cdn.socket.io/4.7.4/socket.io.esm.min.js');
            
            const testSocket = io(socketServerUrl, {
                timeout: 5000,
                reconnection: false
            });

            const testPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    testSocket.disconnect();
                    reject(new Error('Connection timeout'));
                }, 5000);

                testSocket.on('connect', () => {
                    clearTimeout(timeout);
                    testSocket.disconnect();
                    resolve('Connected successfully');
                });

                testSocket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    testSocket.disconnect();
                    reject(error);
                });
            });

            await testPromise;
            showStatus('success', 'Socket.IO connection successful!');

        } catch (error) {
            console.error('Socket test failed:', error);
            showStatus('error', `Socket test failed: ${error.message}`);
        } finally {
            testSocketBtn.disabled = false;
            testSocketBtn.textContent = 'Test Socket';
        }
    }

    function getStoredConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName', 'userId', 'socketServerUrl'], (result) => {
                resolve({
                    url: result.supabaseUrl || '',
                    anonKey: result.supabaseAnonKey || '',
                    tableName: result.supabaseTableName || 'html_extractions',
                    userId: result.userId || '',
                    socketServerUrl: result.socketServerUrl || 'http://localhost:8000'
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