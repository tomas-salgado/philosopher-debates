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

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    console.log('Stream complete');
                    return;
                }
                const chunk = decoder.decode(value);
                console.log('Received chunk:', chunk);  // Log each chunk
                const lines = chunk.split('\n');
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
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
    });

    document.getElementById('user-input').value = '';
}
