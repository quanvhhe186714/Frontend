import api from "./apiService";

const encodeThreadKey = (threadKey) =>
  typeof threadKey === "string" ? encodeURIComponent(threadKey) : threadKey;

// === Message Threads ===
export const fetchThreads = (params = {}) =>
  api.get("/messages/threads", { params });

export const createThread = (payload) =>
  api.post("/messages/threads", payload);

export const fetchMessageUsers = (params = {}) =>
  api.get("/messages/users", { params });

export const pinThread = (threadKey) =>
  api.put(`/messages/threads/${encodeThreadKey(threadKey)}/pin`);

export const unpinThread = (threadKey) =>
  api.put(`/messages/threads/${encodeThreadKey(threadKey)}/unpin`);

export const markThreadRead = (threadKey) =>
  api.put(`/messages/threads/${encodeThreadKey(threadKey)}/read`);

// === Thread Messages ===
export const fetchThreadMessages = (threadKey, params = {}) =>
  api.get(`/messages/threads/${encodeThreadKey(threadKey)}/messages`, {
    params,
  });

export const sendThreadMessage = (threadKey, payload) =>
  api.post(
    `/messages/threads/${encodeThreadKey(threadKey)}/messages`,
    payload
  );

const messageService = {
  fetchThreads,
  createThread,
  fetchMessageUsers,
  pinThread,
  unpinThread,
  markThreadRead,
  fetchThreadMessages,
  sendThreadMessage,
};

export default messageService;

