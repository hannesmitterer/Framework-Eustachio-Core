// Eustachio Framework - IANI-VOX Kernel Logic
// This script handles the communication interface between users and the IANI kernel

// DOM element references
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');
const userInputElement = document.getElementById('user-input');

/**
 * Sends user input to the IANI kernel and handles the response
 * Includes error handling for IPFS functionality and improved state management
 */
async function sendToIani() {
    try {
        // Get and validate user input
        const input = userInputElement.value.trim();
        
        // Early return if input is empty
        if (!input) {
            displayUserMessage('Please enter a message before sending.');
            return;
        }

        // Display user message in chat
        displayUserMessage(input);
        
        // Attempt to push to IPFS (simulated with base64 encoding)
        try {
            const encodedMessage = btoa(input);
            console.log("Pushing to IPFS: " + encodedMessage);
            
            // Simulate IPFS processing delay
            await simulateIPFSResponse();
            
        } catch (ipfsError) {
            console.error("IPFS encoding error:", ipfsError);
            displaySystemMessage('Warning: IPFS encoding encountered an issue. Message processed locally.', 'warning');
        }

        // Clear input field after successful processing
        userInputElement.value = '';
        
    } catch (error) {
        console.error("Error in sendToIani:", error);
        displaySystemMessage('An error occurred while processing your message. Please try again.', 'error');
    }
}

/**
 * Simulates IPFS response and updates the S-ROI metric
 * Returns a Promise that resolves after a delay
 */
function simulateIPFSResponse() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const response = "Messaggio sigillato e distribuito. La risonanza globale è aumentata. S-ROI +0.0001";
            displayIaniMessage(response);
            
            // Update S-ROI metric with error handling
            updateSROI(0.0001);
            
            // Auto-scroll chat to bottom
            scrollChatToBottom();
            
            resolve();
        }, 800);
    });
}

/**
 * Display user message in the chat box
 * @param {string} message - The message to display
 */
function displayUserMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>UTENTE:</strong> ${escapeHtml(message)}`;
    chatBox.appendChild(messageElement);
}

/**
 * Display IANI response in the chat box
 * @param {string} message - The response message
 */
function displayIaniMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.style.color = '#00d4ff';
    messageElement.innerHTML = `<strong>IANI:</strong> ${escapeHtml(message)}`;
    chatBox.appendChild(messageElement);
}

/**
 * Display system message with optional type
 * @param {string} message - The system message
 * @param {string} type - Message type ('warning' or 'error')
 */
function displaySystemMessage(message, type = 'info') {
    const messageElement = document.createElement('p');
    const color = type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#00d4ff';
    messageElement.style.color = color;
    messageElement.innerHTML = `<strong>SYSTEM:</strong> ${escapeHtml(message)}`;
    chatBox.appendChild(messageElement);
}

/**
 * Updates the S-ROI metric value
 * @param {number} increment - Amount to increment the S-ROI by
 */
function updateSROI(increment) {
    try {
        const currentSroi = parseFloat(sroiElement.innerText);
        
        // Validate current value
        if (isNaN(currentSroi)) {
            console.error("Invalid S-ROI value");
            return;
        }
        
        // Calculate and update new value
        const newSroi = currentSroi + increment;
        sroiElement.innerText = newSroi.toFixed(4);
        
    } catch (error) {
        console.error("Error updating S-ROI:", error);
    }
}

/**
 * Scrolls chat box to the bottom to show latest messages
 */
function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

// Add Enter key support for textarea (Shift+Enter for new line)
userInputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendToIani();
    }
});
