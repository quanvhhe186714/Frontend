import api from "./apiService";

export const getWallet = () => api.get("/wallet/");

export const createTopupRequest = (amount, method = "bank_transfer", bank = "mb", note = "") =>
  api.post("/wallet/topup", { amount, method, bank, note });

export const getMyTransactions = () => api.get("/wallet/transactions");

export const getAllTransactions = () => api.get("/wallet/admin/transactions");

export const updateTransactionStatus = (id, status) =>
  api.patch(`/wallet/admin/transactions/${id}`, { status });

const walletService = {
  getWallet,
  createTopupRequest,
  getMyTransactions,
  getAllTransactions,
  updateTransactionStatus,
};

export default walletService;

