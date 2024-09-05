// ContactsList.js
import React from 'react';

const ContactsList = ({ contacts, onContactSelect, onClose }) => {
    return (
        <div style={{ width: '300px', height: '400px', backgroundColor: 'white', border: '1px solid #ccc', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <header style={{ backgroundColor: '#f5f5f5', color: 'block', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>對話清單</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'block', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </header>
            <ul style={{ listStyleType: 'none', margin: 0, padding: 0, flex: 1 }}>
                {contacts.map((contact) => (
                    <li key={contact.id} onClick={() => onContactSelect(contact)} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                        {contact.Username}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContactsList;
