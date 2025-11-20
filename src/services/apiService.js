// src/services/apiService.js
import axios from 'axios';

// URL của backend API
const BASE_URL = 'https://shopnambs-4bru.onrender.com';
const API_URL = BASE_URL;

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

// Global response interceptor: handle 401 to logout gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('userInfo');
      if (typeof window !== 'undefined') {
        const current = window.location.pathname;
        if (current !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;