import api from "./apiService";

const createOrder = async (data) => {
  const response = await api.post("/orders", data);
  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

// Admin: Update order purchased date/time
const updateOrderTimestamp = async (id, purchasedAt) => {
  const response = await api.put(`/orders/${id}/timestamp`, { purchasedAt });
  return response.data;
};

const validateCoupon = async (code, orderTotal) => {
    const response = await api.post("/coupons/validate", { code, orderTotal });
    return response.data;
};

const getDashboardStats = async () => {
    const response = await api.get("/orders/stats");
    return response.data;
};

// Admin: Soft delete order
const softDeleteOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}/soft-delete`);
  return response.data;
};

// Admin: Restore order
const restoreOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/restore`);
  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderTimestamp,
  validateCoupon,
  getDashboardStats,
  softDeleteOrder,
  restoreOrder
};

export default orderService;
