function sendMessage(philosopher) {
    const userInput = document.getElementById('user-input').value;
    const chatWindow = document.getElementById('chat-window');

    if (userInput.trim() !== '') {
        chatWindow.innerHTML += `<div class="message user-message">You: ${userInput}</div>`;
    }

    const formattedPhilosopherName = philosopher.toLowerCase().replace(/ /g, '-');
    const className = `philosopher-message ${formattedPhilosopherName}`;
    const imageUrl = `../static/img/${formattedPhilosopherName}.jpg`;

    // Create the outer container
    const philosopherMessageContainer = document.createElement('div');
    philosopherMessageContainer.className = 'message-container';

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = philosopher;
    imageElement.className = 'philosopher-image';

    // Create the message bubble
    const messageBubble = document.createElement('div');
    messageBubble.className = className;
    messageBubble.textContent = `${philosopher}: `; // Add the philosopher's name and the colon

    // Append the image and the message bubble to the container
    philosopherMessageContainer.appendChild(imageElement);
    philosopherMessageContainer.appendChild(messageBubble);

    // Append the container to the chat window
    chatWindow.appendChild(philosopherMessageContainer);

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
                    return;
                }
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        philosopherMessageContainer.innerHTML += data;
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
