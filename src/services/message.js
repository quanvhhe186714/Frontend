import api from "./apiService";

const sendMessage = async (content, receiverId = null) => {
  const response = await api.post("/messages", { content, receiverId });
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

const messageService = {
  sendMessage,
  getMyMessages,
  getAllConversations,
  getConversationMessages,
  getUnreadCount
};

export default messageService;

