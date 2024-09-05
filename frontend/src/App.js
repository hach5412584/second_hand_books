import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import AddBook from './AddBook';
import Profile from './Profile';
import BookDetails from './BookDetails';
import CartPage from './CartPage';
import ChatApp from './ChatApp';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [currentContact, setCurrentContact] = useState(null);
    const [isContactsVisible, setIsContactsVisible] = useState(false);

    
    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setContacts([]);
        setCurrentContact(null);
        setIsContactsVisible(false);
    };

    const handleContactSeller = (sellerUsername) => {

        if (user.username === sellerUsername) {
            return;
        }

        if (!contacts.some(contact => contact.name === sellerUsername)) {
            setContacts([...contacts, { Username: sellerUsername }]);
        }
        // 顯示聊天視窗
        setCurrentContact({ Username: sellerUsername });
        setIsContactsVisible(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home isAuthenticated={isAuthenticated} handleLogout={handleLogout} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile handleLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/addbook" element={<AddBook />} />
                <Route path="/bookDetails/:id" element={<BookDetails isAuthenticated={isAuthenticated} handleLogout={handleLogout} handleContactSeller={handleContactSeller} />} />
                <Route path="/cartPage" element={<CartPage />} />
            </Routes>
            {isAuthenticated && (
                <ChatApp contacts={contacts} currentContact={currentContact} isContactsVisible={isContactsVisible} />  // 傳遞 contacts
            )}
        </Router>
    );
};

export default App;
