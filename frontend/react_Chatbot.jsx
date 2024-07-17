import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ', // ChatGPT API 키 입력
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // 사용할 ChatGPT 모델
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: input },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('ChatGPT API 요청에 실패했습니다.');
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.choices[0].message.content };

      setMessages([...messages, botMessage]);
    } catch (error) {
      console.error('상담 챗봇 API 요청 중 오류 발생:', error);
      // 오류 처리 로직 추가 (예: 사용자에게 오류 메시지 보여주기)
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
};

export default Chatbot;
