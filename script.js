const API_KEY = "AQ.Ab8RN6Ig2bBEcNUNur3WtqlxrpsjLXabHp7NDTHf4Noob-ofcA";

const MODELS = [
    "gemini-3.8-flash",
    "gemini-2.5-flash"
];

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchGeminiResponse(userPrompt) {
    let lastErrorMessage = "";

    for (const model of MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: userPrompt }]
                        }]
                    })
                });

                const data = await response.json();

                if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                    return data.candidates[0].content.parts[0].text;
                } else if (data.error) {
                    lastErrorMessage = data.error.message;
                    if (data.error.message.includes("high demand") || data.error.code === 429) {
                        await delay(1500);
                    } else {
                        break;
                    }
                }
            } catch (err) {
                console.error(`Network error on ${model}:`, err);
            }
        }
    }

    return "Server is currently under high traffic. Please wait a few seconds and try sending your message again.";
}

async function handleSend() {
    // Read text directly from user input
    const text = userInput.value.trim();
    if (!text) return;

    // Display message on screen and clear input box
    appendMessage('user', text);
    userInput.value = '';

    // Show typing status
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message');
    loadingDiv.textContent = 'Typing...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch response
    const aiResponse = await fetchGeminiResponse(text);

    // Remove typing indicator and show AI response
    chatBox.removeChild(loadingDiv);
    appendMessage('bot', aiResponse);
}

// Event listeners for click and Enter key
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSend();
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
    }
});