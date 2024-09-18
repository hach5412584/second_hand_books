import React, { useState, useEffect } from 'react';
import { Button, Grid, Box, Typography, IconButton, Checkbox, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import Cookies from 'js-cookie';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [totalPrice, setTotalPrice] = useState(0);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/cart`, { 
                    withCredentials: true 
                });
                setCartItems(response.data);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, []);

    const handleSelectItem = (itemID) => {
        setSelectedItems(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(itemID)) {
                newSelected.delete(itemID);
            } else {
                newSelected.add(itemID);
            }
            return newSelected;
        });
    };
    
    const handleQuantityChange = (itemID, change) => {
        // 讀取購物車的 Cookie
        const cartCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
    
        if (cartCookie) {
            // 解析購物車 Cookie 的值
            const cartItems = JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));
    
            // 找到對應的項目
            const updatedCartItems = cartItems.map(item => {
                if (item.bookId === itemID) {
                    // 確保數量至少為 1
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
    
            // 更新 Cookie
            document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCartItems))}; path=/;`;
            
            // 更新前端顯示的購物車狀態
            window.location.reload();
        }
    };

    const handleDeleteItem = (bookId) => {
        // 讀取購物車的 Cookie
        const cartCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('cart='));
    
        if (cartCookie) {
            // 解析 Cookie 的值
            const cartItems = JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));
    
            // 過濾掉要刪除的書籍
            const updatedCartItems = cartItems.filter(item => item.bookId !== bookId);
    
            // 更新 Cookie（若購物車已經沒有商品，則刪除 Cookie）
            if (updatedCartItems.length === 0) {
                document.cookie = 'cart=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'; // 刪除 Cookie
            } else {
                document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCartItems))}; path=/;`;
            }
            window.location.reload();
        }    
    };

    const handlePurchase = async () => {

        const selectedItemsInCart = cartItems.filter(item => selectedItems.has(item.ID));

        const transactions = selectedItemsInCart.map(item => ({
            buyerid: user.ID,
            sellerid: item.UserID,
            bookid: item.ID,
            amount: item.Price,
            quantity: item.quantity
        }));
    
        try {
            // 對於每個交易請求，發送請求到後端
            for (const transaction of transactions) {
                await axios.post('http://localhost:8080/api/transactions', transaction);
            }

            // 如果所有請求成功，顯示成功消息
            alert('交易已成功建立！');
            // 清空購物車
            Cookies.remove('cart');
            navigate('/');
        } catch (error) {
            console.error('交易失敗:', error);
            alert('交易失敗');
        }
    };

    useEffect(() => {
        const calculateTotalPrice = () => {
            let total = 0;
            cartItems.forEach(item => {
                if (selectedItems.has(item.ID)) {
                    total += item.Price * item.quantity;
                }
            });
            setTotalPrice(total);
        };

        calculateTotalPrice();
    }, [cartItems, selectedItems]);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                購物車
            </Typography>
            <Grid container spacing={2}>
                {cartItems.map(result => (
                    <Grid result xs={12} key={result.ID}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: 1 }}>
                            <Checkbox
                                checked={selectedItems.has(result.ID)}
                                onChange={() => handleSelectItem(result.ID)}
                            />
                            <img src={result.ImageURL} alt={result.Title} style={{ width: 50, height: 75, marginRight: 16 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1">
                                    {result.Title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => handleQuantityChange(result.ID, -1)}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <TextField
                                        value={result.quantity}
                                        sx={{ width: 60, textAlign: 'center', margin: '0 8px' }}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <IconButton onClick={() => handleQuantityChange(result.ID, 1)}>
                                        <AddIcon />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                        ${result.Price * result.quantity}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => handleDeleteItem(result.ID)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    總價: ${totalPrice.toFixed(2)}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => handlePurchase()}>
                    購買
                </Button>
            </Box>
        </Box>
    );
};

export default CartPage;
