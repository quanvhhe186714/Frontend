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

// Lấy danh sách QR codes công khai (Public - không cần authentication)
export const getPublicCustomQRs = () => {
  return api.get("/custom-qr/public");
};

// Lấy QR codes đang publish cho trang \"Thanh toán qua QR\" (yêu cầu đăng nhập)
// Trả về danh sách QR với thông tin nhạy cảm đã bị ẩn
export const getPublishedCustomQRs = () => {
  return api.get("/custom-qr/published");
};

// Lấy chi tiết đầy đủ của QR đang publish (khi user chọn QR)
export const getPublishedQRDetail = (id) => {
  return api.get(`/custom-qr/published/${id}`);
};

// Publish một QR code (Admin only)
export const publishCustomQR = (id) => {
  return api.post(`/custom-qr/${id}/publish`);
};

// Gỡ publish một QR code (Admin only)
export const unpublishCustomQR = (id) => {
  return api.post(`/custom-qr/${id}/unpublish`);
};

