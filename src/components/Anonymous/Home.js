import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Hồ sơ của tôi',
      icon: <PersonIcon />,
      onClick: () => navigate('/profile'),
    },
    {
      title: 'Đổi mật khẩu',
      icon: <LockIcon />,
      onClick: () => navigate('/change-password'),
    },
    {
      title: 'Đăng xuất',
      icon: <LogoutIcon />,
      onClick: handleLogout,
    },
  ];

  const quickActions = [
    {
      title: 'Xem hồ sơ',
      description: 'Xem và cập nhật thông tin cá nhân',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/profile'),
    },
    {
      title: 'Đổi mật khẩu',
      description: 'Cập nhật mật khẩu tài khoản',
      icon: <LockIcon sx={{ fontSize: 40 }} />,
      onClick: () => navigate('/change-password'),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {userInfo?.user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
          </Typography>
          <IconButton
            size="large"
            color="inherit"
            onClick={() => {/* Handle notifications */}}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar 
              alt={userInfo?.user?.name} 
              src={userInfo?.user?.avatar}
              sx={{ width: 32, height: 32 }}
            >
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
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index} 
                onClick={() => {
                  item.onClick();
                  handleClose();
                }}
              >
                <Box sx={{ mr: 1 }}>{item.icon}</Box>
                {item.title}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                color: 'white',
              }}
            >
              <Avatar
                alt={userInfo?.user?.name}
                src={userInfo?.user?.avatar}
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {userInfo?.user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4" gutterBottom>
                Chào mừng, {userInfo?.user?.name}!
              </Typography>
              <Typography variant="subtitle1">
                {userInfo?.user?.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={action.onClick}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    {action.icon}
                    <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Chi tiết</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;