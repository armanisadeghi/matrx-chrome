// Socket.IO client for Chrome Extension
class ExtensionSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.config = {
            serverUrl: 'http://localhost:8000', // Default to localhost
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
            if (config.serverUrl) {
                this.config.serverUrl = config.serverUrl;
            }
            
            console.log('Initializing Socket.IO client for:', this.config.serverUrl);
            await this.connect();
        } catch (error) {
            console.error('Failed to initialize socket client:', error);
        }
    }

    async connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        try {
            // Import socket.io client dynamically
            const { io } = await import('https://cdn.socket.io/4.7.4/socket.io.esm.min.js');
            
            this.socket = io(this.config.serverUrl, {
                reconnection: this.config.reconnection,
                reconnectionDelay: this.config.reconnectionDelay,
                reconnectionAttempts: this.config.reconnectionAttempts,
                timeout: this.config.timeout,
                transports: ['websocket', 'polling']
            });

            this.setupEventListeners();
            console.log('Socket.IO client created');
        } catch (error) {
            console.error('Failed to create socket connection:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            this.isConnected = true;
            this.emit('client_connected', { 
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                extensionId: chrome.runtime.id
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
                        serverUrl: result.socketServerUrl || 'http://localhost:5000'
                    });
                });
            } else {
                resolve({ serverUrl: 'http://localhost:5000' });
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