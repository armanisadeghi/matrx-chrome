// lib/auth.js
// Supabase Authentication for Chrome Extension using chrome.identity.launchWebAuthFlow

// Hardcoded — this extension only works with the AI Matrx Supabase project
const SUPABASE_URL = 'https://txzxabzwovsujtloxrus.supabase.co';
const SUPABASE_API_KEY = 'sb_publishable_4pvkRT-9-_dB0PWqF1sp1w_W9leRIoW';

class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.session = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Load Supabase client library if not already loaded
            if (typeof window !== 'undefined' && !window.supabase) {
                await this.loadSupabaseScript();
            }

            // Initialize Supabase client with Chrome storage adapter
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_API_KEY, {
                auth: {
                    storage: new ChromeStorageAdapter(),
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false, // We handle URL parsing ourselves
                }
            });

            // Load existing session from storage
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.session = session;
                this.user = session.user;
            }

            // Listen for auth state changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('[Auth] State changed:', event);
                this.session = session;
                this.user = session?.user || null;
            });

            this.initialized = true;
            console.log('[Auth] Initialized', this.user ? `for ${this.user.email}` : '(no user)');
        } catch (error) {
            console.error('[Auth] Initialization failed:', error);
            throw error;
        }
    }

    async loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined' && window.supabase) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/supabase.js');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Supabase'));
            document.head.appendChild(script);
        });
    }

    // -----------------------------------------------------------------------
    // OAuth Sign-In using chrome.identity.launchWebAuthFlow
    // This is the CORRECT way to do OAuth in a Chrome extension.
    // -----------------------------------------------------------------------

    async signInWithGoogle() {
        return this._signInWithOAuth('google');
    }

    async signInWithGitHub() {
        return this._signInWithOAuth('github');
    }

    async signInWithApple() {
        return this._signInWithOAuth('apple');
    }

    async _signInWithOAuth(provider) {
        if (!this.supabase) throw new Error('Not initialized');

        // Get the extension's redirect URL (Chrome handles this automatically)
        const redirectUrl = chrome.identity.getRedirectURL();
        // Returns: https://<extension-id>.chromiumapp.org/

        // Build the Supabase OAuth URL — skipBrowserRedirect prevents opening in a tab
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true, // CRITICAL: Don't open in a tab
            }
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No OAuth URL returned');

        // Launch the OAuth flow in a Chrome identity popup
        const resultUrl = await new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                {
                    url: data.url,
                    interactive: true, // Show the popup to the user
                },
                (callbackUrl) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (!callbackUrl) {
                        reject(new Error('No callback URL received'));
                    } else {
                        resolve(callbackUrl);
                    }
                }
            );
        });

        // Extract tokens from the callback URL fragment
        // The URL looks like: https://<id>.chromiumapp.org/#access_token=...&refresh_token=...
        const hashParams = new URLSearchParams(resultUrl.split('#')[1]);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
            throw new Error('No tokens in callback URL');
        }

        // Set the session in Supabase client
        const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        this.session = sessionData.session;
        this.user = sessionData.user;

        return { session: this.session, user: this.user };
    }

    // -----------------------------------------------------------------------
    // Email/Password Sign-In
    // -----------------------------------------------------------------------

    async signIn(email, password) {
        if (!this.supabase) throw new Error('Not initialized');
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.session = data.session;
        this.user = data.user;
        return data;
    }

    async signUp(email, password, userData = {}) {
        if (!this.supabase) throw new Error('Not initialized');
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: userData }
        });
        if (error) throw error;
        return data;
    }

    async signOut() {
        if (!this.supabase) throw new Error('Not initialized');
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        this.user = null;
        this.session = null;
    }

    // -----------------------------------------------------------------------
    // Session helpers
    // -----------------------------------------------------------------------

    async getAccessToken() {
        if (!this.session) return null;
        // Supabase auto-refreshes tokens via the client. getSession() refreshes if needed.
        const { data: { session } } = await this.supabase.auth.getSession();
        this.session = session;
        return session?.access_token || null;
    }

    getUserId() {
        return this.user?.id || null;
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.user && !!this.session;
    }

    async getAuthHeaders() {
        const token = await this.getAccessToken();
        if (!token) return {};
        return {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_API_KEY,
        };
    }

    getSupabaseClient() {
        return this.supabase;
    }

    // Static accessors for hardcoded config (used by content.js and other scripts)
    static getSupabaseUrl() {
        return SUPABASE_URL;
    }

    static getApiKey() {
        return SUPABASE_API_KEY;
    }
}

// Chrome Storage Adapter for Supabase Auth
// Supabase expects a localStorage-like API. This bridges to chrome.storage.local.
class ChromeStorageAdapter {
    async getItem(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    }

    async setItem(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, resolve);
        });
    }

    async removeItem(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], resolve);
        });
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SupabaseAuth = SupabaseAuth;
    // Single shared instance — all pages (options, popup, sidepanel) use this
    if (!window.supabaseAuth) {
        window.supabaseAuth = new SupabaseAuth();
    }
}
