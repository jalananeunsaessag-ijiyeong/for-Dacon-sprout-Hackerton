require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// JSON 파일에서 위로의 말 데이터를 읽어오는 함수
const getComfortingMessages = () => {
    const filePath = path.join(__dirname, 'comfortingMessages.json');
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', async (message) => {
        console.log('Received message from client:', message);
        const response = await processMessage(message);
        const comfortingMessages = getComfortingMessages();
        const comfortingMessage = getRandomComfortingMessage(comfortingMessages);
        const combinedResponse = `${response}\n\n위로의 말: ${comfortingMessage}`;
        console.log('Sending response to client:', combinedResponse);
        socket.emit('receiveMessage', combinedResponse);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const processMessage = async (message) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const prompt = `User: ${message}\nChatbot:`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 200,
                temperature: 0.7,
                stop: ["User:", "Chatbot:"],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
            }
        );

        const chatbotResponse = response.data.choices[0].message.content.trim();
        return chatbotResponse;
    } catch (error) {
        console.error('Error fetching GPT response:', error.response ? error.response.data : error.message);
        return '죄송합니다. 현재 서비스를 사용할 수 없습니다.';
    }
};

const getRandomComfortingMessage = (messages) => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
