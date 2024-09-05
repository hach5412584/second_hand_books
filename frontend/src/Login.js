// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import axios from 'axios';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 假設你有一個驗證 API 來驗證使用者
        try {
            const response = await axios.post('http://localhost:8080/api/login', { email, password });
            const user = response.data;
            sessionStorage.setItem('user', JSON.stringify(user));
            onLogin();
            navigate('/');
        } catch (error) {
            alert("登陸失敗");
            console.error('Login failed', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom>
                    登入
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        登入
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Login;
