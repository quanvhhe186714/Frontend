import React, { useState, useEffect, useRef } from "react";
import messageService from "../../services/message";
import "./ChatWidget.scss";

const ChatWidget = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      loadUnreadCount();
    }
    
    // Polling để cập nhật tin nhắn mới
    const interval = setInterval(() => {
      if (isOpen) {
        loadMessages();
        loadUnreadCount();
      } else {
        loadUnreadCount();
      }
    }, 3000); // Cập nhật mỗi 3 giây

    return () => clearInterval(interval);
  }, [isOpen, selectedConversation, isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load unread count", error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      let data;
      
      if (isAdmin) {
        if (selectedConversation) {
          // Admin xem tin nhắn của một conversation cụ thể
          data = await messageService.getConversationMessages(selectedConversation.conversationId);
          setMessages(data || []);
        } else {
          // Admin xem danh sách conversations
          data = await messageService.getAllConversations();
          setConversations(data || []);
          setMessages([]);
        }
      } else {
        // User xem tin nhắn của mình với admin
        data = await messageService.getMyMessages();
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
      // Only show error if it's not a 401 (unauthorized) - that's handled by interceptor
      if (error?.response?.status !== 401) {
        console.warn("Could not load messages:", error?.response?.data?.message || error?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const receiverId = isAdmin && selectedConversation 
        ? selectedConversation.sender._id 
        : null;
      
      await messageService.sendMessage(newMessage, receiverId);
      setNewMessage("");
      // Reload messages after a short delay to ensure the message is saved
      setTimeout(() => {
        loadMessages();
        loadUnreadCount();
      }, 500);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Không thể gửi tin nhắn. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleConversationClick = (conv) => {
    setSelectedConversation(conv);
    setMessages([]);
  };

  const showConversationsList = isAdmin && !selectedConversation;

  return (
    <div className="chat-widget">
      <button 
        className="chat-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
        {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
      </button>
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>
              {showConversationsList 
                ? "Tin nhắn" 
                : isAdmin && selectedConversation 
                  ? selectedConversation.sender?.name 
                  : "Chat với Admin"}
            </h3>
            {isAdmin && selectedConversation && (
              <button onClick={() => {
                setSelectedConversation(null);
                setMessages([]);
              }}>←</button>
            )}
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          {showConversationsList ? (
            <div className="conversations-list">
              {loading && conversations.length === 0 ? (
                <div className="chat-loading">Đang tải...</div>
              ) : conversations.length === 0 ? (
                <div className="chat-loading">Chưa có tin nhắn nào</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => handleConversationClick(conv)}
                  >
                    <div className="conv-avatar">
                      {conv.sender?.avatar ? (
                        <img src={conv.sender.avatar} alt={conv.sender.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {conv.sender?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="conv-info">
                      <div className="conv-name">{conv.sender?.name || "Unknown"}</div>
                      <div className="conv-preview">
                        {conv.lastMessage?.content?.substring(0, 50)}
                        {conv.lastMessage?.content?.length > 50 ? "..." : ""}
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="conv-unread">{conv.unreadCount}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {loading && messages.length === 0 ? (
                  <div className="chat-loading">Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div className="chat-loading">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.sender._id === userInfo.user?._id || 
                                      (isAdmin && msg.isFromAdmin);
                    return (
                      <div key={msg._id} className={`message ${isMyMessage ? 'sent' : 'received'}`}>
                        <div className="message-avatar">
                          {msg.sender?.avatar ? (
                            <img src={msg.sender.avatar} alt={msg.sender.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {msg.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="message-content">
                          <div className="message-name">{msg.sender?.name}</div>
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="chat-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isAdmin && selectedConversation ? "Nhắn tin..." : "Nhắn tin cho admin..."}
                  disabled={isAdmin && !selectedConversation}
                />
                <button type="submit" disabled={!newMessage.trim() || (isAdmin && !selectedConversation)}>
                  Gửi
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

