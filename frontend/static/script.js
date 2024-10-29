function createLoadingIndicator() {
    const indicator = document.createElement('span');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    return indicator;
}

function sendMessage(philosopher) {
    const generateTopicBtn = document.getElementById('generate-topic');
    if (generateTopicBtn) {
        generateTopicBtn.style.display = 'none';
    }
    
    const userInput = document.getElementById('user-input').value;
    const messagesContainer = document.getElementById('messages-container');
    const presetQuestions = document.getElementById('preset-questions');
    
    // Hide preset questions when first message is sent
    if (presetQuestions) {
        presetQuestions.style.display = 'none';
    }

    if (userInput.trim() !== '') {
        messagesContainer.innerHTML += `<div class="message user-message">You: ${userInput}</div>`;
    }

    const formattedPhilosopherName = philosopher.toLowerCase().replace(/ /g, '-');
    const className = `philosopher-message ${formattedPhilosopherName}`;
    const imageUrl = `../static/img/${formattedPhilosopherName}.jpg`;
    const philosopherMessageElement = document.createElement('div');
    philosopherMessageElement.className = className;
    philosopherMessageElement.innerHTML = `<img src="${imageUrl}" alt="${philosopher}" class="philosopher-image">${philosopher}: `;
    
    const loadingIndicator = createLoadingIndicator();
    philosopherMessageElement.appendChild(loadingIndicator);
    messagesContainer.appendChild(philosopherMessageElement);

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
        if (response.status === 429) {
            messagesContainer.removeChild(philosopherMessageElement);
            alert('You have reached the maximum number of messages for now. Please come back later to continue your philosophical journey!');
            throw new Error('Rate limit exceeded');
        }
        return response;
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
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                });
                readStream();
            });
        }

        readStream();
    }).catch(error => {
        if (!error.message.includes('Rate limit')) {
            console.error('Fetch failed:', error);
            const loadingIndicator = philosopherMessageElement.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
            philosopherMessageElement.innerHTML += ` Error: ${error.message || 'Failed to get response'}`;
        }
    });

    document.getElementById('user-input').value = '';
    updatePlaceholder();
}

function setQuestion(question) {
    const userInput = document.getElementById('user-input');
    userInput.value = question;
}

function updatePlaceholder() {
    const messagesContainer = document.getElementById('messages-container');
    const userInput = document.getElementById('user-input');
    
    if (messagesContainer.children.length === 0) {
        userInput.placeholder = "Ask a philosophical question...";
    } else {
        userInput.placeholder = "Continue the conversation or choose a philosopher...";
    }
}

document.addEventListener('DOMContentLoaded', updatePlaceholder);
