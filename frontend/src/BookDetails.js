import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Container, Typography, Box, AppBar, Toolbar, Button, TextField, Grid, Snackbar, Alert, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Cookies from 'js-cookie';

const PREFIX = 'BookDetails';

const classes = {
    appBar: `${PREFIX}-appBar`,
    appBarContent: `${PREFIX}-appBarContent`,
    searchBar: `${PREFIX}-searchBar`,
    mainContainer: `${PREFIX}-mainContainer`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    [`&.${classes.appBar}`]: {
        backgroundColor: '#f5f5f5', // 淡灰色背景
        color: 'black', // 黑色文字
        padding: '0 16px', // 左右內縮
    },
    [`& .${classes.appBarContent}`]: {
        margin: '0 16.5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    [`& .${classes.searchBar}`]: {
        flexGrow: 1,
        backgroundColor: 'white',
        borderRadius: 1,
        marginRight: theme.spacing(2),
    },
}));

const MainContainer = styled(Container)(({ theme }) => ({
    margin: '0 16.5%', // 居中
}));

function BookDetails({ isAuthenticated, handleLogout, handleContactSeller}) {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [quantity, setQuantity] = useState(1); // 初始数量设置为 1
    const userID = user ? user.ID : null;

    const isUserLoggedIn = () => {
        return !!sessionStorage.getItem('user');
    };

    const handleQuantityChange = (change) => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity + change)); // 确保数量至少为 1
    };


    const addToCart = (bookId, quantity) => {
        if (!isUserLoggedIn()) {
            setSnackbarMessage('請先登錄');
            setSnackbarOpen(true);
            return;
        }
        
        if (userID === book.UserID) {
            setSnackbarMessage('你不能將自己的書加入購物車');
            setSnackbarOpen(true);
            return;
        }

        const cart = Cookies.get('cart') ? JSON.parse(Cookies.get('cart')) : [];
        const existingItem = cart.find(item => item.bookId === book.ID);

        if (existingItem) {
            setSnackbarMessage('此書籍已在購物車中');
            setSnackbarOpen(true);
            return;
        } 
        else {
            setSnackbarMessage('成功加入購物車中');
            setSnackbarOpen(true);
            cart.push({ bookId, quantity });
        }

        Cookies.set('cart', JSON.stringify(cart), { expires: 7, path: '/'}); // 將購物車存入 Cookie，保存 7 天
    };

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/booksDetails?bookID=${id}`);
                setBook(response.data);
            } catch (error) {
                console.error('Error fetching book:', error);
            }
        };

        fetchBook();
    }, [id]);

    if (!book) {
        return <Typography>Loading...</Typography>;
    }


    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const contactSeller = () => {
        handleContactSeller(book.User.Username);
    };

    return (
        <div>
            <StyledAppBar position="static" className={classes.appBar} elevation={0}>
                <Toolbar className={classes.appBarContent}>
                    <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'black' }} sx={{ flexGrow: 1 }}>
                        二手書交易平台
                    </Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Search..."
                        className={classes.searchBar}
                        size="small"
                    />
                    <Button color="inherit" href="/cartPage">
                        <ShoppingCartIcon />
                    </Button>
                    {isAuthenticated ? (
                        <>
                            <Button color="inherit" onClick={handleLogout}>登出</Button>
                            <Button color="inherit" href="/profile">{user ? `${user.Username} 的個人資料` : '登入'}</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" href="/login">登入</Button>
                            <Button color="inherit" href="/register">註冊</Button>
                        </>
                    )}
                </Toolbar>
            </StyledAppBar>
            <Box sx={{ mt: 4 }}>
                <MainContainer className={classes.mainContainer}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: '50%', margin: '0 auto' }}>
                                <img src={book.ImageURL} alt={book.Title} style={{ width: '100%', height: 'auto' }} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" gutterBottom>
                                {book.Title}
                            </Typography>
                            <Typography variant="body1">
                                作者：{book.Author} | {book.Category} | {book.Subcategory}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                販賣者：{book.User.Username}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1, color: 'red' }}>
                                價格：{book.Price}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                內容：{book.Summary}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <IconButton onClick={() => handleQuantityChange(-1)}><RemoveIcon /></IconButton>
                                <TextField
                                    value={quantity}
                                    sx={{ width: 60, height: 40, textAlign: 'center', margin: '0 8px' }}
                                    InputProps={{ readOnly: true }}
                                />
                                <IconButton onClick={() => handleQuantityChange(1)}><AddIcon /></IconButton>
                                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => addToCart(book.ID, quantity)}>
                                    加入購物車
                                </Button>
                                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                                    <Alert onClose={handleCloseSnackbar} severity="info">
                                        {snackbarMessage}
                                    </Alert>
                                </Snackbar>
                                <Button variant="contained" color="secondary" sx={{ mr: 1 }}>
                                    直接購買
                                </Button>
                                <Button variant="outlined" onClick={contactSeller}>
                                    聯絡買家
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </MainContainer>
            </Box>
        </div>
    );
};

export default BookDetails;