// === Public Routes ===
import api from "./apiService";
export const registerUser = (name, email, password) =>
  api.post("/users/register", { name, email, password });

export const loginUser = (email, password) =>
  api.post("/users/login", { email, password });

// === Private Routes ===
export const getMyProfile = () => api.get("/users/profile");

export const updateMyProfile = (name, avatar) =>
  api.put("/users/profile", { name, avatar });

// === Admin Routes ===
export const getAllUsers = () => api.get("/users/");

export const getUserById = (id) => api.get(`/users/${id}`);

export const updateUser = (id, name, role, status) =>
  api.put(`/users/${id}`, { name, role, status });

export const deleteUser = (id) => api.delete(`/users/${id}`);

// Cập nhật trạng thái người dùng (block/unblock)
export const blockUser = (id, status) => api.put(`/users/${id}`, { status });

export const changePassword = (oldPassword, newPassword) =>
  api.put("/users/change-password", { oldPassword, newPassword });

// Upload avatar
export const uploadAvatar = (formData) => {
  // Token sẽ được tự động thêm bởi interceptor trong apiService
  // Content-Type sẽ được axios tự động set cho FormData
  return api.post("/users/upload-avatar", formData);
};

// Admin: Xem password của user - DEPRECATED
export const getUserPassword = (userId) => api.get(`/users/${userId}/password`);

// Admin: Login as user (impersonate)
export const loginAsUser = (userId) => api.post(`/users/${userId}/login-as`);

// Admin: Lấy số dư ví của user
export const getUserWalletBalance = (userId) => api.get(`/users/${userId}/wallet`);

// Admin: Cập nhật số dư ví của user (amount: số tiền, operation: 'add' hoặc 'subtract')
export const updateUserWalletBalance = (userId, amount, operation) => 
  api.put(`/users/${userId}/wallet`, { amount, operation });

// Admin: Xóa lịch sử mua hàng của user (hard delete)
export const deleteUserOrderHistory = (userId) => api.delete(`/users/${userId}/orders`);

// Admin: Lấy đơn hàng của user (có thể filter theo status: pending, paid, completed, etc.)
export const getUserOrders = (userId, status = null, includeDeleted = false) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (includeDeleted) params.append('includeDeleted', 'true');
  const queryString = params.toString();
  return api.get(`/users/${userId}/orders${queryString ? '?' + queryString : ''}`);
};

// Admin: Lấy lịch sử thanh toán (transactions) của user
export const getUserTransactions = (userId, status = null, includeDeleted = false) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (includeDeleted) params.append('includeDeleted', 'true');
  const queryString = params.toString();
  return api.get(`/users/${userId}/transactions${queryString ? '?' + queryString : ''}`);
};