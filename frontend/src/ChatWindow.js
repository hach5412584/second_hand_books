import React, { useState} from 'react';
import axios from 'axios';

const ChatWindow = ({ contact, onClose, chatHistory, onSendMessage}) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = async () => {
        if (message.trim() === '') return; // 如果訊息為空則不執行

        const newMessage = {
            SenderID: JSON.parse(sessionStorage.getItem('user')).Username, // 當前用戶
            ReceiverID: contact.Username, // 聯絡人的用戶名
            Message: message,
            Timestamp: new Date().toISOString()
        };

        try {
            // 發送訊息給後端 API
            await axios.post('http://localhost:8080/api/chat/send', newMessage);

            onSendMessage(newMessage);
            setMessage(''); // 清空輸入框
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };
    return (
        <div style={{
            width: '300px',
            height: '400px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',  // Use relative to align with ContactsList
            zIndex: 9,
        }}>
            <header style={{ backgroundColor: '#f5f5f5', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{contact.Username}</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </header>
            <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                {chatHistory.map((msg, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: msg.SenderID === JSON.parse(sessionStorage.getItem('user')).Username ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '70%',
                            padding: '8px',
                            borderRadius: '10px',
                            margin: '5px 0',
                            backgroundColor: msg.SenderID === JSON.parse(sessionStorage.getItem('user')).Username ? '#007bff' : '#f1f0f0',
                            color: msg.SenderID === JSON.parse(sessionStorage.getItem('user')).Username ? 'white' : 'black',
                        }}>
                            <strong>{msg.SenderID === JSON.parse(sessionStorage.getItem('user')).Username ? 'You' : contact.Username}</strong>: {msg.Message}
                        </div>
                    </div>
                ))}
            </div>
            <footer style={{ padding: '10px', borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '8px',
                        marginRight: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSendMessage} style={{ width: '20%', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>發送</button>
            </footer>
        </div>
    );
};

export default ChatWindow;
