// src/services/apiService.js
import axios from 'axios';

const PRODUCTION_API_URL = "https://backend-cy6b.onrender.com";
const LOCAL_API_URL = "http://localhost:9999";

/** Resolve API base URL: local dev vs Vercel/production (never call localhost from prod domain). */
export const resolveApiBaseUrl = () => {
  const fromEnv = process.env.REACT_APP_API_URL?.replace(/\/$/, "");
  const isBrowser = typeof window !== "undefined";
  const isLocalHost =
    isBrowser &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocalHost) {
    return fromEnv || LOCAL_API_URL;
  }

  if (fromEnv && !/localhost|127\.0\.0\.1/i.test(fromEnv)) {
    return fromEnv;
  }

  return PRODUCTION_API_URL;
};

export const BASE_URL = resolveApiBaseUrl();
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
