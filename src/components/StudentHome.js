import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  ExitToApp,
  Lock as LockIcon,
} from '@mui/icons-material';

const StudentHome = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    handleClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar alt={userInfo?.user?.name} src={userInfo?.user?.avatar}>
                {userInfo?.user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1 }} /> Hồ sơ
              </MenuItem>
              <MenuItem onClick={handleChangePassword}>
                <LockIcon sx={{ mr: 1 }} /> Đổi mật khẩu
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4" gutterBottom>
                Chào mừng, {userInfo?.user?.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bạn đang đăng nhập với vai trò Student
              </Typography>
            </Paper>
          </Grid>

          {/* Thêm các phần nội dung khác của trang Student ở đây */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin cá nhân
                </Typography>
                <Typography variant="body2">
                  Email: {userInfo?.user?.email}
                </Typography>
                <Typography variant="body2">
                  Vai trò: {userInfo?.user?.role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentHome;