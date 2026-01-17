// IPFS Service Module
// Handles all IPFS connectivity, error handling, and retry mechanisms

class IPFSService {
    constructor(config = {}) {
        this.config = {
            host: config.host || 'localhost',
            port: config.port || 5001,
            protocol: config.protocol || 'http',
            timeout: config.timeout || 10000,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 2000,
            debugMode: config.debugMode || false,
            usePinata: config.usePinata || false,
            pinataApiKey: config.pinataApiKey || null,
            pinataSecretKey: config.pinataSecretKey || null
        };
        
        this.ipfs = null;
        this.connected = false;
        this.lastError = null;
    }

    // Initialize IPFS client
    async initialize() {
        if (this.config.debugMode) {
            console.log('[IPFS Service] Initializing with config:', this.config);
        }

        try {
            // Dynamic import for browser environment
            if (typeof window !== 'undefined') {
                // Browser environment - use CDN version
                if (!window.IpfsHttpClient) {
                    throw new Error('IPFS HTTP Client library not loaded. Please include it via CDN.');
                }
                this.ipfs = window.IpfsHttpClient.create({
                    host: this.config.host,
                    port: this.config.port,
                    protocol: this.config.protocol,
                    timeout: this.config.timeout
                });
            } else {
                // Node.js environment
                const { create } = await import('ipfs-http-client');
                this.ipfs = create({
                    host: this.config.host,
                    port: this.config.port,
                    protocol: this.config.protocol,
                    timeout: this.config.timeout
                });
            }

            // Test connection
            await this.testConnection();
            this.connected = true;
            
            if (this.config.debugMode) {
                console.log('[IPFS Service] Successfully initialized and connected');
            }
            
            return true;
        } catch (error) {
            this.lastError = error;
            this.connected = false;
            
            if (this.config.debugMode) {
                console.error('[IPFS Service] Initialization failed:', error);
            }
            
            return false;
        }
    }

    // Test IPFS connectivity
    async testConnection() {
        try {
            const nodeId = await this.ipfs.id();
            if (this.config.debugMode) {
                console.log('[IPFS Service] Connected to node:', nodeId.id);
            }
            return true;
        } catch (error) {
            throw new Error('IPFS node unreachable: ' + error.message);
        }
    }

    // Add data to IPFS with retry mechanism
    async addData(data, options = {}) {
        if (!this.connected) {
            throw new Error('IPFS service not connected. Call initialize() first.');
        }

        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                if (this.config.debugMode) {
                    console.log(`[IPFS Service] Adding data (attempt ${attempt}/${this.config.retryAttempts})`);
                }

                const result = await this.ipfs.add(data, options);
                const cid = result.cid ? result.cid.toString() : result.toString();
                
                if (this.config.debugMode) {
                    console.log('[IPFS Service] Data added successfully. CID:', cid);
                }

                // If Pinata is configured, also pin there
                if (this.config.usePinata && this.config.pinataApiKey) {
                    await this.pinToPinata(cid);
                }

                return {
                    success: true,
                    cid: cid,
                    size: result.size
                };
            } catch (error) {
                lastError = error;
                
                if (this.config.debugMode) {
                    console.warn(`[IPFS Service] Attempt ${attempt} failed:`, error.message);
                }

                if (attempt < this.config.retryAttempts) {
                    await this.delay(this.config.retryDelay);
                }
            }
        }

        this.lastError = lastError;
        throw new Error(`Failed to add data to IPFS after ${this.config.retryAttempts} attempts: ${lastError.message}`);
    }

    // Retrieve data from IPFS by CID
    async getData(cid) {
        if (!this.connected) {
            throw new Error('IPFS service not connected. Call initialize() first.');
        }

        try {
            if (this.config.debugMode) {
                console.log('[IPFS Service] Retrieving data for CID:', cid);
            }

            const chunks = [];
            for await (const chunk of this.ipfs.cat(cid)) {
                chunks.push(chunk);
            }

            const data = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                data.set(chunk, offset);
                offset += chunk.length;
            }

            const decoder = new TextDecoder();
            const text = decoder.decode(data);

            if (this.config.debugMode) {
                console.log('[IPFS Service] Data retrieved successfully');
            }

            return text;
        } catch (error) {
            this.lastError = error;
            
            if (this.config.debugMode) {
                console.error('[IPFS Service] Failed to retrieve data:', error);
            }
            
            throw new Error('Failed to retrieve data from IPFS: ' + error.message);
        }
    }

    // Pin content to Pinata for persistence
    async pinToPinata(cid) {
        if (!this.config.pinataApiKey || !this.config.pinataSecretKey) {
            if (this.config.debugMode) {
                console.warn('[IPFS Service] Pinata credentials not configured');
            }
            return false;
        }

        try {
            const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.config.pinataApiKey,
                    'pinata_secret_api_key': this.config.pinataSecretKey
                },
                body: JSON.stringify({
                    hashToPin: cid,
                    pinataMetadata: {
                        name: `eustachio-${Date.now()}`
                    }
                })
            });

            if (response.ok) {
                if (this.config.debugMode) {
                    console.log('[IPFS Service] Successfully pinned to Pinata:', cid);
                }
                return true;
            } else {
                throw new Error(`Pinata API error: ${response.status}`);
            }
        } catch (error) {
            if (this.config.debugMode) {
                console.warn('[IPFS Service] Pinata pinning failed:', error);
            }
            return false;
        }
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.connected,
            config: {
                host: this.config.host,
                port: this.config.port,
                protocol: this.config.protocol
            },
            lastError: this.lastError ? this.lastError.message : null
        };
    }

    // Helper: delay function for retry mechanism
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPFSService;
}
if (typeof window !== 'undefined') {
    window.IPFSService = IPFSService;
}
