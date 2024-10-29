function createLoadingIndicator() {
    const indicator = document.createElement('span');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    return indicator;
}

function sendMessage(philosopher) {
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
    
    const loadingIndicator = createLoadingIndicator();
    philosopherMessageElement.appendChild(loadingIndicator);
    chatWindow.appendChild(philosopherMessageElement);

    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            philosopher: philosopher,
            message: userInput
        })
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let isFirstChunk = true;

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    return;
                }
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        if (isFirstChunk) {
                            const loadingIndicator = philosopherMessageElement.querySelector('.loading-indicator');
                            if (loadingIndicator) {
                                loadingIndicator.remove();
                            }
                            isFirstChunk = false;
                        }
                        const data = line.slice(6);
                        philosopherMessageElement.innerHTML += data;
                        chatWindow.scrollTop = chatWindow.scrollHeight;
                    }
                });
                readStream();
            });
        }

        readStream();
    }).catch(error => {
        console.error('Fetch failed:', error);
        const loadingIndicator = philosopherMessageElement.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        philosopherMessageElement.innerHTML += ' Error: Failed to get response';
    });

    document.getElementById('user-input').value = '';
}
