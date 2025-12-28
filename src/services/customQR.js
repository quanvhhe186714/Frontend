import api from "./apiService";

// Tạo QR code tùy chỉnh mới (Admin only)
export const createCustomQR = (formData) => {
  // Don't set Content-Type header - axios will set it automatically with boundary for FormData
  return api.post("/custom-qr", formData);
};

// Lấy tất cả QR codes (Admin only)
export const getAllCustomQRs = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
  if (params.orderId) queryParams.append('orderId', params.orderId);
  const queryString = queryParams.toString();
  return api.get(`/custom-qr${queryString ? '?' + queryString : ''}`);
};

// Lấy QR code theo ID
export const getCustomQRById = (id) => {
  return api.get(`/custom-qr/${id}`);
};

// Cập nhật QR code (Admin only)
export const updateCustomQR = (id, formData) => {
  // Don't set Content-Type header - axios will set it automatically with boundary for FormData
  return api.put(`/custom-qr/${id}`, formData);
};

// Xóa QR code (Admin only)
export const deleteCustomQR = (id) => {
  return api.delete(`/custom-qr/${id}`);
};

