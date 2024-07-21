const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 법적 데이터를 JSON 파일에서 로드
const legalData = JSON.parse(fs.readFileSync('legalData.json', 'utf-8'));

app.use(express.static(path.join(__dirname, 'public')));

const askOpenAI = async (query) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a legal expert." },
                { role: "user", content: query }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "요청을 처리할 수 없습니다.";
    }
};

io.on('connection', (socket) => {
    console.log('사용자가 연결되었습니다.');

    socket.on('chat message', async (msg) => {
        console.log('메시지: ' + msg);

        const response = await askOpenAI(msg);
        
        socket.emit('bot message', response);
    });

    socket.on('disconnect', () => {
        console.log('사용자가 연결을 끊었습니다.');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 *:${PORT} 포트에서 실행 중입니다.`);
});
