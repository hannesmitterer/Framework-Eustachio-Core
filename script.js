// Eustachio Framework - IANI-VOX Kernel Logic with IPFS Integration
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');

// Initialize IPFS client
let ipfsClient = null;

// Initialize IPFS connection
async function initIPFS() {
    try {
        // Connect to a public IPFS gateway (can be configured to local node)
        // Note: Using Infura's public gateway for simplicity. For production,
        // consider using a local IPFS node or configurable gateway endpoint.
        ipfsClient = window.IpfsHttpClient.create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https'
        });
        
        console.log('IPFS client initialized successfully');
        displaySystemMessage('Sistema IPFS connesso e pronto.');
        return true;
    } catch (error) {
        console.error('Failed to initialize IPFS:', error);
        displaySystemMessage('Errore: Impossibile connettersi a IPFS. Utilizzando modalità simulazione.', true);
        return false;
    }
}

// Display system messages
function displaySystemMessage(message, isError = false) {
    const color = isError ? '#ff4444' : '#00d4ff';
    chatBox.innerHTML += `<p style="color: ${color};"><strong>SISTEMA:</strong> ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToIani() {
    const input = document.getElementById('user-input').value;
    if (!input) {
        displaySystemMessage('Per favore inserisci un messaggio.', true);
        return;
    }

    chatBox.innerHTML += `<p><strong>UTENTE:</strong> ${input}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Initialize IPFS if not already done
        if (!ipfsClient) {
            await initIPFS();
        }
        
        // Try to add content to IPFS
        if (ipfsClient) {
            try {
                displaySystemMessage('Caricamento su IPFS in corso...');
                
                // Create a JSON object with message metadata
                const messageData = {
                    message: input,
                    timestamp: new Date().toISOString(),
                    framework: 'Eustachio-Kosymbiosis'
                };
                
                const content = JSON.stringify(messageData);
                const { cid } = await ipfsClient.add(content);
                const cidString = cid.toString();
                
                // Display success message with CID
                const response = `Messaggio sigillato e distribuito su IPFS! La risonanza globale è aumentata. S-ROI +0.0001<br><strong>CID:</strong> <code style="color: #00ff88; font-family: monospace;">${cidString}</code><br><small>Accedi al messaggio: <a href="https://ipfs.io/ipfs/${cidString}" target="_blank" style="color: #00d4ff;">https://ipfs.io/ipfs/${cidString}</a></small>`;
                chatBox.innerHTML += `<p style="color: #00d4ff;"><strong>IANI:</strong> ${response}</p>`;
                
                // Update S-ROI
                let currentSroi = parseFloat(sroiElement.innerText);
                sroiElement.innerText = (currentSroi + 0.0001).toFixed(4);
                
            } catch (ipfsError) {
                console.error('IPFS upload error:', ipfsError);
                // Fallback to simulation mode
                displaySystemMessage('Errore durante il caricamento su IPFS. Utilizzo modalità simulazione.', true);
                simulateIPFSPush(input);
            }
        } else {
            // Fallback mode
            simulateIPFSPush(input);
        }
        
    } catch (error) {
        console.error('Error in sendToIani:', error);
        displaySystemMessage('Errore imprevisto. Riprova.', true);
    }
    
    document.getElementById('user-input').value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Simulation mode when IPFS is unavailable
function simulateIPFSPush(input) {
    // Generate a more realistic simulated CID (QmHash format)
    // Real CIDs use base58 encoding, this is a simplified simulation
    const hash = btoa(input + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 44);
    const simulatedCID = 'Qm' + hash + 'a'.repeat(Math.max(0, 44 - hash.length));
    const response = `Messaggio simulato (IPFS non disponibile). S-ROI +0.0001<br><strong>CID Simulato:</strong> <code style="color: #ffaa00; font-family: monospace;">${simulatedCID}</code>`;
    chatBox.innerHTML += `<p style="color: #ffaa00;"><strong>IANI:</strong> ${response}</p>`;
    
    let currentSroi = parseFloat(sroiElement.innerText);
    sroiElement.innerText = (currentSroi + 0.0001).toFixed(4);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Initialize IPFS on page load
window.addEventListener('DOMContentLoaded', () => {
    initIPFS();
});
