import api from "./apiService";

export const getRecentPayments = (limit = 10) =>
  api.get(`/payments/recent?limit=${limit}`);

export const getAllPayments = (page = 1, limit = 50) =>
  api.get(`/payments/history?page=${page}&limit=${limit}`);

const paymentHistoryService = {
  getRecentPayments,
  getAllPayments,
};
export default paymentHistoryService;

