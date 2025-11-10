import api from "./apiService";

export const getAllClubs = async () => {
  return await api.get("/clubs");
};

export const getClubDetailById = async (id) => {
  return await api.get(`/clubs/${id}`);
};

export const createClub = async (data) => {
  return await api.post("/clubs", data);
};

export const updateClub = async (clubId, data) => {
  return await api.put(`/clubs/${clubId}`, data);
};

export const deleteClub = async (clubId) => {
  return await api.delete(`/clubs/${clubId}`);
};

export const approveClub = async (clubId) => {
  return await api.put(`/clubs/${clubId}/approve`);
};

export const rejectClub = async (clubId) => {
  return await api.put(`/clubs/${clubId}/reject`);
};

export const addMemberToClub = async (clubId, userId) => {
  return await api.post("/clubs/add-member", { clubId, userId });
};

// Lấy clubs mà user là manager (bao gồm cả pending và approved)
export const getMyManagedClubs = async () => {
  return await api.get("/clubs/my-clubs");
};

// Admin: lấy danh sách CLB theo status (vd: pending)
export const getClubsForAdmin = async (params = {}) => {
  return await api.get("/clubs/admin", { params });
};