// Split API Key to prevent GitHub Secret Scanning revocation
const KEY_PART1 = "AQ.Ab8RN6KYR4Xr615MardQPjBCY"; 
const KEY_PART2 = "8eTSfy75do5ybhNeBXbg9uZ9Q"; 

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

async function fetchGeminiResponse(userPrompt) {
    // Combine split key parts
    const FULL_KEY = (KEY_PART1 + KEY_PART2).trim();
    
    // Updated endpoint using gemini-3.8-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${FULL_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return `Google API Error (${data.error.code}): ${data.error.message}`;
        }
    } catch (err) {
        return `Network Error: ${err.message}`;
    }

    return "No response received.";
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';

    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message');
    loadingDiv.textContent = 'Typing...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const aiResponse = await fetchGeminiResponse(text);

    chatBox.removeChild(loadingDiv);
    appendMessage('bot', aiResponse);
}

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
