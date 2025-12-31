import api from "./apiService";

export const getBankFeeds = (limit = 100) =>
  api.get(`/public/transactions?limit=${limit}`);

export const getBankFeedHistory = (page = 1, limit = 200) =>
  api.get(`/public/transactions/history?page=${page}&limit=${limit}`);
