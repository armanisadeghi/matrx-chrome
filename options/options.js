document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settingsForm');
    const testBtn = document.getElementById('testBtn');
    const testSocketBtn = document.getElementById('testSocketBtn');
    const testAuthBtn = document.getElementById('testAuthBtn');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');

    // Auth elements
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const signOutBtn = document.getElementById('signOutBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const githubSignInBtn = document.getElementById('githubSignInBtn');
    const loggedOutState = document.getElementById('loggedOutState');
    const loggedInState = document.getElementById('loggedInState');
    const userEmailSpan = document.getElementById('userEmail');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Initialize auth system
    let supabaseAuth = null;
    initializeAuth();

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

    // Handle test authenticated socket connection
    testAuthBtn.addEventListener('click', async () => {
        await testAuthenticatedSocket();
    });

    // Handle auth tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchAuthTab(tab);
        });
    });

    // Handle sign in
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignIn();
    });

    // Handle sign up
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignUp();
    });

    // Handle sign out
    signOutBtn.addEventListener('click', async () => {
        await handleSignOut();
    });

    // Handle Google OAuth
    googleSignInBtn.addEventListener('click', async () => {
        await handleGoogleSignIn();
    });

    // Handle GitHub OAuth
    githubSignInBtn.addEventListener('click', async () => {
        await handleGitHubSignIn();
    });

    async function initializeAuth() {
        try {
            showStatus('loading', 'Initializing authentication...');
            
            // Load auth script
            await loadAuthScript();
            
            // Initialize Supabase Auth
            if (window.SupabaseAuth) {
                supabaseAuth = new window.SupabaseAuth();
                await supabaseAuth.initialize();
                
                // Handle OAuth redirect if present
                await handleOAuthRedirect();
                
                // Update UI based on auth state
                await updateAuthUI();
                
                // Only show success if not processing OAuth
                if (!window.location.hash.includes('access_token')) {
                    showStatus('success', 'Authentication initialized');
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            showStatus('error', 'Failed to initialize authentication: ' + error.message);
        }
    }

    function loadAuthScript() {
        return new Promise((resolve, reject) => {
            if (window.SupabaseAuth) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/auth.js');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Auth script'));
            document.head.appendChild(script);
        });
    }

    async function updateAuthUI() {
        if (!supabaseAuth) return;

        const isAuthenticated = supabaseAuth.isAuthenticated();
        
        if (isAuthenticated) {
            const user = await supabaseAuth.getUser();
            userEmailSpan.textContent = user?.email || 'Unknown';
            loggedOutState.style.display = 'none';
            loggedInState.style.display = 'block';
        } else {
            loggedOutState.style.display = 'block';
            loggedInState.style.display = 'none';
        }
    }

    function switchAuthTab(tab) {
        // Update tab buttons
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        signinForm.classList.toggle('active', tab === 'signin');
        signupForm.classList.toggle('active', tab === 'signup');
    }

    async function handleSignIn() {
        try {
            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;

            showStatus('loading', 'Signing in...');
            
            await supabaseAuth.signIn(email, password);
            await updateAuthUI();
            
            showStatus('success', 'Successfully signed in!');
            
            // Clear form
            signinForm.reset();
            
        } catch (error) {
            console.error('Sign in failed:', error);
            showStatus('error', 'Sign in failed: ' + error.message);
        }
    }

    async function handleSignUp() {
        try {
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPassword) {
                showStatus('error', 'Passwords do not match');
                return;
            }

            showStatus('loading', 'Creating account...');
            
            await supabaseAuth.signUp(email, password);
            
            showStatus('success', 'Account created! Please check your email to verify your account.');
            
            // Clear form
            signupForm.reset();
            
            // Switch to sign in tab
            switchAuthTab('signin');
            
        } catch (error) {
            console.error('Sign up failed:', error);
            showStatus('error', 'Sign up failed: ' + error.message);
        }
    }

    async function handleSignOut() {
        try {
            showStatus('loading', 'Signing out...');
            
            await supabaseAuth.signOut();
            await updateAuthUI();
            
            showStatus('success', 'Successfully signed out!');
            
        } catch (error) {
            console.error('Sign out failed:', error);
            showStatus('error', 'Sign out failed: ' + error.message);
        }
    }

    async function handleGoogleSignIn() {
        try {
            showStatus('loading', 'Redirecting to Google...');
            
            await supabaseAuth.signInWithGoogle();
            // The user will be redirected to Google and back
            
        } catch (error) {
            console.error('Google sign in failed:', error);
            showStatus('error', 'Google sign in failed: ' + error.message);
        }
    }

    async function handleGitHubSignIn() {
        try {
            showStatus('loading', 'Redirecting to GitHub...');
            
            await supabaseAuth.signInWithGitHub();
            // The user will be redirected to GitHub and back
            
        } catch (error) {
            console.error('GitHub sign in failed:', error);
            showStatus('error', 'GitHub sign in failed: ' + error.message);
        }
    }

    // Handle OAuth redirect on page load
    async function handleOAuthRedirect() {
        try {
            if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
                showStatus('loading', 'Processing authentication...');
                
                // Wait a moment for the auth system to process the redirect
                setTimeout(async () => {
                    try {
                        await updateAuthUI();
                        
                        if (supabaseAuth && supabaseAuth.isAuthenticated()) {
                            const user = await supabaseAuth.getUser();
                            showStatus('success', `Successfully signed in as ${user.email}!`);
                        } else {
                            showStatus('error', 'Authentication failed. Please try again.');
                        }
                        
                        // Clear the hash from URL
                        window.history.replaceState(null, null, window.location.pathname);
                    } catch (error) {
                        console.error('OAuth redirect processing failed:', error);
                        showStatus('error', 'Authentication processing failed: ' + error.message);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('OAuth redirect handling failed:', error);
        }
    }

    async function testAuthenticatedSocket() {
        try {
            if (!supabaseAuth || !supabaseAuth.isAuthenticated()) {
                showStatus('error', 'Please sign in first to test authenticated socket connection');
                return;
            }

            const socketServerUrl = document.getElementById('socketServerUrl').value.trim() || 'http://localhost:8000';

            testAuthBtn.disabled = true;
            testAuthBtn.textContent = 'Testing...';
            showStatus('loading', 'Testing authenticated Socket.IO connection...');

            // Load Socket.IO script if not already loaded
            if (!window.io) {
                await loadSocketIOScript();
            }

            // Get auth token
            const authToken = await supabaseAuth.getAccessToken();

            const testSocket = window.io(socketServerUrl, {
                timeout: 5000,
                reconnection: false,
                auth: {
                    token: authToken
                }
            });

            const testPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    testSocket.disconnect();
                    reject(new Error('Connection timeout'));
                }, 5000);

                testSocket.on('connect', () => {
                    clearTimeout(timeout);
                    testSocket.disconnect();
                    resolve('Connected successfully with authentication');
                });

                testSocket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    testSocket.disconnect();
                    reject(error);
                });
            });

            await testPromise;
            showStatus('success', 'Authenticated Socket.IO connection successful!');

        } catch (error) {
            console.error('Authenticated socket test failed:', error);
            showStatus('error', `Authenticated socket test failed: ${error.message}`);
        } finally {
            testAuthBtn.disabled = false;
            testAuthBtn.textContent = 'Test Auth Socket';
        }
    }

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
            if (config.socketServerUrl) {
                document.getElementById('socketServerUrl').value = config.socketServerUrl;
            }
            if (config.geminiApiKey) {
                document.getElementById('geminiApiKey').value = config.geminiApiKey;
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
            const socketServerUrl = document.getElementById('socketServerUrl').value.trim() || 'http://localhost:8000';
            const geminiApiKey = document.getElementById('geminiApiKey').value.trim();

            if (!url || !anonKey) {
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
                    socketServerUrl: socketServerUrl,
                    geminiApiKey: geminiApiKey
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

            // Load Socket.IO script if not already loaded
            if (!window.io) {
                await loadSocketIOScript();
            }

            const testSocket = window.io(socketServerUrl, {
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

    function loadSocketIOScript() {
        return new Promise((resolve, reject) => {
            if (window.io) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('socket/socket.io.min.js');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Socket.IO script'));
            document.head.appendChild(script);
        });
    }

    function getStoredConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'supabaseTableName', 'socketServerUrl', 'geminiApiKey'], (result) => {
                resolve({
                    url: result.supabaseUrl || '',
                    anonKey: result.supabaseAnonKey || '',
                    tableName: result.supabaseTableName || 'html_extractions',
                    socketServerUrl: result.socketServerUrl || 'http://localhost:8000',
                    geminiApiKey: result.geminiApiKey || ''
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