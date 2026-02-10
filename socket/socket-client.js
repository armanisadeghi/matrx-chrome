// Socket.IO client for Chrome Extension
class ExtensionSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.config = {
            serverUrl: '', // Configured via extension settings
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000
        };
        this.eventHandlers = new Map();
    }

    async initialize() {
        try {
            // Get socket configuration from storage
            const config = await this.getSocketConfig();
            if (!config.serverUrl) {
                console.log('Socket.IO server URL not configured, skipping connection');
                return;
            }
            this.config.serverUrl = config.serverUrl;
            
            // Load and initialize authentication
            await this.initializeAuth();
            
            console.log('Initializing Socket.IO client for:', this.config.serverUrl);
            await this.connect();
        } catch (error) {
            console.error('Failed to initialize socket client:', error);
        }
    }

    async initializeAuth() {
        try {
            // Load auth script if not already loaded
            if (typeof window !== 'undefined' && !window.SupabaseAuth) {
                await this.loadAuthScript();
            }
            
            // Initialize auth if available
            if (typeof window !== 'undefined' && window.supabaseAuth) {
                await window.supabaseAuth.initialize();
            }
        } catch (error) {
            console.warn('Auth initialization failed:', error);
            // Continue without auth for now, but warn user
        }
    }

    async loadAuthScript() {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined' && window.SupabaseAuth) {
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

    async connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        try {
            // Load socket.io client script if not already loaded
            if (typeof window !== 'undefined' && !window.io) {
                await this.loadSocketIOScript();
            }
            
            // Use the globally available io function
            const io = window.io || (await this.getSocketIO());
            
            // Get authentication token if available
            let authToken = null;
            let userId = null;
            try {
                if (typeof window !== 'undefined' && window.supabaseAuth) {
                    authToken = await window.supabaseAuth.getAccessToken();
                    userId = await window.supabaseAuth.getUserId();
                }
            } catch (error) {
                console.warn('Failed to get auth token for socket connection:', error);
            }
            
            // Configure socket connection with auth
            const socketConfig = {
                reconnection: this.config.reconnection,
                reconnectionDelay: this.config.reconnectionDelay,
                reconnectionAttempts: this.config.reconnectionAttempts,
                timeout: this.config.timeout,
                transports: ['websocket', 'polling']
            };

            // Add auth token if available
            if (authToken) {
                socketConfig.auth = {
                    token: authToken
                };
                console.log('Connecting to socket with authentication token for user:', userId);
            } else {
                console.warn('Connecting to socket WITHOUT authentication - this may be rejected by server');
            }
            
            this.socket = io(this.config.serverUrl, socketConfig);

            this.setupEventListeners();
            console.log('Socket.IO client created');
        } catch (error) {
            console.error('Failed to create socket connection:', error);
            throw error;
        }
    }

    async loadSocketIOScript() {
        return new Promise((resolve, reject) => {
            if (typeof window !== 'undefined' && window.io) {
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

    async getSocketIO() {
        // Fallback for non-browser environments
        if (typeof window !== 'undefined' && window.io) {
            return window.io;
        }
        
        // If we're in a service worker or other context, try dynamic import as fallback
        try {
            const { io } = await import(chrome.runtime.getURL('socket/socket.io.min.js'));
            return io;
        } catch (error) {
            console.error('Failed to load Socket.IO in this context:', error);
            throw new Error('Socket.IO not available in this context');
        }
    }

    setupEventListeners() {
        this.socket.on('connect', async () => {
            console.log('Connected to Socket.IO server');
            this.isConnected = true;
            
            // Get user info for connection event
            let userId = null;
            let userEmail = null;
            try {
                if (typeof window !== 'undefined' && window.supabaseAuth) {
                    userId = await window.supabaseAuth.getUserId();
                    const user = await window.supabaseAuth.getUser();
                    userEmail = user?.email;
                }
            } catch (error) {
                console.warn('Failed to get user info for connection event:', error);
            }
            
            this.emit('client_connected', { 
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                extensionId: chrome.runtime.id,
                userId: userId,
                userEmail: userEmail,
                authenticated: !!userId
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from Socket.IO server:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected to server after', attemptNumber, 'attempts');
            this.isConnected = true;
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Reconnection failed:', error);
        });

        // Listen for custom events from server
        this.socket.on('html_extraction_processed', (data) => {
            console.log('Extraction processed by server:', data);
            this.handleExtractionProcessed(data);
        });

        this.socket.on('extraction_analysis_complete', (data) => {
            console.log('Analysis complete:', data);
            this.handleAnalysisComplete(data);
        });

        this.socket.on('server_message', (data) => {
            console.log('Server message:', data);
        });
    }

    emit(eventName, data) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, queuing event:', eventName);
            // Could implement event queuing here for offline events
            return false;
        }

        try {
            this.socket.emit(eventName, data);
            console.log('Emitted event:', eventName, data);
            return true;
        } catch (error) {
            console.error('Failed to emit event:', eventName, error);
            return false;
        }
    }

    // Main event for HTML extraction
    emitHtmlExtraction(extractionData) {
        const eventData = {
            ...extractionData,
            timestamp: new Date().toISOString(),
            extensionVersion: '1.0.0',
            source: 'chrome-extension'
        };

        return this.emit('html_extraction', eventData);
    }

    // Event for when extraction is saved to Supabase
    emitExtractionSaved(extractionData, supabaseResult) {
        const eventData = {
            extraction: extractionData,
            supabase: supabaseResult,
            timestamp: new Date().toISOString()
        };

        return this.emit('extraction_saved', eventData);
    }

    // Event for extraction errors
    emitExtractionError(error, url) {
        const eventData = {
            error: error.message,
            url: url,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        return this.emit('extraction_error', eventData);
    }

    // Handle server responses
    handleExtractionProcessed(data) {
        // Send message to content script or popup about processing completion
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'socketMessage',
                type: 'extraction_processed',
                data: data
            });
        }
    }

    handleAnalysisComplete(data) {
        // Handle analysis completion
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'socketMessage',
                type: 'analysis_complete',
                data: data
            });
        }
    }

    // Configuration management
    async getSocketConfig() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.get(['socketServerUrl'], (result) => {
                    resolve({
                        serverUrl: result.socketServerUrl || ''
                    });
                });
            } else {
                resolve({ serverUrl: '' });
            }
        });
    }

    async updateConfig(newConfig) {
        if (newConfig.serverUrl) {
            this.config.serverUrl = newConfig.serverUrl;
            
            // Save to storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.set({
                    socketServerUrl: newConfig.serverUrl
                });
            }
            
            // Reconnect with new URL
            if (this.socket) {
                this.socket.disconnect();
                await this.connect();
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            console.log('Socket disconnected');
        }
    }

    // Utility method to check connection status
    getStatus() {
        return {
            connected: this.isConnected,
            serverUrl: this.config.serverUrl,
            socketId: this.socket?.id || null
        };
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ExtensionSocketClient = ExtensionSocketClient;
}

// Create global instance
const socketClient = new ExtensionSocketClient();

// Auto-initialize when script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        socketClient.initialize();
    });
} else {
    // For service workers or other contexts
    socketClient.initialize();
} 