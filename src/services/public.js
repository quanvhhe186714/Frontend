import api from "./apiService";

export const getBankFeeds = (limit = 100) =>
  api.get(`/public/transactions?limit=${limit}`);
