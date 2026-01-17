// Eustachio Framework - IANI-VOX Kernel Logic with IPFS Integration
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');

// Initialize IPFS client
let ipfsClient = null;
let ipfsInitState = 'not_started'; // 'not_started', 'initializing', 'initialized', 'failed'

// Initialize IPFS connection
async function initIPFS() {
    // Prevent multiple simultaneous initialization attempts
    if (ipfsInitState === 'initializing' || ipfsInitState === 'initialized') {
        return ipfsInitState === 'initialized';
    }
    
    ipfsInitState = 'initializing';
    
    try {
        // Configure IPFS gateway connection.
        // If Infura credentials are provided via global variables, use Infura with authentication.
        // Otherwise, fall back to a public gateway that does not require authentication.
        const projectId = window.INFURA_PROJECT_ID;
        const projectSecret = window.INFURA_PROJECT_SECRET;

        const hasInfuraCreds = typeof projectId === 'string' && projectId !== '' &&
            typeof projectSecret === 'string' && projectSecret !== '';

        let ipfsConfig;

        if (hasInfuraCreds) {
            // Authenticated Infura IPFS API
            ipfsConfig = {
                host: 'ipfs.infura.io',
                port: 5001,
                protocol: 'https',
                headers: {
                    Authorization: 'Basic ' + btoa(projectId + ':' + projectSecret)
                }
            };
        } else {
            // Fallback to a non-authenticated public IPFS gateway (configurable via globals).
            ipfsConfig = {
                host: window.IPFS_API_HOST || 'ipfs.io',
                port: window.IPFS_API_PORT || 443,
                protocol: window.IPFS_API_PROTOCOL || 'https'
            };
        }

        ipfsClient = window.IpfsHttpClient.create(ipfsConfig);
        
        console.log('IPFS client initialized successfully');
        displaySystemMessage('Sistema IPFS connesso e pronto.');
        ipfsInitState = 'initialized';
        return true;
    } catch (error) {
        console.error('Failed to initialize IPFS:', error);
        displaySystemMessage('Errore: Impossibile connettersi a IPFS. Utilizzando modalità simulazione.', true);
        ipfsInitState = 'failed';
        return false;
    }
}

// Display system messages
function displaySystemMessage(message, isError = false) {
    const color = isError ? '#ff4444' : '#00d4ff';
    const p = document.createElement('p');
    p.style.color = color;
    
    const strong = document.createElement('strong');
    strong.textContent = 'SISTEMA:';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(' ' + message));
    
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToIani() {
    const input = document.getElementById('user-input').value;
    if (!input) {
        displaySystemMessage('Per favore inserisci un messaggio.', true);
        return;
    }

    // Safely display user message using DOM manipulation
    const userMessageElement = document.createElement('p');
    const userLabelElement = document.createElement('strong');
    userLabelElement.textContent = 'UTENTE:';
    userMessageElement.appendChild(userLabelElement);
    userMessageElement.append(' ' + input);
    chatBox.appendChild(userMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        // Initialize IPFS if not already done
        if (ipfsInitState === 'not_started' || ipfsInitState === 'failed') {
            await initIPFS();
        }
        
        // Try to add content to IPFS
        if (ipfsClient && ipfsInitState === 'initialized') {
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
                
                // Build the response DOM safely without using innerHTML
                const p = document.createElement('p');
                p.style.color = '#00d4ff';

                const strongPrefix = document.createElement('strong');
                strongPrefix.textContent = 'IANI:';
                p.appendChild(strongPrefix);
                p.appendChild(document.createTextNode(' '));

                p.appendChild(document.createTextNode('Messaggio sigillato e distribuito su IPFS! La risonanza globale è aumentata. S-ROI +0.0001'));
                p.appendChild(document.createElement('br'));

                const strongLabel = document.createElement('strong');
                strongLabel.textContent = 'CID:';
                p.appendChild(strongLabel);
                p.appendChild(document.createTextNode(' '));

                const codeElement = document.createElement('code');
                codeElement.style.color = '#00ff88';
                codeElement.style.fontFamily = 'monospace';
                codeElement.textContent = cidString;
                p.appendChild(codeElement);
                p.appendChild(document.createElement('br'));

                const small = document.createElement('small');
                small.appendChild(document.createTextNode('Accedi al messaggio: '));
                const link = document.createElement('a');
                link.href = `https://ipfs.io/ipfs/${cidString}`;
                link.target = '_blank';
                link.style.color = '#00d4ff';
                link.textContent = `https://ipfs.io/ipfs/${cidString}`;
                small.appendChild(link);
                p.appendChild(small);

                chatBox.appendChild(p);
                
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
        displaySystemMessage(`Errore imprevisto${error && error.message ? `: ${error.message}` : ''}. Controlla la console del browser per maggiori dettagli o riprova più tardi.`, true);
    }
    
    document.getElementById('user-input').value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Simulation mode when IPFS is unavailable
function simulateIPFSPush(input) {
    // Real CIDs use base58 encoding; this is a base58-compatible simulation
    const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    function generateBase58String(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * base58Alphabet.length);
            result += base58Alphabet.charAt(index);
        }
        return result;
    }
    const simulatedCID = 'Qm' + generateBase58String(44);

    // Build the response DOM safely without using innerHTML for user-influenced data
    const p = document.createElement('p');
    p.style.color = '#ffaa00';

    const strongPrefix = document.createElement('strong');
    strongPrefix.textContent = 'IANI:';
    p.appendChild(strongPrefix);
    p.appendChild(document.createTextNode(' '));

    p.appendChild(document.createTextNode('Messaggio simulato (IPFS non disponibile). S-ROI +0.0001'));
    p.appendChild(document.createElement('br'));

    const strongLabel = document.createElement('strong');
    strongLabel.textContent = 'CID Simulato:';
    p.appendChild(strongLabel);
    p.appendChild(document.createTextNode(' '));

    const codeElement = document.createElement('code');
    codeElement.style.color = '#ffaa00';
    codeElement.style.fontFamily = 'monospace';
    codeElement.textContent = simulatedCID;
    p.appendChild(codeElement);

    chatBox.appendChild(p);
    
    let currentSroi = parseFloat(sroiElement.innerText);
    sroiElement.innerText = (currentSroi + 0.0001).toFixed(4);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Initialize IPFS on page load
window.addEventListener('DOMContentLoaded', () => {
    initIPFS();
});
