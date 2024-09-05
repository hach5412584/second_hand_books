import React, { useState, useEffect } from 'react';
import { Button, Grid, Box, Typography, IconButton, Checkbox, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [totalPrice, setTotalPrice] = useState(0);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userID = user ? user.ID : null;

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/cart?userID=${userID}`);
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

    const handleQuantityChange = async (itemID, change) => {
        try {
            const item = cartItems.find(item => item.ID === itemID);
            if (item) {
                const newQuantity = Math.max(1, item.Quantity + change); // Prevent quantity from going below 1
                await axios.put(`http://localhost:8080/api/cart/update/${itemID}?userID=${userID}`, { quantity: newQuantity }, { withCredentials: true });
                setCartItems(prevItems => prevItems.map(item =>
                    item.ID === itemID ? { ...item, Quantity: newQuantity } : item
                ));
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleDeleteItem = async (itemID) => {
        try {
            await axios.delete(`http://localhost:8080/api/cart/delete/${itemID}?userID=${userID}`, { withCredentials: true });
            setCartItems(prevItems => prevItems.filter(item => item.ID !== itemID));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleCheckout = () => {
        // Perform checkout with selected items
        console.log('Checked out items:', Array.from(selectedItems));
    };

    useEffect(() => {
        const calculateTotalPrice = () => {
            let total = 0;
            cartItems.forEach(item => {
                if (selectedItems.has(item.Book.ID)) {
                    total += item.Book.Price * item.Quantity;
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
                {cartItems.map(item => (
                    <Grid item xs={12} key={item.Book.ID}>
                        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', padding: 1 }}>
                            <Checkbox
                                checked={selectedItems.has(item.Book.ID)}
                                onChange={() => handleSelectItem(item.Book.ID)}
                            />
                            <img src={item.Book.ImageURL} alt={item.Book.Title} style={{ width: 50, height: 75, marginRight: 16 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body1">
                                    {item.Book.Title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => handleQuantityChange(item.ID, -1)}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <TextField
                                        value={item.Quantity}
                                        sx={{ width: 60, textAlign: 'center', margin: '0 8px' }}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <IconButton onClick={() => handleQuantityChange(item.ID, 1)}>
                                        <AddIcon />
                                    </IconButton>
                                    <Typography variant="body1" sx={{ marginLeft: 2 }}>
                                        ${item.Book.Price * item.Quantity}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => handleDeleteItem(item.ID)} color="error">
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
                <Button variant="contained" color="primary" onClick={handleCheckout}>
                    購買
                </Button>
            </Box>
        </Box>
    );
};

export default CartPage;
