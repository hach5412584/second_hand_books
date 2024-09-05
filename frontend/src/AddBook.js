import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';
import { Form, Row, Col } from 'react-bootstrap';

function BookForm() {
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        price: '',
        summary: '',
        category: '',
        subcategory: '',
        author: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState({});
    const [subcategories, setSubcategories] = useState([]);
    const [isbnError, setIsbnError] = useState('');
    const navigate = useNavigate();
    const userId = JSON.parse(sessionStorage.getItem('user')).ID;
    console.log(userId);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'isbn') {
            if (isValidISBN(value)) {
                setIsbnError('');
            } else {
                setIsbnError('請輸入有效的 ISBN 編號。');
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            image: file,
        });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setFormData({
            ...formData,
            category: selectedCategory,
            subcategory: '',
        });
        setSubcategories(categories[selectedCategory] || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isbnError) {
            alert('請輸入有效的 ISBN 編號');
            return;
        }

        const data = new FormData();
        for (let key in formData) {
            data.append(key, formData[key]);
        }
        data.append('userID', userId);

        try {
            const response = await axios.post('http://localhost:8080/api/books', data);
            alert("新增成功");
            navigate('/profile');
        } catch (error) {
            alert("新增失敗");
            console.error('Error creating book:', error);
        }
    };

    const isValidISBN = (isbn) => {
        // 移除所有非數字和非 X 字符（對於 ISBN-10）
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

        // 驗證 ISBN-10
        if (cleanIsbn.length === 10) {
            const sum = cleanIsbn
                .split('')
                .reduce((acc, digit, index) => {
                    if (digit === 'X') digit = 10;
                    else digit = parseInt(digit, 10);
                    return acc + digit * (10 - index);
                }, 0);
            return sum % 11 === 0;
        }

        // 驗證 ISBN-13
        if (cleanIsbn.length === 13) {
            const sum = cleanIsbn
                .split('')
                .reduce((acc, digit, index) => {
                    digit = parseInt(digit, 10);
                    return acc + (index % 2 === 0 ? digit : digit * 3);
                }, 0);
            return sum % 10 === 0;
        }

        // 如果不是 10 位或 13 位長，則不是有效的 ISBN
        return false;
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                新增書籍
            </Typography>
            <Form onSubmit={handleSubmit}>
                <Form.Group as={Row} controlId="isbn">
                    <Form.Label column sm={2}>ISBN</Form.Label>
                    <Col sm={10}>
                        <TextField
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            fullWidth
                            error={!!isbnError}
                            helperText={isbnError}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="title">
                    <Form.Label column sm={2}>書名</Form.Label>
                    <Col sm={10}>
                        <TextField name="title" onChange={handleChange} fullWidth />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="price">
                    <Form.Label column sm={2}>價格TWD</Form.Label>
                    <Col sm={10}>
                        <TextField name="price" onChange={handleChange} fullWidth />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="summary">
                    <Form.Label column sm={2}>大綱、內容</Form.Label>
                    <Col sm={10}>
                        <TextField name="summary" onChange={handleChange} fullWidth />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="category">
                    <Form.Label column sm={2}>類別</Form.Label>
                    <Col sm={10}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>類別</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleCategoryChange}
                                label="類別"
                            >
                                {Object.keys(categories).map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="subcategory">
                    <Form.Label column sm={2}>子類別</Form.Label>
                    <Col sm={10}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>子類別</InputLabel>
                            <Select
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                label="子類別"
                                disabled={!formData.category} // Disable if no category is selected
                            >
                                {subcategories.map((subcat) => (
                                    <MenuItem key={subcat} value={subcat}>
                                        {subcat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="author">
                    <Form.Label column sm={2}>作者</Form.Label>
                    <Col sm={10}>
                        <TextField name="author" onChange={handleChange} fullWidth />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="image">
                    <Form.Label column sm={2}>上傳圖片</Form.Label>
                    <Col sm={10}>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ marginTop: '10px', width: '100px' }} />}
                    </Col>
                </Form.Group>
                <Button type="submit" variant="contained" color="primary">
                    新增書籍
                </Button>
            </Form>
        </Container>
    );
}

export default BookForm;
