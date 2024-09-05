import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { Container, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
const PREFIX = 'Register';

const classes = {
  formContainer: `${PREFIX}-formContainer`,
  formControl: `${PREFIX}-formControl`,
  submitButton: `${PREFIX}-submitButton`
};

const StyledContainer = styled(Container)((
  {
    theme
  }
) => ({
  [`& .${classes.formContainer}`]: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  [`& .${classes.formControl}`]: {
    minWidth: 200,
    marginTop: theme.spacing(2),
  },

  [`& .${classes.submitButton}`]: {
    marginTop: theme.spacing(2),
  }
}));

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/register', {
        username,
        password,
        email,
        phone,
        name,
        address,
        gender,
      });
      alert('註冊成功');
      console.log(response.data);
      navigate('/');
    } catch (error) {
      alert('註冊失敗: ' + error.response.data.error); // 顯示詳細錯誤訊息
      console.error(error);
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <form className={classes.formContainer} onSubmit={handleSubmit}>
        <h1>註冊</h1>
        <TextField
          label="使用者名稱"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="密碼"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="電子信箱"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="手機號碼"
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="姓名"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="地址"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>性別</InputLabel>
          <Select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            label="性別"
            required
          >
            <MenuItem value="">請選擇性別</MenuItem>
            <MenuItem value="男">男</MenuItem>
            <MenuItem value="女">女</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
          disabled={!gender}
        >
          註冊
        </Button>
      </form>
    </StyledContainer>
  );
}

export default Register;
