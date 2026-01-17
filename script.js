// Eustachio Framework - IANI-VOX Kernel Logic with IPFS Integration
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');

// Initialize services
let ipfsService = null;
let cacheService = null;
let isOnline = navigator.onLine;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize cache service
    try {
        cacheService = new CacheService();
        await cacheService.initialize();
        console.log('[App] Cache service initialized');
        
        // Load cached messages
        await loadCachedMessages();
    } catch (error) {
        console.warn('[App] Cache service initialization failed:', error);
    }

    // Initialize IPFS service
    await initializeIPFS();

    // Monitor online/offline status
    window.addEventListener('online', () => {
        isOnline = true;
        showNotification('Connection restored', 'success');
        initializeIPFS();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        showNotification('Offline mode - using local cache', 'warning');
    });
});

// Initialize IPFS service with error handling
async function initializeIPFS() {
    const debugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
    
    try {
        ipfsService = new IPFSService({
            host: 'ipfs.io',
            port: 443,
            protocol: 'https',
            debugMode: debugMode,
            retryAttempts: 3,
            retryDelay: 2000
        });

        const initialized = await ipfsService.initialize();
        
        if (initialized) {
            showNotification('IPFS connected successfully', 'success');
            console.log('[App] IPFS service initialized');
        } else {
            throw new Error('IPFS initialization failed');
        }
    } catch (error) {
        console.warn('[App] IPFS initialization failed, using cache-only mode:', error);
        showNotification('IPFS unavailable - operating in cache-only mode', 'warning');
        ipfsService = null;
    }
}

// Load cached messages on startup
async function loadCachedMessages() {
    if (!cacheService) return;
    
    try {
        const messages = await cacheService.getRecentMessages(10);
        messages.forEach(msg => {
            const style = msg.type === 'iani' ? 'color: #00d4ff;' : '';
            const prefix = msg.type === 'iani' ? 'IANI' : 'UTENTE';
            chatBox.innerHTML += `<p style="${style}"><strong>${prefix}:</strong> ${msg.message}</p>`;
        });
        
        if (messages.length > 0) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    } catch (error) {
        console.warn('[App] Failed to load cached messages:', error);
    }
}

// Main function to send message to IANI with IPFS integration
async function sendToIani() {
    const input = document.getElementById('user-input').value;
    if (!input) return;

    // Display user message
    chatBox.innerHTML += `<p><strong>UTENTE:</strong> ${input}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Cache the message locally
    if (cacheService) {
        try {
            await cacheService.saveMessage(input, 'user');
        } catch (error) {
            console.warn('[App] Failed to cache user message:', error);
        }
    }

    // Clear input
    document.getElementById('user-input').value = '';

    // Show processing indicator
    const processingId = 'processing-' + Date.now();
    chatBox.innerHTML += `<p id="${processingId}" style="color: #888;"><em>Processing...</em></p>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let cid = null;
        
        // Try to add to IPFS if service is available and online
        if (ipfsService && isOnline) {
            try {
                const result = await ipfsService.addData(input);
                cid = result.cid;
                
                // Cache the CID and data
                if (cacheService) {
                    await cacheService.saveData(cid, input);
                }
                
                console.log('[App] Message added to IPFS with CID:', cid);
            } catch (error) {
                console.warn('[App] Failed to add to IPFS:', error);
                showNotification('IPFS upload failed - message saved locally', 'warning');
            }
        }

        // Remove processing indicator
        const processingElement = document.getElementById(processingId);
        if (processingElement) {
            processingElement.remove();
        }

        // Generate response
        let response;
        if (cid) {
            response = `Messaggio sigillato e distribuito su IPFS. CID: ${cid}. La risonanza globale è aumentata. S-ROI +0.0001`;
        } else {
            response = 'Messaggio salvato localmente. La risonanza globale è aumentata. S-ROI +0.0001';
        }

        chatBox.innerHTML += `<p style="color: #00d4ff;"><strong>IANI:</strong> ${response}</p>`;
        
        // Cache IANI response
        if (cacheService) {
            await cacheService.saveMessage(response, 'iani');
        }

        // Update S-ROI
        let currentSroi = parseFloat(sroiElement.innerText);
        sroiElement.innerText = (currentSroi + 0.0001).toFixed(4);
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        // Remove processing indicator
        const processingElement = document.getElementById(processingId);
        if (processingElement) {
            processingElement.remove();
        }

        console.error('[App] Error processing message:', error);
        chatBox.innerHTML += `<p style="color: #ff4444;"><strong>ERROR:</strong> ${error.message}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        showNotification('Error processing message', 'error');
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#00d4ff' : type === 'error' ? '#ff4444' : '#ff9800'};
        color: ${type === 'success' ? '#000' : '#fff'};
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
