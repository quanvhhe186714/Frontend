import React, { useEffect, useRef } from "react";
import "./messages.scss";

const AttachmentList = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="messages__attachments">
      {attachments.map((attachment, index) => (
        <a
          key={`${attachment.url}-${index}`}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="messages__attachment"
        >
          📎 {attachment.name || `Tệp ${index + 1}`}
        </a>
      ))}
    </div>
  );
};

const ChatWindow = ({ messages, loading, currentUserId, onLoadMore }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="messages__chat-window">
      <div className="messages__chat-header">
        <h3>Cuộc trò chuyện</h3>
        {onLoadMore && (
          <button
            type="button"
            className="messages__button messages__button--ghost"
            onClick={onLoadMore}
          >
            Tải thêm
          </button>
        )}
      </div>

      <div className="messages__chat-body">
        {loading ? (
          <div className="messages__placeholder">Đang tải tin nhắn...</div>
        ) : messages.length === 0 ? (
          <div className="messages__placeholder">
            Chưa có tin nhắn nào trong hội thoại này.
          </div>
        ) : (
          messages.map((message) => {
            const isMine =
              currentUserId &&
              (message.sender?._id === currentUserId ||
                message.sender?.id === currentUserId);

            return (
              <div
                key={message._id}
                className={`messages__bubble ${
                  isMine ? "messages__bubble--mine" : ""
                }`}
              >
                <div className="messages__bubble-header">
                  <span className="messages__bubble-sender">
                    {isMine
                      ? "Bạn"
                      : message.sender?.name || "Người dùng không xác định"}
                  </span>
                  <span className="messages__bubble-time">
                    {new Date(message.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {message.content && (
                  <div className="messages__bubble-content">
                    {message.content}
                  </div>
                )}
                <AttachmentList attachments={message.attachments} />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;

