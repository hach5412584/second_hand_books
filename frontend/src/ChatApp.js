// ChatApp.js
import React, { useState, useEffect } from 'react';
import ContactsList from './ContactsList';
import ChatWindow from './ChatWindow';
import axios from 'axios';

const ChatApp = ({ contacts, currentContact, isContactsVisible }) => {
    const [isVisible, setIsVisible] = useState(isContactsVisible);
    const [activeContact, setActiveContact] = useState(currentContact);
    const [contactslist, setContactsList] = useState(contacts);
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        setIsVisible(isContactsVisible);
        setActiveContact(currentContact);
        setContactsList(contacts);
    }, [isContactsVisible, currentContact, contacts]);

    const toggleContacts = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
            fetchContacts();
            setActiveContact(null); // Reset the chat window when toggling contacts list
        }
        setChatHistory([]);
    };

    const handleContactSelect = (contact) => {
        setActiveContact(contact);
        fetchChatHistory(contact);
        setIsVisible(true);
    };

    const handleCloseChat = () => {
        setActiveContact(null);
    };

    const handleCloseContacts = () => {
        setIsVisible(false); // 关闭联系人列表
        setActiveContact(null); // 同时关闭当前聊天窗口
    };

    const fetchContacts = async () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) return;

        try {
            const response = await axios.get('http://localhost:8080/api/chat/list', {
                params: { userId: user.Username }
            });
            console.log(response.data);
            setContactsList(response.data); // 更新聯絡人列表
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    };

    const fetchChatHistory = async (contact) => {
        const user = JSON.parse(sessionStorage.getItem('user')); // 當前用戶
        if (!user || !contact) return;

        try {
            // 從後端獲取聊天紀錄
            const response = await axios.get('http://localhost:8080/api/chat/get', {
                params: { senderId: user.Username, receiverId: contact.Username }
            });
            setChatHistory(response.data); // 更新聊天紀錄
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        }
    };

    const updateChatHistory = (newMessage) => {
        setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', alignItems: 'flex-end' }}>
            {isVisible && (
                <>
                    {activeContact && (
                        <ChatWindow contact={activeContact} onClose={handleCloseChat} chatHistory={chatHistory} onSendMessage={updateChatHistory}/>
                    )}
                    <ContactsList contacts={contactslist} onContactSelect={handleContactSelect} onClose={handleCloseContacts} />
                </>
            )}
            {!isVisible && (
                <button
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '20px',
                        marginBottom: '20px',
                    }}
                    onClick={toggleContacts}
                >
                    聊天
                </button>
            )}
        </div>
    );
};

export default ChatApp;
