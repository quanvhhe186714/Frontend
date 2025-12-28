import api from "./apiService";

const sendMessage = async (payload) => {
  const { content, receiverId = null, orderId = null, attachments = [] } =
    typeof payload === "object" && payload !== null
      ? payload
      : { content: payload, receiverId: null, orderId: null, attachments: [] };

  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  if (receiverId) {
    formData.append("receiverId", receiverId);
  }
  if (orderId) {
    formData.append("orderId", orderId);
  }
  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await api.post("/messages", formData);
  return response.data;
};

const getMyMessages = async () => {
  const response = await api.get("/messages/my-messages");
  return response.data;
};

const getAllConversations = async () => {
  const response = await api.get("/messages/conversations");
  return response.data;
};

const getConversationMessages = async (conversationId) => {
  const response = await api.get(`/messages/conversations/${conversationId}`);
  return response.data;
};

const getUnreadCount = async () => {
  const response = await api.get("/messages/unread-count");
  return response.data;
};

const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

// Admin: update message/file send time
const updateMessageTimestamp = async (messageId, sentAt) => {
  const response = await api.put(`/messages/${messageId}/timestamp`, { sentAt });
  return response.data;
};

const getMessagesByOrderId = async (orderId) => {
  const response = await api.get(`/messages/order/${orderId}`);
  return response.data;
};

// Admin: Create fake message
const createFakeMessage = async (data) => {
  const response = await api.post("/messages/fake", data);
  return response.data;
};

// Admin: Get all fake messages
const getAllFakeMessages = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.conversationId) queryParams.append('conversationId', params.conversationId);
  if (params.orderId) queryParams.append('orderId', params.orderId);
  const queryString = queryParams.toString();
  const response = await api.get(`/messages/fake${queryString ? '?' + queryString : ''}`);
  return response.data;
};

// Admin: Delete fake message
const deleteFakeMessage = async (messageId) => {
  const response = await api.delete(`/messages/fake/${messageId}`);
  return response.data;
};

const messageService = {
  sendMessage,
  getMyMessages,
  getAllConversations,
  getConversationMessages,
  getUnreadCount,
  getMessagesByOrderId,
  deleteMessage,
  updateMessageTimestamp,
  createFakeMessage,
  getAllFakeMessages,
  deleteFakeMessage
};

export default messageService;

