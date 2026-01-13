import api from "./apiService";

// Lấy tất cả Bank QR codes (Admin only)
export const getAllBankQRs = () => {
  return api.get("/bank-qr");
};

// Cập nhật trạng thái ẩn/hiện của Bank QR (Admin only)
export const updateBankQRVisibility = (code, isVisible) => {
  return api.put(`/bank-qr/${code}/visibility`, { isVisible });
};

// Lấy danh sách Bank QR đang hiển thị (Public - không cần auth)
export const getVisibleBankQRs = () => {
  return api.get("/bank-qr/public");
};
