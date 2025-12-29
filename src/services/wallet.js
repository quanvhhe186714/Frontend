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

const walletService = {
  getWallet,
  createTopupRequest,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
  softDeleteTransaction,
  restoreTransaction,
  recordPaymentFromQR,
};

export default walletService;

