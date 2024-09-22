function sendMessage(philosopher) {
    const userInput = document.getElementById('user-input').value;
    const chatWindow = document.getElementById('chat-window');

    // Display user message
    if (userInput.trim() !== '') {
        chatWindow.innerHTML += `<div class="message user-message">You: ${userInput}</div>`;
    }

    // Send message to backend
    fetch(`/send_message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput, philosopher: philosopher })
    })
    .then(response => response.json())
    .then(data => {
        const formattedPhilosopherName = philosopher.toLowerCase().replace(/ /g, '-');
        const className = `philosopher-message ${formattedPhilosopherName}`;
        const imageUrl = `../static/img/${formattedPhilosopherName}.jpg`; // Path to the philosopher's image
        chatWindow.innerHTML += `<div class="${className}"><img src="${imageUrl}" alt="${philosopher}" class="philosopher-image">${philosopher}: ${data.response}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });

    // Clear input field
    document.getElementById('user-input').value = '';
}
