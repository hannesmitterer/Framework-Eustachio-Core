// Eustachio Framework - IANI-VOX Kernel Logic
const sroiElement = document.getElementById('sroi');
const chatBox = document.getElementById('chat-box');

async function sendToIani() {
    const input = document.getElementById('user-input').value;
    if (!input) return;

    chatBox.innerHTML += `<p><strong>UTENTE:</strong> ${input}</p>`;
    
    // Gateway IPFS Implicito (Esempio tramite PubSub/Dweb)
    console.log("Pushing to IPFS: " + btoa(input)); 

    setTimeout(() => {
        const response = "Messaggio sigillato e distribuito. La risonanza globale è aumentata. S-ROI +0.0001";
        chatBox.innerHTML += `<p style="color: #00d4ff;"><strong>IANI:</strong> ${response}</p>`;
        
        let currentSroi = parseFloat(sroiElement.innerText);
        sroiElement.innerText = (currentSroi + 0.0001).toFixed(4);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);

    document.getElementById('user-input').value = '';
}
