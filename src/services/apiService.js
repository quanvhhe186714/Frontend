// src/services/apiService.js
import axios from 'axios';

// URL của backend API
// Ưu tiên: REACT_APP_API_URL > window.location.origin (nếu deploy cùng domain) > default
export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://backend-cy6b.onrender.com";
const API_URL = BASE_URL;

// Log để debug (chỉ trong development)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 API Base URL:", API_URL);
}

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
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);

        if (userInfo && userInfo.token) {
          config.headers['Authorization'] = userInfo.token; // Token đã có 'Bearer ' từ backend
        }
      }
    } catch (error) {
      console.warn('Failed to parse userInfo from localStorage:', error);
    }
    
    // Nếu là FormData, không set Content-Type để axios tự động set với boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
