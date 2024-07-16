document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    const chatBox = document.getElementById('chat-box');
    
    // Display user's message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerText = userInput;
    chatBox.appendChild(userMessage);
    
    // Clear input field
    document.getElementById('user-input').value = '';
    
    // Send user's message to the server
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput }),
    });
    
    const data = await response.json();
    
    // Display bot's response
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.innerText = data.message;
    chatBox.appendChild(botMessage);
    
    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });
  