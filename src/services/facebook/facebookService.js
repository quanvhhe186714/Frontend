import api from "../../services/apiService";

const facebookService = {
  // Lấy tất cả dịch vụ
  getServices: async () => {
    const response = await api.get("/facebook-services");
    return response.data;
  },

  // Lấy dịch vụ theo ID
  getServiceById: async (id) => {
    const response = await api.get(`/facebook-services/${id}`);
    return response.data;
  },

  // Tính giá dịch vụ
  calculatePrice: async (serviceId, quantity, serverId = null) => {
    const response = await api.post("/facebook-services/calculate", {
      serviceId,
      quantity,
      serverId
    });
    return response.data;
  },

  // Admin: Tạo dịch vụ mới
  createService: async (serviceData) => {
    const response = await api.post("/facebook-services", serviceData);
    return response.data;
  },

  // Admin: Cập nhật dịch vụ
  updateService: async (id, serviceData) => {
    const response = await api.put(`/facebook-services/${id}`, serviceData);
    return response.data;
  },

  // Admin: Xóa dịch vụ
  deleteService: async (id) => {
    const response = await api.delete(`/facebook-services/${id}`);
    return response.data;
  },

  // Lấy bảng giá mẫu
  getPriceTable: async (id) => {
    const response = await api.get(`/facebook-services/${id}/price-table`);
    return response.data;
  },

  // Lấy trạng thái dịch vụ
  getServiceStatus: async (id) => {
    const response = await api.get(`/facebook-services/${id}/status`);
    return response.data;
  }
};

export default facebookService;

