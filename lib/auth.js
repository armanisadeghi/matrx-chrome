// Supabase Authentication Module for Chrome Extension
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
            // Load Supabase client if not already loaded
            if (typeof window !== 'undefined' && !window.supabase) {
                await this.loadSupabaseScript();
            }

            // Get Supabase configuration
            const config = await this.getSupabaseConfig();
            if (!config.url || !config.anonKey) {
                throw new Error('Supabase configuration not found. Please configure your Supabase settings.');
            }

            // Initialize Supabase client
            this.supabase = window.supabase.createClient(config.url, config.anonKey, {
                auth: {
                    storage: new ChromeStorageAdapter(),
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false
                }
            });

            // Load existing session
            const { data: { session } } = await this.supabase.auth.getSession();
            this.session = session;
            this.user = session?.user || null;

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                this.session = session;
                this.user = session?.user || null;
                
                // Save session to Chrome storage
                if (session) {
                    this.saveSessionToStorage(session);
                } else {
                    this.clearSessionFromStorage();
                }
            });

            this.initialized = true;
            console.log('Supabase Auth initialized', this.user ? `for user: ${this.user.email}` : '(no user)');

        } catch (error) {
            console.error('Failed to initialize Supabase Auth:', error);
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
            script.onerror = () => reject(new Error('Failed to load Supabase script'));
            document.head.appendChild(script);
        });
    }

    async signUp(email, password, userData = {}) {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        if (error) throw error;
        return data;
    }

    async signIn(email, password) {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;

        this.user = null;
        this.session = null;
        await this.clearSessionFromStorage();
    }

    async signInWithGoogle() {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: chrome.runtime.getURL('options/options.html'),
                skipBrowserRedirect: false
            }
        });

        if (error) throw error;
        return data;
    }

    async signInWithGitHub() {
        if (!this.supabase) throw new Error('Supabase not initialized');

        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: chrome.runtime.getURL('options/options.html'),
                skipBrowserRedirect: false
            }
        });

        if (error) throw error;
        return data;
    }

    async getAccessToken() {
        if (!this.session) return null;
        
        // Check if token is expired and refresh if needed
        const now = Date.now();
        const expiresAt = this.session.expires_at * 1000;
        
        if (now >= expiresAt - 60000) { // Refresh 1 minute before expiry
            const { data: { session }, error } = await this.supabase.auth.refreshSession();
            if (error) {
                console.error('Failed to refresh token:', error);
                return null;
            }
            this.session = session;
        }

        return this.session?.access_token;
    }

    async getUserId() {
        return this.user?.id || null;
    }

    async getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.user && !!this.session;
    }

    async saveSessionToStorage(session) {
        const sessionData = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user
        };

        return new Promise((resolve) => {
            chrome.storage.local.set({ 
                supabase_session: sessionData,
                user_id: session.user.id 
            }, resolve);
        });
    }

    async clearSessionFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(['supabase_session', 'user_id'], resolve);
        });
    }

    async getSupabaseConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey'], (result) => {
                resolve({
                    url: result.supabaseUrl,
                    anonKey: result.supabaseAnonKey
                });
            });
        });
    }

    // Get auth headers for API requests
    async getAuthHeaders() {
        const token = await this.getAccessToken();
        if (!token) return {};

        return {
            'Authorization': `Bearer ${token}`,
            'apikey': (await this.getSupabaseConfig()).anonKey
        };
    }
}

// Chrome Storage Adapter for Supabase Auth
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
}

// Create global instance
const supabaseAuth = new SupabaseAuth();

// Auto-initialize when script loads (for web pages)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        supabaseAuth.initialize().catch(console.error);
    });
} else {
    // For service workers or other contexts
    supabaseAuth.initialize().catch(console.error);
} 