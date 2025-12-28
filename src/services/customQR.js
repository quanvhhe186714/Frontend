import api from "./apiService";

// Tạo QR code tùy chỉnh mới (Admin only)
export const createCustomQR = (formData) => {
  return api.post("/custom-qr", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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
  return api.put(`/custom-qr/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Xóa QR code (Admin only)
export const deleteCustomQR = (id) => {
  return api.delete(`/custom-qr/${id}`);
};

