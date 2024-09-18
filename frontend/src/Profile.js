import React, { useState, useEffect } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";

const PREFIX = "Profile";

const classes = {
  appBar: `${PREFIX}-appBar`,
  appBarContent: `${PREFIX}-appBarContent`,
  table: `${PREFIX}-table`,
  switchButton: `${PREFIX}-switchButton`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`&.${classes.appBar}`]: {
    backgroundColor: "#f5f5f5",
    color: "black",
  },
  [`& .${classes.appBarContent}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const Profile = ({ handleLogout }) => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("listedBooks");
  const [books, setBooks] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user:", error); // 捕獲解析錯誤
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.ID) {
      const fetchBooks = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/booklist?userID=${user.ID}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setBooks(data);
        } catch (error) {
          console.error("Error fetching books:", error);
        }
      };

      fetchBooks();
    }
  }, [user]); // 依賴於 user 狀態變化

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      const user = JSON.parse(sessionStorage.getItem("user"));

      try {
        const response = await axios.get(
          `http://localhost:8080/api/purchaseHistory?userID=${user.ID}`
        );
        setPurchaseHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch purchase history:", error);
      }
    };

    fetchPurchaseHistory();
  }, []);

  const handleChangeView = (event, newValue) => {
    setView(newValue);
  };

  return (
    <div>
      <StyledAppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.appBarContent}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            style={{ textDecoration: "none", color: "black" }}
          >
            二手書交易平台
          </Typography>
          <Button color="inherit" href="/cartPage">
            <ShoppingCartIcon />
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            登出
          </Button>
        </Toolbar>
      </StyledAppBar>
      <Container>
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            個人資料
          </Typography>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableBody>
                <TableRow>
                  <TableCell>帳號</TableCell>
                  <TableCell>{user?.Username || "無"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>姓名</TableCell>
                  <TableCell>{user?.name || "無"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>電話</TableCell>
                  <TableCell>{user?.phone || "無"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>地址</TableCell>
                  <TableCell>{user?.address || "無"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>性別</TableCell>
                  <TableCell>{user?.gender || "無"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>電子信箱</TableCell>
                  <TableCell>{user?.Email || "無"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box mt={4}>
          <Tabs value={view} onChange={handleChangeView} aria-label="切換視圖">
            <Tab label="已上架書籍" value="listedBooks" />
            <Tab label="歷史購買紀錄" value="purchaseHistory" />
          </Tabs>
          {view === "listedBooks" && (
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>書名</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>子類別</TableCell>
                    <TableCell>價格</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.ID}>
                      <TableCell>{book.Title}</TableCell>
                      <TableCell>{book.Category}</TableCell>
                      <TableCell>{book.Subcategory}</TableCell>
                      <TableCell>{book.Price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {view === "purchaseHistory" && (
            <TableContainer component={Paper}>
              <Table
                className={classes.table}
                aria-label="purchase history table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>書名</TableCell>
                    <TableCell>作者</TableCell>
                    <TableCell>金額</TableCell>
                    <TableCell>數量</TableCell>
                    <TableCell>購買日期</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body1" align="center">
                          您尚未購買任何書籍。
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.Book.Title}</TableCell>
                        <TableCell>{item.Book.Author}</TableCell>
                        <TableCell>{item.Amount}</TableCell>
                        <TableCell>{item.Quantity}</TableCell>
                        <TableCell>
                          {new Date(item.CreatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/addbook"
          >
            上架新書
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Profile;
