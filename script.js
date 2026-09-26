// Yahan apna NAYA Google AI Studio API Key paste karein
const API_KEY = "AQ.Ab8RN6Ivutt1DUpqu-T2G2gja6n68rTmlJcT_XZ5XDPFUE4ZRA";

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
    // Official Stable v1 Endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
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
            console.error("API Error:", data.error);
            return `API Error: ${data.error.message || "Request failed"}`;
        }
    } catch (err) {
        console.error("Network Error:", err);
        return "Network connection issue. Please try again.";
    }

    return "No response received from AI.";
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
