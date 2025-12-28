import React, { useState, useEffect, useRef } from "react";
import messageService from "../../services/message";
import { BASE_URL } from "../../services/apiService";
import { getAvatarUrl } from "../../utils/avatarHelper";
import "./ChatBox.scss";

const ChatBox = ({ isAdmin = false, selectedUserId = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    loadMessages();
    
    // Polling để cập nhật tin nhắn mới
    const interval = setInterval(() => {
      loadMessages();
    }, 3000); // Cập nhật mỗi 3 giây

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, isAdmin, selectedUserId]);

  // Đã xóa auto-scroll - user sẽ tự scroll thủ công
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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
    if (!newMessage.trim() && pendingFiles.length === 0) return;

    try {
      const receiverId = isAdmin && selectedConversation 
        ? selectedConversation.sender._id 
        : null;

      await messageService.sendMessage({
        content: newMessage.trim(),
        receiverId,
        attachments: pendingFiles
      });
      setNewMessage("");
      setPendingFiles([]);
      // Reload messages after a short delay to ensure the message is saved
      setTimeout(() => {
        loadMessages();
        // Chỉ scroll xuống khi user tự gửi tin nhắn
        setTimeout(() => {
          scrollToBottom();
        }, 100);
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

  const getAttachmentUrl = (url = "", isImage = false, originalName = "") => {
    // Với image, dùng URL trực tiếp để hiển thị
    if (isImage) {
      if (url.startsWith("http")) return url;
      return `${BASE_URL}${url}`;
    }
    
    // Với file, dùng endpoint download để đảm bảo extension được thêm vào
    const downloadUrl = `${BASE_URL}/files/download?fileUrl=${encodeURIComponent(url.startsWith("http") ? url : `${BASE_URL}${url}`)}${originalName ? `&filename=${encodeURIComponent(originalName)}` : ''}`;
    return downloadUrl;
  };

  const addFiles = (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const validated = [];
    list.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} vượt quá giới hạn 10MB và sẽ bị bỏ qua.`);
        return;
      }
      validated.push(file);
    });
    if (!validated.length) return;
    setPendingFiles((prev) => {
      const combined = [...prev, ...validated];
      if (combined.length > MAX_FILES) {
        alert(`Chỉ gửi tối đa ${MAX_FILES} tệp trong một tin nhắn.`);
      }
      return combined.slice(0, MAX_FILES);
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items || [];
    const files = [];
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length) {
      addFiles(files);
    }
  };

  const handleRemoveAttachment = (index) => {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
      return;
    }

    try {
      console.log("🗑️ Attempting to delete message:", messageId);
      const result = await messageService.deleteMessage(messageId);
      console.log("✅ Delete successful:", result);
      // Reload messages after deletion
      setTimeout(() => {
        loadMessages();
      }, 300);
    } catch (error) {
      console.error("❌ Failed to delete message:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Không thể xóa tin nhắn. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const showConversationsList = isAdmin && !selectedConversation;
  const canSend =
    (!!newMessage.trim() || pendingFiles.length > 0) &&
    !(isAdmin && !selectedConversation);

  return (
    <div className="chat-box-container">
      <div className="chat-box-header">
        <h3>
          {showConversationsList 
            ? "Tin nhắn hỗ trợ" 
            : isAdmin && selectedConversation 
              ? `Chat với ${selectedConversation.sender?.name}` 
              : "Chat với chủ shop"}
        </h3>
        {isAdmin && selectedConversation && (
          <button 
            className="back-btn"
            onClick={() => {
              setSelectedConversation(null);
              setMessages([]);
            }}
          >
            ← Quay lại
          </button>
        )}
      </div>
      
      {showConversationsList ? (
        <div className="conversations-panel">
          {loading && conversations.length === 0 ? (
            <div className="chat-loading">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="chat-empty">Chưa có tin nhắn nào</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversationId}
                className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => handleConversationClick(conv)}
              >
                <div className="conv-avatar">
                  {getAvatarUrl(conv.sender?.avatar) ? (
                    <>
                      <img 
                        src={getAvatarUrl(conv.sender.avatar)} 
                        alt={conv.sender.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                      <div className="avatar-placeholder" style={{ display: 'none' }}>
                        {conv.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="avatar-placeholder">
                      {conv.sender?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-name">{conv.sender?.name || "Unknown"}</div>
                  <div className="conv-preview">
                    {conv.lastMessage?.content?.substring(0, 60)}
                    {conv.lastMessage?.content?.length > 60 ? "..." : ""}
                  </div>
                  <div className="conv-time">
                    {new Date(conv.lastMessageTime).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
          <div className="chat-messages-panel">
            {loading && messages.length === 0 ? (
              <div className="chat-loading">Đang tải tin nhắn...</div>
            ) : messages.length === 0 ? (
              <div className="chat-empty">
                <p>Chưa có tin nhắn nào.</p>
                <p>Hãy bắt đầu cuộc trò chuyện với chủ shop!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMyMessage = msg.sender._id === userInfo.user?._id || 
                                  (isAdmin && msg.isFromAdmin);
                return (
                  <div key={msg._id} className={`message ${isMyMessage ? 'sent' : 'received'}`}>
                    <div className="message-avatar">
                      {getAvatarUrl(msg.sender?.avatar) ? (
                        <>
                          <img 
                            src={getAvatarUrl(msg.sender.avatar)} 
                            alt={msg.sender.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                          <div className="avatar-placeholder" style={{ display: 'none' }}>
                            {msg.sender?.name?.charAt(0).toUpperCase()}
                          </div>
                        </>
                      ) : (
                        <div className="avatar-placeholder">
                          {msg.sender?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-name">
                          {msg.sender?.name}
                          {msg.isFake && (
                            <span
                              style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                backgroundColor: '#ffc107',
                                color: '#000',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                              title="Tin nhắn ảo"
                            >
                              ẢO
                            </span>
                          )}
                        </span>
                        <div className="message-header-right">
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleString('vi-VN', { 
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isAdmin && (
                            <button
                              className="message-delete-btn"
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Xóa tin nhắn"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      {msg.content && (
                        <div className="message-text">{msg.content}</div>
                      )}
                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <div className="message-attachments">
                          {msg.attachments.map((att) => (
                            <div key={att.url} className="message-attachment">
                              {att.type === "image" ? (
                                <a
                                  href={getAttachmentUrl(att.url, true)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img src={getAttachmentUrl(att.url, true)} alt={att.originalName} />
                                </a>
                              ) : (
                                <a
                                  href={getAttachmentUrl(att.url, false, att.originalName)}
                                  download={att.originalName}
                                >
                                  📎 {att.originalName}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input-panel" onSubmit={sendMessage}>
            <div className="chat-input-toolbar">
              <button
                type="button"
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAdmin && !selectedConversation}
              >
                📎 Gửi file
              </button>
              <span className="chat-input-hint">Ctrl+V để dán ảnh/file</span>
            </div>
            {pendingFiles.length > 0 && (
              <div className="chat-attachments">
                {pendingFiles.map((file, idx) => (
                  <div className="chat-attachment" key={`${file.name}-${idx}`}>
                    <span>{file.name}</span>
                    <button type="button" onClick={() => handleRemoveAttachment(idx)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder={isAdmin && selectedConversation ? "Nhắn tin cho khách hàng..." : "Nhắn tin cho chủ shop..."}
              disabled={isAdmin && !selectedConversation}
              rows={2}
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            />
            <button 
              type="submit" 
              disabled={!canSend}
              className="send-btn"
            >
              Gửi
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;

