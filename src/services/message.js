import api from "./apiService";

// === Message Threads ===
export const fetchThreads = (params = {}) =>
  api.get("/messages/threads", { params });

export const createThread = (payload) =>
  api.post("/messages/threads", payload);

export const pinThread = (threadKey) =>
  api.put(`/messages/threads/${threadKey}/pin`);

export const unpinThread = (threadKey) =>
  api.put(`/messages/threads/${threadKey}/unpin`);

export const markThreadRead = (threadKey) =>
  api.put(`/messages/threads/${threadKey}/read`);

// === Thread Messages ===
export const fetchThreadMessages = (threadKey, params = {}) =>
  api.get(`/messages/threads/${threadKey}/messages`, { params });

export const sendThreadMessage = (threadKey, payload) =>
  api.post(`/messages/threads/${threadKey}/messages`, payload);

export default {
  fetchThreads,
  createThread,
  pinThread,
  unpinThread,
  markThreadRead,
  fetchThreadMessages,
  sendThreadMessage,
};

