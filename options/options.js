document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settingsForm');
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

    // Handle settings form submission
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConfiguration();
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
                
                // Update UI based on auth state
                updateAuthUI();
                
                showStatus('success', 'Ready');
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 2000);
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

    function updateAuthUI() {
        if (!supabaseAuth) return;

        const isAuthenticated = supabaseAuth.isAuthenticated();
        
        if (isAuthenticated) {
            const user = supabaseAuth.getUser();
            userEmailSpan.textContent = user?.email || 'Unknown';
            loggedOutState.style.display = 'none';
            loggedInState.style.display = 'block';
        } else {
            loggedOutState.style.display = 'block';
            loggedInState.style.display = 'none';
        }
    }

    function switchAuthTab(tab) {
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        signinForm.classList.toggle('active', tab === 'signin');
        signupForm.classList.toggle('active', tab === 'signup');
    }

    async function handleSignIn() {
        try {
            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;

            showStatus('loading', 'Signing in...');
            
            await supabaseAuth.signIn(email, password);
            updateAuthUI();
            
            showStatus('success', 'Successfully signed in!');
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
            signupForm.reset();
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
            updateAuthUI();
            
            showStatus('success', 'Successfully signed out!');
            
        } catch (error) {
            console.error('Sign out failed:', error);
            showStatus('error', 'Sign out failed: ' + error.message);
        }
    }

    async function handleGoogleSignIn() {
        try {
            showStatus('loading', 'Opening Google sign-in...');
            
            const result = await supabaseAuth.signInWithGoogle();
            updateAuthUI();
            
            showStatus('success', `Signed in as ${result.user?.email || 'user'}!`);
            
        } catch (error) {
            console.error('Google sign in failed:', error);
            if (error.message.includes('user cancelled') || error.message.includes('The user did not approve')) {
                showStatus('error', 'Sign-in was cancelled.');
            } else {
                showStatus('error', 'Google sign in failed: ' + error.message);
            }
        }
    }

    async function handleGitHubSignIn() {
        try {
            showStatus('loading', 'Opening GitHub sign-in...');
            
            const result = await supabaseAuth.signInWithGitHub();
            updateAuthUI();
            
            showStatus('success', `Signed in as ${result.user?.email || 'user'}!`);
            
        } catch (error) {
            console.error('GitHub sign in failed:', error);
            if (error.message.includes('user cancelled') || error.message.includes('The user did not approve')) {
                showStatus('error', 'Sign-in was cancelled.');
            } else {
                showStatus('error', 'GitHub sign in failed: ' + error.message);
            }
        }
    }

    async function loadConfiguration() {
        try {
            const config = await getStoredConfig();
            
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
            const tableName = document.getElementById('supabaseTableName').value.trim() || 'html_extractions';
            const socketServerUrl = document.getElementById('socketServerUrl').value.trim();
            const geminiApiKey = document.getElementById('geminiApiKey').value.trim();

            // Validate socket URL format if provided
            if (socketServerUrl) {
                try {
                    new URL(socketServerUrl);
                } catch {
                    showStatus('error', 'Please enter a valid Socket.IO server URL');
                    return;
                }
            }

            showStatus('loading', 'Saving settings...');

            await new Promise((resolve, reject) => {
                chrome.storage.sync.set({
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

            showStatus('success', 'Settings saved successfully!');

        } catch (error) {
            console.error('Save failed:', error);
            showStatus('error', `Failed to save settings: ${error.message}`);
        }
    }

    function getStoredConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['supabaseTableName', 'socketServerUrl', 'geminiApiKey'], (result) => {
                resolve({
                    tableName: result.supabaseTableName || 'html_extractions',
                    socketServerUrl: result.socketServerUrl || '',
                    geminiApiKey: result.geminiApiKey || ''
                });
            });
        });
    }

    function showStatus(type, message) {
        statusDiv.style.display = 'block';
        statusDiv.className = `status ${type}`;
        statusMessage.textContent = message;
        
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }
});
