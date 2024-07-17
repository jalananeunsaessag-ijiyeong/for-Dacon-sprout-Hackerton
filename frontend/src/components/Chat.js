import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = "/";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const socket = useState(() => socketIOClient(ENDPOINT))[0];
    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.on('receiveMessage', (message) => {
            console.log('Received message from server:', message);
            setMessages((prevMessages) => [...prevMessages, { text: message, from: 'bot' }]);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = () => {
        if (input.trim()) {
            console.log('Sending message to server:', input);
            setMessages((prevMessages) => [...prevMessages, { text: input, from: 'user' }]);
            socket.emit('sendMessage', input);
            setInput("");
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '50%', height: '70%', border: '1px solid #ccc', padding: '10px', overflowY: 'scroll' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.from === 'bot' ? 'left' : 'right' }}>
                        <p><strong>{msg.from === 'bot' ? 'Bot' : 'You'}:</strong> {msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ width: '50%', display: 'flex', marginTop: '10px' }}>
                <input 
                    type="text" 
                    value={input} 
                    onChange={handleInputChange} 
                    onKeyPress={handleKeyPress} 
                    style={{ flex: 1, padding: '10px', fontSize: '16px' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px 20px', fontSize: '16px' }}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
