import api from "./apiService";

export const getWallet = () => api.get("/wallet/");

export const createTopupRequest = (amount, method = "bank_transfer", bank = "mb", note = "") =>
  api.post("/wallet/topup", { amount, method, bank, note });

export const getMyTransactions = () => api.get("/wallet/transactions");

export const getAllTransactions = () => api.get("/wallet/admin/transactions");

export const updateTransactionStatus = (id, status) =>
  api.patch(`/wallet/admin/transactions/${id}`, { status });

// Admin: Soft delete transaction
export const softDeleteTransaction = (transactionId) =>
  api.delete(`/wallet/admin/transactions/${transactionId}/soft-delete`);

// Admin: Restore transaction
export const restoreTransaction = (transactionId) =>
  api.post(`/wallet/admin/transactions/${transactionId}/restore`);

// Ghi nhận thanh toán từ QR code tùy chỉnh
export const recordPaymentFromQR = (customQRId, note = "") =>
  api.post("/wallet/record-payment", { customQRId, note });

// SePay: Lấy thông tin tài khoản
export const getSePayAccountInfo = () =>
  api.get("/payments/sepay/account-info");

// SePay: Kiểm tra trạng thái transaction theo reference_code
export const checkTransactionStatus = (referenceCode) =>
  api.get(`/wallet/transactions/status/${referenceCode}`);

// SePay: Tạo topup request với SePay (tự động tạo transaction chờ webhook)
// Note: Backend sẽ tạo transaction với status 'pending' và referenceCode
// Khi SePay gửi webhook với referenceCode này, backend sẽ tự động cập nhật transaction
export const createSePayTopupRequest = (amount, referenceCode, bank = "mb", note = "") =>
  api.post("/wallet/topup", { 
    amount, 
    method: "sepay", 
    bank,
    referenceCode,
    note 
  });

const walletService = {
  getWallet,
  createTopupRequest,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
  softDeleteTransaction,
  restoreTransaction,
  recordPaymentFromQR,
  getSePayAccountInfo,
  checkTransactionStatus,
  createSePayTopupRequest,
};

export default walletService;

