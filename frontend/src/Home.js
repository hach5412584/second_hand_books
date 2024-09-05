import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, AppBar, Toolbar, Typography, Box, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const PREFIX = 'Home';

const classes = {
    appBar: `${PREFIX}-appBar`,
    appBarContent: `${PREFIX}-appBarContent`,
    searchBar: `${PREFIX}-searchBar`,
    menuBar: `${PREFIX}-menuBar`,
    menuButton: `${PREFIX}-menuButton`,
    dropDownContent: `${PREFIX}-dropDownContent`,
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

const StyledMenuBar = styled(Box)(({ theme }) => ({
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'relative',
}));

const MenuButton = styled(Button)(({ theme }) => ({
    position: 'relative',
    color: 'black',
    whiteSpace: 'nowrap',
}));

const DropDownContent = styled(Box)(({ theme }) => ({
    right: '0',
    left: '0',
    display: 'none',
    position: 'fixed',
    top: '118px',
    margin: '0 16.5%',
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1,
    padding: theme.spacing(2),
    justifyContent: 'space-around',
    '& a': {
        color: 'black',
        padding: '12px 16px',
        textDecoration: 'none',
        display: 'block',
    },
    '& a:hover': {
        backgroundColor: '#ddd',
    },
}));

const MenuItem = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    '&:hover .dropDownContent': {
        display: 'block',
    },
}));

const Divider = styled('div')(({ theme }) => ({
    height: '2px',
    backgroundColor: '#d3d3d3',
}));

const MainContainer = styled(Container)(({ theme }) => ({
    margin: '0 16.5%', // 居中
}));

function Home({ isAuthenticated, handleLogout }) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const [categories, setCategories] = useState({});
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/allbooks');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks();
    }, []);

    const handleCategoryClick = (category, subcategory) => {
        axios.get(`http://localhost:8080/api/Quicksearch?category=${category}&subcategory=${subcategory}`)
            .then(response => {
                setBooks(response.data);  // 更新書籍列表
            })
            .catch(error => {
                console.error('Error fetching books:', error);
            });
    };

    return (
        <div>
            <StyledAppBar position="static" className={classes.appBar} elevation={0}>
                <Toolbar className={classes.appBarContent}>
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                        onClick={() => window.location.reload()}
                    >
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
            <Divider />
            <StyledMenuBar>
                <Box sx={{ margin: '0 16.5%', display: 'flex', justifyContent: 'space-around', position: 'relative' }}>
                    {Object.keys(categories).map((category) => (
                        <MenuItem key={category}>
                            <MenuButton className="menuButton" onClick={() => handleCategoryClick(category, "")}>
                                {category}
                            </MenuButton>
                            <DropDownContent className="dropDownContent">
                                {categories[category].map((subcategory) => (
                                    <a
                                        href="#"
                                        key={subcategory}
                                        onClick={() => handleCategoryClick(category, subcategory)}
                                    >
                                        {subcategory}
                                    </a>
                                ))}
                            </DropDownContent>
                        </MenuItem>
                    ))}
                </Box>
            </StyledMenuBar>
            <MainContainer className={classes.mainContainer}>
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={4} key={book.ID}>
                            <Link to={`/bookDetails/${book.ID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Box sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2, textAlign: 'left' }}>
                                    <Box sx={{ height: '450px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <img src={book.ImageURL} alt={book.Title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Typography variant="body1">
                                            {book.Category}
                                        </Typography>
                                        <Typography variant="body1">
                                            {book.Subcategory}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ mt: 1, fontSize: '1rem' }}>
                                        {book.Title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            作者:{book.Author}
                                        </Typography>
                                        <Typography variant="body1">
                                            價格:{book.Price}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </MainContainer>
        </div>
    );
}

export default Home;
