import api from "./apiService";

// Get reviews for a product
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// Get reviews for a Facebook service
export const getServiceReviews = async (serviceId) => {
  const response = await api.get(`/reviews/service/${serviceId}`);
  return response.data;
};

// Get rating summary for a product
export const getProductRatingSummary = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}/summary`);
  return response.data;
};

// Get rating summary for a Facebook service
export const getServiceRatingSummary = async (serviceId) => {
  const response = await api.get(`/reviews/service/${serviceId}/summary`);
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
  if (params.serviceId) queryParams.append('serviceId', params.serviceId);
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

// User: Create review
export const createReview = async (data) => {
  const response = await api.post("/reviews", data);
  return response.data;
};

// User/Admin: Update review
export const updateReview = async (reviewId, data) => {
  const response = await api.put(`/reviews/${reviewId}`, data);
  return response.data;
};

// User/Admin: Delete review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Admin: Get all reviews (both fake and real)
export const getAllReviews = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.productId) queryParams.append('productId', params.productId);
  if (params.serviceId) queryParams.append('serviceId', params.serviceId);
  if (params.isFake !== undefined) queryParams.append('isFake', params.isFake);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  const queryString = queryParams.toString();
  const response = await api.get(`/reviews${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Get user's review for a product or service
export const getUserReview = async (productId, serviceId) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (!userInfo || !userInfo._id) return null;
    
    const reviews = productId 
      ? await getProductReviews(productId)
      : await getServiceReviews(serviceId);
    
    return reviews.find(review => review.user && review.user._id === userInfo._id && !review.isFake) || null;
  } catch (error) {
    console.error("Error getting user review:", error);
    return null;
  }
};

