// Eustachio Framework - IANI-VOX Kernel Logic with Enhanced IPFS Integration
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');
const statusElement = document.getElementById('ipfs-status');

// Initialize IPFS Client
let ipfsClient = new IPFSClient();
let isInitialized = false;

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
    showStatusMessage('Initializing IPFS connection...', 'info');
    
    try {
        const initResult = await ipfsClient.initialize();
        isInitialized = true;
        
        if (initResult.success) {
            showStatusMessage(`✓ Connected to IPFS via ${initResult.gateway}`, 'success');
        } else {
            showStatusMessage(`⚠ ${initResult.message}`, 'warning');
        }
    } catch (error) {
        showStatusMessage('⚠ IPFS unavailable. Using local storage fallback.', 'warning');
        console.error('IPFS initialization error:', error);
    }
});

async function sendToIani() {
    const input = document.getElementById('user-input').value;
    if (!input || input.trim() === '') {
        showStatusMessage('⚠ Please enter a message', 'warning');
        return;
    }

    // Add user message to chat
    chatBox.innerHTML += `<p><strong>UTENTE:</strong> ${escapeHtml(input)}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Show loading state
    showStatusMessage('📡 Pushing to IPFS...', 'info');
    const sendButton = document.querySelector('button');
    sendButton.disabled = true;
    sendButton.textContent = 'PROCESSING...';
    
    try {
        // Push to IPFS with edge case handling
        const result = await ipfsClient.addData(input);
        
        if (result.success) {
            let response = '';
            let sroiIncrease = 0.0001;
            
            if (result.mode === 'ipfs') {
                response = `✓ Messaggio sigillato su IPFS! CID: ${result.cid.substring(0, 12)}...`;
                sroiIncrease = 0.0002; // Higher reward for actual IPFS storage
                showStatusMessage(`✓ Stored on IPFS: ${result.cid}`, 'success');
            } else if (result.mode === 'fallback') {
                response = `✓ Messaggio salvato localmente. ${result.message || 'Sincronizzazione IPFS pendente.'}`;
                showStatusMessage(result.message || 'Stored in fallback storage', 'warning');
            }
            
            // Add IANI response
            chatBox.innerHTML += `<p style="color: #00d4ff;"><strong>IANI:</strong> ${response}</p>`;
            chatBox.innerHTML += `<p style="color: #00d4ff;"><em>La risonanza globale è aumentata. S-ROI +${sroiIncrease.toFixed(4)}</em></p>`;
            
            // Update S-ROI
            let currentSroi = parseFloat(sroiElement.innerText);
            sroiElement.innerText = (currentSroi + sroiIncrease).toFixed(4);
            
        } else {
            throw new Error(result.error || 'Failed to store message');
        }
        
    } catch (error) {
        console.error('Error sending to IPFS:', error);
        showStatusMessage(`✗ Error: ${error.message}`, 'error');
        
        // Add error message to chat
        chatBox.innerHTML += `<p style="color: #ff4444;"><strong>IANI:</strong> ✗ Errore: ${error.message}. Riprova più tardi.</p>`;
    } finally {
        // Reset UI
        chatBox.scrollTop = chatBox.scrollHeight;
        document.getElementById('user-input').value = '';
        sendButton.disabled = false;
        sendButton.textContent = 'PUSH TO KERNEL (IPFS)';
    }
}

/**
 * Show status message in the status bar
 */
function showStatusMessage(message, type = 'info') {
    if (!statusElement) return;
    
    const colors = {
        info: '#00d4ff',
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff4444'
    };
    
    statusElement.style.color = colors[type] || colors.info;
    statusElement.textContent = message;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (statusElement.textContent === message) {
                const status = ipfsClient.getStatus();
                if (status.connected) {
                    statusElement.textContent = `✓ IPFS Connected: ${status.gateway}`;
                    statusElement.style.color = colors.success;
                } else if (status.fallbackMode) {
                    statusElement.textContent = '⚠ Fallback Mode Active';
                    statusElement.style.color = colors.warning;
                }
            }
        }, 5000);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle Enter key in textarea
 */
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('user-input');
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendToIani();
            }
        });
    }
});
