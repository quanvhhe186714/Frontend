import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../services/apiService';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Avatar,
  CircularProgress,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setUser(data);
        setFormData({
          name: data.name,
          avatar: data.avatar || ''
        });
      } catch (error) {
        setMessage('Không thể tải hồ sơ. Bạn đã đăng nhập chưa?');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (ví dụ: giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('error:Kích thước file không được vượt quá 5MB');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      setMessage('error:Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setSaveLoading(true);
      const response = await fetch('http://localhost:9999/api/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': JSON.parse(localStorage.getItem('userInfo'))?.token
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        // Cập nhật formData và user state
        setFormData(prev => ({
          ...prev,
          avatar: result.avatarUrl
        }));
        setUser(prev => ({
          ...prev,
          avatar: result.avatarUrl
        }));

        // Cập nhật userInfo trong localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
          userInfo.user.avatar = result.avatarUrl;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }

        // Gọi updateMyProfile để lưu URL avatar vào database
        await updateMyProfile(formData.name, result.avatarUrl);
        
        setMessage('success:Upload và cập nhật ảnh thành công!');
      } else {
        throw new Error(result.message || 'Lỗi upload ảnh');
      }
    } catch (error) {
      setMessage('error:' + (error.message || 'Lỗi upload ảnh'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const { data } = await updateMyProfile(formData.name, formData.avatar);
      setUser(data);
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        userInfo.user.name = data.name;
        userInfo.user.avatar = data.avatar;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      
      setMessage('success:Cập nhật thành công!');
    } catch (error) {
      setMessage('error:' + (error.response?.data?.message || 'Lỗi cập nhật'));
    } finally {
      setSaveLoading(false);
    }
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">{message}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography component="h1" variant="h5">
              Hồ sơ của bạn
            </Typography>
            <IconButton color="primary" onClick={() => navigate('/student')} title="Về trang chủ">
              <HomeIcon />
            </IconButton>
          </Box>

          {message && (
            <Alert 
              severity={message.startsWith('success:') ? 'success' : 'error'} 
              sx={{ mb: 2 }}
            >
              {message.substring(message.indexOf(':') + 1)}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={formData.avatar || user.avatar}
                alt={formData.name}
                sx={{ 
                  width: 150, 
                  height: 150, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'grey.300'
                }}
              >
                {formData.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Chip
                label={`Vai trò: ${user.role}`}
                color="primary"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email"
                  value={user.email}
                  disabled
                  variant="filled"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="name"
                  label="Họ và tên"
                  value={formData.name}
                  onChange={handleChange}
                />

                <Box sx={{ mt: 2, mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-file"
                    type="file"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="avatar-file">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Avatar
                    </Button>
                  </label>
                  {formData.avatar && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Ảnh đã chọn: {formData.avatar.split('/').pop()}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saveLoading}
                  sx={{ mt: 3 }}
                >
                  {saveLoading ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};
;

export default Profile;