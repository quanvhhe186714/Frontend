import React from "react";
import "./messages.scss";

const getParticipantLabel = (participant, currentUserId) => {
  if (participant.user) {
    if (
      currentUserId &&
      (participant.user._id === currentUserId ||
        participant.user.id === currentUserId)
    ) {
      return null;
    }
    return participant.user.name || "Người dùng";
  }

  if (participant.club) {
    return `CLB: ${participant.club.name}`;
  }

  if (participant.event) {
    return `Sự kiện: ${participant.event.title}`;
  }

  return null;
};

const buildThreadTitle = (thread, currentUserId) => {
  const labels =
    thread?.participants
      ?.map((participant) => getParticipantLabel(participant, currentUserId))
      .filter(Boolean) || [];

  if (labels.length > 0) {
    return labels.join(", ");
  }

  if (thread?.type === "CLUB_BROADCAST") {
    return "Thông báo từ câu lạc bộ";
  }

  if (thread?.type === "EVENT") {
    return "Trao đổi sự kiện";
  }

  return "Cuộc trò chuyện";
};

const ThreadsList = ({
  threads,
  selectedThreadKey,
  onSelect,
  onRefresh,
  loading,
  currentUserId,
  onTogglePin,
}) => {
  return (
    <div className="messages__threads">
      <div className="messages__threads-header">
        <h3>Hội thoại</h3>
        <button
          type="button"
          className="messages__button messages__button--ghost"
          onClick={onRefresh}
          disabled={loading}
        >
          ↻
        </button>
      </div>

      {loading ? (
        <div className="messages__placeholder">Đang tải danh sách...</div>
      ) : threads.length === 0 ? (
        <div className="messages__placeholder">Chưa có hội thoại nào.</div>
      ) : (
        <ul className="messages__threads-list">
          {threads.map((thread) => {
            const isActive = thread.threadKey === selectedThreadKey;
            const unread = Number(thread.unreadCount || 0);
            const isPinned = Boolean(thread.meta?.isPinned);
            const lastMessagePreview = thread.lastMessage
              ? thread.lastMessage.content ||
                (thread.lastMessage.attachments?.length > 0
                  ? `${thread.lastMessage.attachments.length} file đính kèm`
                  : "")
              : "";

            return (
              <li
                key={thread.threadKey}
                className={`messages__thread-item${
                  isActive ? " messages__thread-item--active" : ""
                }${isPinned ? " messages__thread-item--pinned" : ""}`}
                onClick={() => onSelect(thread)}
              >
                <div className="messages__thread-top">
                  <span className="messages__thread-title">
                    {buildThreadTitle(thread, currentUserId)}
                  </span>
                  <div className="messages__thread-actions">
                    {isPinned && <span className="messages__badge">📌</span>}
                    <button
                      type="button"
                      className="messages__icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(thread);
                      }}
                      title={isPinned ? "Bỏ ghim" : "Ghim hội thoại"}
                    >
                      {isPinned ? "Unpin" : "Pin"}
                    </button>
                  </div>
                </div>
                <div className="messages__thread-meta">
                  <span className="messages__thread-type">{thread.type}</span>
                  {thread.lastMessage?.createdAt && (
                    <span className="messages__thread-time">
                      {new Date(thread.lastMessage.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  )}
                </div>
                {lastMessagePreview && (
                  <p className="messages__thread-preview">{lastMessagePreview}</p>
                )}
                {unread > 0 && (
                  <span className="messages__badge messages__badge--primary">
                    {unread}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ThreadsList;

