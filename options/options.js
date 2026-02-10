document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settingsForm');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('statusMessage');

    // Auth elements
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    const signOutBtn = document.getElementById('signOutBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const appleSignInBtn = document.getElementById('appleSignInBtn');
    const githubSignInBtn = document.getElementById('githubSignInBtn');
    const loggedOutState = document.getElementById('loggedOutState');
    const loggedInState = document.getElementById('loggedInState');
    const userEmailSpan = document.getElementById('userEmail');

    // Tab switching elements
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToSignin = document.getElementById('switchToSignin');
    const authTitle = document.getElementById('authTitle');
    const authSubtitleSignin = document.getElementById('authSubtitleSignin');
    const authSubtitleSignup = document.getElementById('authSubtitleSignup');

    // Initialize auth system (uses the global window.supabaseAuth from lib/auth.js)
    let supabaseAuth = null;
    initializeAuth();

    // Load existing configuration
    loadConfiguration();

    // Handle settings form submission
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConfiguration();
    });

    // Handle tab/form switching
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });

    switchToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        showSigninForm();
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

    // Handle OAuth providers
    googleSignInBtn.addEventListener('click', async () => {
        await handleOAuthSignIn('google', 'Google');
    });

    appleSignInBtn.addEventListener('click', async () => {
        await handleOAuthSignIn('apple', 'Apple');
    });

    githubSignInBtn.addEventListener('click', async () => {
        await handleOAuthSignIn('github', 'GitHub');
    });

    // -----------------------------------------------------------------------
    // Auth initialization
    // -----------------------------------------------------------------------

    async function initializeAuth() {
        try {
            showStatus('loading', 'Initializing authentication...');

            // Load Supabase library first
            if (!window.supabase) {
                await loadScript('lib/supabase.js');
            }
            // Load auth module (creates window.supabaseAuth)
            if (!window.SupabaseAuth) {
                await loadScript('lib/auth.js');
            }

            // Use the shared global instance
            if (window.supabaseAuth) {
                supabaseAuth = window.supabaseAuth;
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

    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(path);
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${path}`));
            document.head.appendChild(script);
        });
    }

    // -----------------------------------------------------------------------
    // UI State
    // -----------------------------------------------------------------------

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

    function showSignupForm() {
        signinForm.style.display = 'none';
        signupForm.style.display = 'flex';
        authTitle.textContent = 'Create your account';
        authSubtitleSignin.style.display = 'none';
        authSubtitleSignup.style.display = 'inline';
    }

    function showSigninForm() {
        signupForm.style.display = 'none';
        signinForm.style.display = 'flex';
        authTitle.textContent = 'Sign in to your account';
        authSubtitleSignup.style.display = 'none';
        authSubtitleSignin.style.display = 'inline';
    }

    // -----------------------------------------------------------------------
    // Auth handlers
    // -----------------------------------------------------------------------

    async function handleSignIn() {
        try {
            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;

            setButtonLoading('signinSubmitBtn', true);
            showStatus('loading', 'Signing in...');

            await supabaseAuth.signIn(email, password);
            updateAuthUI();

            showStatus('success', 'Successfully signed in!');
            signinForm.reset();
        } catch (error) {
            console.error('Sign in failed:', error);
            showStatus('error', 'Sign in failed: ' + error.message);
        } finally {
            setButtonLoading('signinSubmitBtn', false);
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

            setButtonLoading('signupSubmitBtn', true);
            showStatus('loading', 'Creating account...');

            await supabaseAuth.signUp(email, password);

            showStatus('success', 'Account created! Please check your email to verify your account.');
            signupForm.reset();
            showSigninForm();
        } catch (error) {
            console.error('Sign up failed:', error);
            showStatus('error', 'Sign up failed: ' + error.message);
        } finally {
            setButtonLoading('signupSubmitBtn', false);
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

    async function handleOAuthSignIn(provider, displayName) {
        try {
            showStatus('loading', `Opening ${displayName} sign-in...`);

            let result;
            if (provider === 'google') {
                result = await supabaseAuth.signInWithGoogle();
            } else if (provider === 'apple') {
                result = await supabaseAuth.signInWithApple();
            } else if (provider === 'github') {
                result = await supabaseAuth.signInWithGitHub();
            }

            updateAuthUI();
            showStatus('success', `Signed in as ${result.user?.email || 'user'}!`);
        } catch (error) {
            console.error(`${displayName} sign in failed:`, error);
            if (error.message.includes('user cancelled') || error.message.includes('The user did not approve')) {
                showStatus('error', 'Sign-in was cancelled.');
            } else {
                showStatus('error', `${displayName} sign in failed: ${error.message}`);
            }
        }
    }

    // -----------------------------------------------------------------------
    // Settings
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    function setButtonLoading(btnId, loading) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        const text = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.btn-loader');
        if (text) text.style.display = loading ? 'none' : 'inline';
        if (loader) loader.style.display = loading ? 'inline' : 'none';
        btn.disabled = loading;
    }

    function showStatus(type, message) {
        statusDiv.style.display = 'block';
        statusDiv.className = `status-toast m-toast m-toast-${type}`;
        statusMessage.textContent = message;

        if (type === 'success') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 4000);
        }
    }
});
