function sendMessage() {
    const userInput = document.getElementById('userInput').value;

    // Display user message in chat container
    displayMessage('User', userInput);

    // Send user input to the backend (you will implement this part)
    sendToBackend(userInput);

    // Clear input field after sending message
    document.getElementById('userInput').value = '';
}
const userInput = document.getElementById('userInput');

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage(); // Call your existing send function
    }
});

function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chatContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatContainer.appendChild(messageElement);
    // Automatically scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendToBackend(userInput) {
    // Replace 'YOUR_BACKEND_ENDPOINT_URL' with your actual backend endpoint URL
    const backendEndpoint = 'http://localhost:5050';

    fetch(`${backendEndpoint}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userInput })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            // Handle the response from the backend (chatbot's response)
            // console.log(data)
            displayMessage('Chatbot', data.content);
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors, such as displaying an error message in the chat
            displayMessage('Chatbot', 'Sorry, there was an error processing your request.');
        });
}