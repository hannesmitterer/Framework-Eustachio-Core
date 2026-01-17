// Eustachio Framework - IANI-VOX Kernel Logic with IPFS Integration

// Constants
const SROI_INCREMENT = 0.0001;
const NOTIFICATION_DISPLAY_DURATION = 4000;
const NOTIFICATION_ANIMATION_DURATION = 300;

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
        const initialized = await cacheService.initialize();
        if (initialized) {
            console.log('[App] Cache service initialized');
            
            // Load cached messages
            await loadCachedMessages();
        } else {
            throw new Error('Cache service initialization returned false');
        }
    } catch (error) {
        console.warn('[App] Cache service initialization failed:', error);
        cacheService = null;
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

    // Show processing indicator with unique ID
    const processingId = 'processing-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    chatBox.innerHTML += `<p id="${processingId}" style="color: #888;"><em>Processing...</em></p>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let cid = null;
        
        // Try to add to IPFS if service is available and online
        if (ipfsService && isOnline) {
            try {
                const result = await ipfsService.addData(input);
                if (result && result.cid) {
                    cid = result.cid;
                    
                    // Cache the CID and data
                    if (cacheService) {
                        await cacheService.saveData(cid, input);
                    }
                    
                    console.log('[App] Message added to IPFS with CID:', cid);
                }
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
            response = `Messaggio sigillato e distribuito su IPFS. CID: ${cid}. La risonanza globale è aumentata. S-ROI +${SROI_INCREMENT}`;
        } else {
            response = `Messaggio salvato localmente. La risonanza globale è aumentata. S-ROI +${SROI_INCREMENT}`;
        }

        chatBox.innerHTML += `<p style="color: #00d4ff;"><strong>IANI:</strong> ${response}</p>`;
        
        // Cache IANI response
        if (cacheService) {
            await cacheService.saveMessage(response, 'iani');
        }

        // Update S-ROI
        let currentSroi = parseFloat(sroiElement.innerText);
        sroiElement.innerText = (currentSroi + SROI_INCREMENT).toFixed(4);
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
    ensureNotificationStyles();

    // Normalize type to a known set of classes
    const validTypes = ['success', 'error', 'warning', 'info'];
    const normalizedType = validTypes.includes(type) ? type : 'info';

    const notification = document.createElement('div');
    notification.className = `notification notification-${normalizedType}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => notification.remove(), NOTIFICATION_ANIMATION_DURATION);
    }, NOTIFICATION_DISPLAY_DURATION);
}

// Ensure notification CSS classes and animations are available
function ensureNotificationStyles() {
    const styleId = 'notification-styles';
    if (document.getElementById(styleId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 300px;
            color: #fff;
            background: #ff9800;
            animation: slideIn 0.3s ease-out;
        }

        .notification-success {
            background: #00d4ff;
            color: #000;
        }

        .notification-error {
            background: #ff4444;
            color: #fff;
        }

        .notification-warning {
            background: #ff9800;
            color: #fff;
        }

        .notification-info {
            background: #2196f3;
            color: #fff;
        }

        .notification-hide {
            animation: slideOut 0.3s ease-in;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;

    document.head.appendChild(style);
}
