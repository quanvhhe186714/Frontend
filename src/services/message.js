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

const getMessagesByOrderId = async (orderId) => {
  const response = await api.get(`/messages/order/${orderId}`);
  return response.data;
};

const messageService = {
  sendMessage,
  getMyMessages,
  getAllConversations,
  getConversationMessages,
  getUnreadCount,
  getMessagesByOrderId,
  deleteMessage
};

export default messageService;

