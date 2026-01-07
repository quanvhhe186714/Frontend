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

// Assign custom QR code to order (Admin only)
const assignCustomQRToOrder = async (orderId, customQRId) => {
  const response = await api.put(`/orders/${orderId}/assign-qr`, { customQRId });
  return response.data;
};

// Download invoice (PDF)
const downloadInvoice = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/download-invoice`, {
      responseType: 'blob' // Quan trọng: để nhận file binary
    });
    
    // Nếu response là JSON (Cloudinary URL), trả về URL
    if (response.headers['content-type']?.includes('application/json')) {
      const jsonData = JSON.parse(await response.data.text());
      return jsonData;
    }
    
    // Nếu là file PDF, tạo download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    // Nếu lỗi, có thể là Cloudinary URL - thử parse JSON
    if (error.response?.data) {
      try {
        const text = await error.response.data.text();
        const jsonData = JSON.parse(text);
        if (jsonData.invoiceUrl) {
          // Mở URL trong tab mới
          window.open(jsonData.invoiceUrl, '_blank');
          return { success: true, url: jsonData.invoiceUrl };
        }
      } catch (e) {
        // Không phải JSON, throw error gốc
      }
    }
    throw error;
  }
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
  restoreOrder,
  downloadInvoice,
  assignCustomQRToOrder,
  // Admin: get pending orders by user
  getPendingByUser: async (userId) => {
    const res = await api.get(`/orders/by-user/${userId}/pending`);
    return res.data;
  }

export default orderService;
