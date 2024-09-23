async function sendMessage(philosopher) {
    const userInput = document.getElementById('user-input').value;
    const chatWindow = document.getElementById('chat-window');

    if (userInput.trim() !== '') {
        chatWindow.innerHTML += `<div class="message user-message">You: ${userInput}</div>`;
    }

    const formattedPhilosopherName = philosopher.toLowerCase().replace(/ /g, '-');
    const className = `philosopher-message ${formattedPhilosopherName}`;
    const imageUrl = `../static/img/${formattedPhilosopherName}.jpg`;
    const philosopherMessageElement = document.createElement('div');
    philosopherMessageElement.className = className;
    philosopherMessageElement.innerHTML = `<img src="${imageUrl}" alt="${philosopher}" class="philosopher-image">${philosopher}: `;
    chatWindow.appendChild(philosopherMessageElement);

    try {
        const response = await fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                philosopher: philosopher,
                message: userInput
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        console.log('Stream complete');
                    } else {
                        philosopherMessageElement.innerHTML += data;
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Fetch failed:', error);
    }

    document.getElementById('user-input').value = '';
}

// Make sendMessage available globally
window.sendMessage = sendMessage;
