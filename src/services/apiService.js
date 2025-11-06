// src/services/apiService.js
import axios from 'axios';

// URL của backend API
const BASE_URL = 'http://localhost:9999/api';
const API_URL = `${BASE_URL}/users`;

/**
 * Tạo một instance axios với cấu hình cơ bản,
 * bao gồm việc tự động đính kèm token vào header
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor này sẽ lấy token từ localStorage (sau khi đăng nhập)
 * và thêm nó vào header 'Authorization' cho mọi yêu cầu private.
 */
api.interceptors.request.use(
  (config) => {
    // Lấy thông tin user (bao gồm token) từ localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = userInfo.token; // Token đã có 'Bearer ' từ backend
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === Public Routes ===
export const registerUser = (name, email, password, role = 'student') =>
  api.post('/register', { name, email, password, role });

export const loginUser = (email, password) =>
  api.post('/login', { email, password });

// === Private Routes ===
export const getMyProfile = () => api.get('/profile');

export const updateMyProfile = (name, avatar) =>
  api.put('/profile', { name, avatar });

// === Admin Routes ===
export const getAllUsers = () => api.get('/');

export const getUserById = (id) => api.get(`/${id}`);

export const updateUser = (id, name, role, status) =>
  api.put(`/${id}`, { name, role, status });

export const deleteUser = (id) => api.delete(`/${id}`);

// Cập nhật trạng thái người dùng (block/unblock)
export const blockUser = (id, status) =>
  api.put(`/${id}`, { status });

export const changePassword = (oldPassword, newPassword) =>
  api.put('/change-password', { oldPassword, newPassword });

export default api;