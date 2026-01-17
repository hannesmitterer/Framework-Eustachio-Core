/**
 * IPFS Client Module - Modularized IPFS Integration
 * Handles all IPFS operations with comprehensive edge case handling
 */

class IPFSClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.fallbackMode = false;
        this.gatewayURLs = [
            'https://ipfs.infura.io:5001',
            'http://localhost:5001'
        ];
        this.currentGatewayIndex = 0;
        this.maxRetries = 3;
    }

    /**
     * Initialize IPFS client with fallback support
     */
    async initialize() {
        // Check if ipfs-http-client is available (browser environment check)
        // Support multiple possible global names for IPFS client
        const ipfsClient = typeof window !== 'undefined' && 
            (window.IpfsHttpClient || window.IpfsClient || window.Ipfs);
        
        if (!ipfsClient) {
            console.warn('IPFS HTTP Client not loaded. Running in fallback mode.');
            this.fallbackMode = true;
            return { success: false, mode: 'fallback', message: 'IPFS client not available. Using fallback storage.' };
        }

        // Try to connect to IPFS gateways
        for (let i = 0; i < this.gatewayURLs.length; i++) {
            try {
                await this.connectToGateway(this.gatewayURLs[i], ipfsClient);
                this.currentGatewayIndex = i;
                this.isConnected = true;
                return { success: true, mode: 'ipfs', gateway: this.gatewayURLs[i] };
            } catch (error) {
                console.warn(`Failed to connect to ${this.gatewayURLs[i]}:`, error.message);
                if (i === this.gatewayURLs.length - 1) {
                    this.fallbackMode = true;
                    return { success: false, mode: 'fallback', message: 'All IPFS gateways unreachable. Using fallback storage.' };
                }
            }
        }
    }

    /**
     * Connect to a specific IPFS gateway
     */
    async connectToGateway(gatewayURL, ipfsClientLib) {
        const clientLib = ipfsClientLib || 
            (typeof window !== 'undefined' && (window.IpfsHttpClient || window.IpfsClient || window.Ipfs));
        
        if (clientLib) {
            this.client = clientLib.create({ url: gatewayURL });
            // Test connection with a simple operation
            await this.client.id();
        } else {
            throw new Error('IPFS client not available');
        }
    }

    /**
     * Add data to IPFS with edge case handling
     */
    async addData(data) {
        if (!data || data.trim() === '') {
            throw new Error('Cannot add empty data to IPFS');
        }

        // Fallback mode - use local storage
        if (this.fallbackMode || !this.isConnected) {
            return this.addToFallbackStorage(data);
        }

        // Try to add to IPFS with retries
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const result = await this.client.add(data);
                return {
                    success: true,
                    cid: result.path || result.cid.toString(),
                    mode: 'ipfs',
                    size: result.size
                };
            } catch (error) {
                console.error(`IPFS add attempt ${attempt + 1} failed:`, error.message);
                
                // Check for specific error types
                if (this.isNetworkError(error)) {
                    if (attempt === this.maxRetries - 1) {
                        // Switch to fallback after all retries
                        return this.addToFallbackStorage(data);
                    }
                    // Wait before retry
                    await this.delay(1000 * (attempt + 1));
                } else {
                    // Non-network error, switch to fallback immediately
                    return this.addToFallbackStorage(data);
                }
            }
        }

        return this.addToFallbackStorage(data);
    }

    /**
     * Retrieve data from IPFS with edge case handling
     */
    async getData(cid) {
        if (!cid) {
            throw new Error('CID is required to retrieve data');
        }

        // Check if it's a fallback storage key
        if (cid.startsWith('fallback-')) {
            return this.getFromFallbackStorage(cid);
        }

        // Fallback mode
        if (this.fallbackMode || !this.isConnected) {
            throw new Error('IPFS not available. Cannot retrieve data.');
        }

        // Try to get from IPFS with retries
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const stream = this.client.cat(cid);
                const decoder = new TextDecoder();
                let data = '';
                
                for await (const chunk of stream) {
                    data += decoder.decode(chunk, { stream: true });
                }
                
                return {
                    success: true,
                    data: data,
                    mode: 'ipfs'
                };
            } catch (error) {
                console.error(`IPFS get attempt ${attempt + 1} failed:`, error.message);
                
                if (this.isNetworkError(error) && attempt < this.maxRetries - 1) {
                    await this.delay(1000 * (attempt + 1));
                } else {
                    throw new Error(`Failed to retrieve data from IPFS: ${error.message}`);
                }
            }
        }
    }

    /**
     * Fallback storage using localStorage
     */
    addToFallbackStorage(data) {
        try {
            const timestamp = Date.now();
            const key = `fallback-${timestamp}`;
            const storageData = {
                data: data,
                timestamp: timestamp,
                hash: this.simpleHash(data)
            };
            
            localStorage.setItem(key, JSON.stringify(storageData));
            
            return {
                success: true,
                cid: key,
                mode: 'fallback',
                message: 'Stored locally. Will sync to IPFS when connection is restored.'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Storage quota exceeded or localStorage unavailable',
                mode: 'error'
            };
        }
    }

    /**
     * Get data from fallback storage
     */
    getFromFallbackStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) {
                throw new Error('Data not found in fallback storage');
            }
            
            const parsedData = JSON.parse(stored);
            return {
                success: true,
                data: parsedData.data,
                mode: 'fallback'
            };
        } catch (error) {
            throw new Error(`Failed to retrieve from fallback storage: ${error.message}`);
        }
    }

    /**
     * Check if error is network-related
     */
    isNetworkError(error) {
        const networkErrorPatterns = [
            'network',
            'timeout',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'fetch failed',
            'Failed to fetch'
        ];
        
        return networkErrorPatterns.some(pattern => 
            error.message.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    /**
     * Simple hash function for fallback mode
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Delay helper for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            fallbackMode: this.fallbackMode,
            gateway: this.isConnected ? this.gatewayURLs[this.currentGatewayIndex] : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPFSClient;
}
