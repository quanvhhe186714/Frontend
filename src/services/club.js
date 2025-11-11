import api from "./apiService";

export const getAllClubs = async () => {
  return await api.get("/clubs");
};

export const getClubDetailById = async (id) => {
  return await api.get(`/clubs/${id}`);
};

export const createClub = (formData) =>
  api.post("/clubs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateClub = (id, formData) =>
  api.put(`/clubs/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

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

export const getMyMemberClubs = async () => {
  return await api.get("/clubs/mine");
};

// Admin: lấy danh sách CLB theo status (vd: pending)
export const getClubsForAdmin = async (params = {}) => {
  return await api.get("/clubs/admin", { params });
};

export const getClubMembers = async (clubId) => {
  return await api.get(`/clubs/${clubId}/members`);
};