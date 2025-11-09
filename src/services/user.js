// === Public Routes ===
import api from "./apiService";
export const registerUser = (name, email, password, role = "student") =>
  api.post("/users/register", { name, email, password, role });

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
