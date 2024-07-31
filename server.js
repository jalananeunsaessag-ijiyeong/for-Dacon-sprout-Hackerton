const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/recognize', upload.single('audio'), async (req, res) => {
  const invokeUrl = process.env.CLOVA_SPEECH_INVOKE_URL;
  const secret = process.env.CLOVA_SPEECH_SECRET_KEY;

  if (!invokeUrl || !secret) {
    return res.status(500).json({ error: 'Clova Speech API 키가 설정되지 않았습니다.' });
  }

  const audioPath = req.file.path;
  console.log(`Audio file path: ${audioPath}`);

  const formData = new FormData();
  formData.append('media', fs.createReadStream(audioPath));
  formData.append('params', JSON.stringify({
    language: 'ko-KR',
    completion: 'sync',
  }));

  try {
    console.log('Sending request to Clova Speech API...');
    const response = await axios.post(`${invokeUrl}/recognizer/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-CLOVASPEECH-API-KEY': secret,
      }
    });
    console.log('Clova Speech API response:', response.data);
    res.json({ text: response.data.text });
  } catch (error) {
    console.error('Clova Speech API 오류:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).json({ error: '음성을 인식하는 도중 오류가 발생했습니다.' });
  } finally {
    fs.unlinkSync(audioPath); // 파일 삭제
  }
});

const askOpenAI = async (query) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a legal expert." },
        { role: "user", content: query }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "요청을 처리할 수 없습니다.";
  }
};

// 소켓 연결 및 이벤트 리스너 설정
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
