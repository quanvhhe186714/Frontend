import api from "./apiService";

// Get reviews for a product
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// Admin: Create fake review
export const createFakeReview = async (data) => {
  const response = await api.post("/reviews/fake", data);
  return response.data;
};

// Admin: Get all fake reviews
export const getAllFakeReviews = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.productId) queryParams.append('productId', params.productId);
  const queryString = queryParams.toString();
  const response = await api.get(`/reviews/fake${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Admin: Update fake review
export const updateFakeReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/fake/${reviewId}`, data);
  return response.data;
};

// Admin: Delete fake review
export const deleteFakeReview = async (reviewId) => {
  const response = await api.delete(`/reviews/fake/${reviewId}`);
  return response.data;
};

