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

const validateCoupon = async (code, orderTotal) => {
    const response = await api.post("/coupons/validate", { code, orderTotal });
    return response.data;
};

const getDashboardStats = async () => {
    const response = await api.get("/orders/stats");
    return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  validateCoupon,
  getDashboardStats
};

export default orderService;
