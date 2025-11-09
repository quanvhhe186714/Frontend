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

export const approveClub = async (clubId) => {
  return await api.put(`/clubs/${clubId}/approve`);
};

export const addMemberToClub = async (clubId, userId) => {
  return await api.post("/clubs/add-member", { clubId, userId });
};
export const joinClub = (data) => api.post("/clubs/add-member", data);