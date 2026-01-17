// IndexedDB Cache Module
// Provides local caching for offline functionality

// Constants
const DEFAULT_MESSAGE_LIMIT = 50;
const DEFAULT_CACHE_RETENTION_DAYS = 30;

class CacheService {
    constructor(dbName = 'eustachio-cache', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    // Initialize IndexedDB
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                const err = event && event.target && event.target.error;
                let message = 'Failed to initialize cache storage';

                if (err) {
                    if (err.name) {
                        message += `: ${err.name}`;
                    } else if (err.message) {
                        message += `: ${err.message}`;
                    }
                }

                reject(new Error(message));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('[Cache Service] IndexedDB initialized');
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store for IPFS data
                if (!db.objectStoreNames.contains('ipfs-data')) {
                    const objectStore = db.createObjectStore('ipfs-data', { keyPath: 'cid' });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('[Cache Service] Created ipfs-data object store');
                }

                // Create object store for messages
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('[Cache Service] Created messages object store');
                }
            };
        });
    }

    // Save data to cache
    async saveData(cid, data) {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ipfs-data'], 'readwrite');
            const objectStore = transaction.objectStore('ipfs-data');

            const record = {
                cid: cid,
                data: data,
                timestamp: Date.now()
            };

            const request = objectStore.put(record);

            request.onsuccess = () => {
                console.log('[Cache Service] Data saved to cache:', cid);
                resolve(true);
            };

            request.onerror = () => {
                reject(new Error('Failed to save data to cache'));
            };
        });
    }

    // Retrieve data from cache
    async getData(cid) {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ipfs-data'], 'readonly');
            const objectStore = transaction.objectStore('ipfs-data');
            const request = objectStore.get(cid);

            request.onsuccess = () => {
                if (request.result) {
                    console.log('[Cache Service] Data retrieved from cache:', cid);
                    resolve(request.result.data);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve data from cache'));
            };
        });
    }

    // Save message to cache
    async saveMessage(message, type = 'user') {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readwrite');
            const objectStore = transaction.objectStore('messages');

            const record = {
                message: message,
                type: type,
                timestamp: Date.now()
            };

            const request = objectStore.add(record);

            request.onsuccess = () => {
                console.log('[Cache Service] Message saved to cache');
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to save message to cache'));
            };
        });
    }

    // Get recent messages
    async getRecentMessages(limit = DEFAULT_MESSAGE_LIMIT) {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const objectStore = transaction.objectStore('messages');
            const index = objectStore.index('timestamp');
            
            const messages = [];
            const request = index.openCursor(null, 'prev');

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && messages.length < limit) {
                    messages.push(cursor.value);
                    cursor.continue();
                }
                // When there is no cursor result or the limit is reached,
                // we simply stop requesting more records. The transaction
                // will complete and resolve the promise in oncomplete.
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve messages from cache'));
            };

            transaction.oncomplete = () => {
                resolve(messages.reverse());
            };

            transaction.onerror = () => {
                reject(new Error('Failed to retrieve messages from cache'));
            };
        });
    }

    // Clear old cache entries (older than specified days)
    async clearOldEntries(days = DEFAULT_CACHE_RETENTION_DAYS) {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ipfs-data'], 'readwrite');
            const objectStore = transaction.objectStore('ipfs-data');
            const index = objectStore.index('timestamp');
            const range = IDBKeyRange.upperBound(cutoffTime);
            
            let deletedCount = 0;
            let settled = false;

            const safeResolve = (value) => {
                if (!settled) {
                    settled = true;
                    resolve(value);
                }
            };

            const safeReject = (error) => {
                if (!settled) {
                    settled = true;
                    reject(error);
                }
            };

            const request = index.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const deleteRequest = cursor.delete();

                    deleteRequest.onsuccess = () => {
                        deletedCount++;
                    };

                    deleteRequest.onerror = () => {
                        console.error('[Cache Service] Failed to delete old cache entry');
                    };

                    cursor.continue();
                }
            };

            request.onerror = () => {
                safeReject(new Error('Failed to clear old cache entries'));
            };

            transaction.oncomplete = () => {
                console.log(`[Cache Service] Cleared ${deletedCount} old entries`);
                safeResolve(deletedCount);
            };

            transaction.onerror = () => {
                safeReject(new Error('Failed to clear old cache entries (transaction error)'));
            };

            transaction.onabort = () => {
                safeReject(new Error('Failed to clear old cache entries (transaction aborted)'));
            };
        });
    }

    // Get cache statistics
    async getStats() {
        if (!this.db) {
            return Promise.reject(new Error('Database not initialized'));
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ipfs-data', 'messages'], 'readonly');
            
            const dataStore = transaction.objectStore('ipfs-data');
            const messageStore = transaction.objectStore('messages');
            
            const dataCount = dataStore.count();
            const messageCount = messageStore.count();
            
            let stats = { dataEntries: 0, messages: 0 };
            
            dataCount.onsuccess = () => {
                stats.dataEntries = dataCount.result;
                
                messageCount.onsuccess = () => {
                    stats.messages = messageCount.result;
                    resolve(stats);
                };
            };

            dataCount.onerror = () => {
                reject(new Error('Failed to get cache statistics'));
            };
        });
    }
}

// Export for both browser and Node.js
export default CacheService;

// Also make available globally in browser
if (typeof window !== 'undefined') {
    window.CacheService = CacheService;
}
