// === Public Routes ===
import api from "./apiService";
export const registerUser = (name, email, password, role = "student") =>
  api.post("/register", { name, email, password, role });

export const loginUser = (email, password) =>
  api.post("/login", { email, password });

// === Private Routes ===
export const getMyProfile = () => api.get("/profile");

export const updateMyProfile = (name, avatar) =>
  api.put("/profile", { name, avatar });

// === Admin Routes ===
export const getAllUsers = () => api.get("/");

export const getUserById = (id) => api.get(`/${id}`);

export const updateUser = (id, name, role, status) =>
  api.put(`/${id}`, { name, role, status });

export const deleteUser = (id) => api.delete(`/${id}`);

// Cập nhật trạng thái người dùng (block/unblock)
export const blockUser = (id, status) => api.put(`/${id}`, { status });

export const changePassword = (oldPassword, newPassword) =>
  api.put("/change-password", { oldPassword, newPassword });
