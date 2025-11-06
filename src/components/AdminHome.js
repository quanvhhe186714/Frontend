import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { getAllUsers, deleteUser, updateUser } from '../services/apiService';

const AdminHome = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editDialog, setEditDialog] = useState({
    open: false,
    user: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (error) {
      showMessage('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Menu handlers
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

  // Message handling
  const showMessage = (msg, sev = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpenSnackbar(true);
  };

  // Edit user dialog
  const handleEditUser = (user) => {
    setEditDialog({
      open: true,
      user: { ...user }
    });
  };

  const handleEditDialogClose = () => {
    setEditDialog({
      open: false,
      user: null
    });
  };

  const handleEditSubmit = async () => {
    try {
      await updateUser(
        editDialog.user._id,
        editDialog.user.name,
        editDialog.user.role,
        editDialog.user.status
      );
      showMessage('Cập nhật người dùng thành công');
      fetchUsers();
      handleEditDialogClose();
    } catch (error) {
      showMessage('Lỗi khi cập nhật người dùng', 'error');
    }
  };

  // Delete user
  const handleDeleteClick = (user) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa người dùng ${user.name}?`,
      action: () => handleDelete(user._id)
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      showMessage('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      showMessage('Lỗi khi xóa người dùng', 'error');
    }
    setConfirmDialog({ open: false });
  };

  // Block/Unblock user
  const handleBlockClick = (user) => {
    setConfirmDialog({
      open: true,
      title: user.status === 'blocked' ? 'Mở khóa người dùng' : 'Khóa người dùng',
      message: `Bạn có chắc muốn ${user.status === 'blocked' ? 'mở khóa' : 'khóa'} người dùng ${user.name}?`,
      action: () => handleBlockUser(user._id, user.status === 'blocked' ? 'active' : 'blocked')
    });
  };

  const handleBlockUser = async (id, newStatus) => {
    try {
      const userToUpdate = users.find(u => u._id === id);
      if (userToUpdate) {
        await updateUser(id, userToUpdate.name, userToUpdate.role, newStatus);
        showMessage(`${newStatus === 'blocked' ? 'Khóa' : 'Mở khóa'} người dùng thành công`);
        fetchUsers();
      }
    } catch (error) {
      showMessage(`Lỗi khi ${newStatus === 'blocked' ? 'khóa' : 'mở khóa'} người dùng`, 'error');
    }
    setConfirmDialog({ open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
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
              <MenuItem onClick={() => navigate('/profile')}>
                <AccountCircle sx={{ mr: 1 }} /> Hồ sơ
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom component="div">
            Quản lý người dùng
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user._id}
                    sx={{
                      bgcolor: user.status === 'blocked' ? '#ffebee' : 'inherit'
                    }}
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'blocked' ? 'Đã khóa' : 'Hoạt động'}
                        color={user.status === 'blocked' ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color={user.status === 'blocked' ? 'success' : 'warning'}
                        onClick={() => handleBlockClick(user)}
                      >
                        <BlockIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditDialogClose}>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên"
            fullWidth
            value={editDialog.user?.name || ''}
            onChange={(e) => setEditDialog({
              ...editDialog,
              user: { ...editDialog.user, name: e.target.value }
            })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={editDialog.user?.role || ''}
              label="Vai trò"
              onChange={(e) => setEditDialog({
                ...editDialog,
                user: { ...editDialog.user, role: e.target.value }
              })}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Hủy</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>
            Hủy
          </Button>
          <Button onClick={confirmDialog.action} variant="contained" color="error">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={severity}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminHome;