import React, { useCallback, useEffect, useMemo, useState } from "react";
import ThreadsList from "../../components/messages/ThreadsList";
import ChatWindow from "../../components/messages/ChatWindow";
import MessageInput from "../../components/messages/MessageInput";
import NewThreadModal from "../../components/messages/NewThreadModal";
import {
  fetchThreads,
  createThread,
  fetchThreadMessages,
  sendThreadMessage,
  markThreadRead,
  pinThread,
  unpinThread,
} from "../../services/message";
import "../../components/messages/messages.scss";

const THREAD_LIMIT = 20;
const MESSAGE_LIMIT = 20;

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "";
  }
};

const buildConversationHeader = (thread, currentUserId) => {
  if (!thread) {
    return { title: "", meta: "" };
  }

  const participants = thread.participants || [];
  const otherUsers = participants
    .filter(
      (participant) =>
        participant.user &&
        currentUserId &&
        participant.user &&
        (participant.user._id || participant.user.id) !== currentUserId
    )
    .map((participant) => participant.user?.name || "Người dùng");

  let title = "";

  switch (thread.type) {
    case "DIRECT": {
      const names =
        otherUsers.length > 0
          ? otherUsers.join(", ")
          : participants
              .filter((participant) => participant.user)
              .map((participant) => participant.user?.name || "Người dùng")
              .join(", ");
      title = names ? `với ${names}` : "trực tiếp";
      break;
    }
    case "USER_CLUB": {
      const clubName =
        participants.find((participant) => participant.club)?.club?.name || "";
      title = clubName ? `với CLB ${clubName}` : "giữa người dùng và CLB";
      break;
    }
    case "CLUB_BROADCAST": {
      const clubName =
        participants.find((participant) => participant.club)?.club?.name || "";
      title = clubName ? `từ CLB ${clubName}` : "từ câu lạc bộ";
      break;
    }
    case "EVENT": {
      const eventTitle =
        participants.find((participant) => participant.event)?.event?.title ||
        "";
      title = eventTitle ? `về sự kiện ${eventTitle}` : "về sự kiện";
      break;
    }
    default:
      title = "";
  }

  const time =
    thread.lastMessage?.createdAt ||
    thread.updatedAt ||
    thread.createdAt ||
    null;

  const meta = [thread.type, formatDateTime(time)].filter(Boolean).join(" • ");

  return {
    title,
    meta,
  };
};

const Messages = () => {
  const [threads, setThreads] = useState([]);
  const [threadsPage, setThreadsPage] = useState(1);
  const [threadsPagination, setThreadsPagination] = useState({
    totalPages: 1,
  });
  const [threadsLoading, setThreadsLoading] = useState(false);

  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPagination, setMessagesPagination] = useState({
    totalPages: 1,
  });
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  const currentUserId =
    userInfo?.user?._id || userInfo?.user?.id || userInfo?.user?.userId;

  const loadThreads = useCallback(async (page = 1) => {
    setThreadsLoading(true);
    setError("");
    try {
      const response = await fetchThreads({ page, limit: THREAD_LIMIT });
      const payload = response.data?.data;
      setThreads(payload?.items || []);
      setThreadsPagination(payload?.pagination || { totalPages: 1 });
      setThreadsPage(page);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Không thể tải danh sách hội thoại."
      );
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (threadKey, page = 1, replace = true) => {
      setMessagesLoading(true);
      setError("");
      try {
        const response = await fetchThreadMessages(threadKey, {
          page,
          limit: MESSAGE_LIMIT,
        });
        const payload = response.data?.data;
        const items = payload?.items || [];
        const normalized = [...items].reverse(); // oldest -> newest

        setMessages((prev) =>
          replace ? normalized : [...normalized, ...prev]
        );
        setMessagesPagination(
          payload?.pagination || { totalPages: 1, page, limit: MESSAGE_LIMIT }
        );
        setMessagesPage(page);

        try {
          await markThreadRead(threadKey);
        } catch (markError) {
          // Giữ lịch sử tin nhắn hiển thị ngay cả khi đánh dấu đã đọc thất bại
          console.warn("Không thể đánh dấu đã đọc:", markError);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Không thể tải tin nhắn."
        );
      } finally {
        setMessagesLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadThreads(1);
  }, [loadThreads]);

  const handleSelectThread = useCallback(
    (thread) => {
      setSelectedThread(thread);
      setMessages([]);
      setMessagesPage(1);
      loadMessages(thread.threadKey, 1, true);
    },
    [loadMessages]
  );

  const handleSendMessage = useCallback(
    async ({ content, attachments }) => {
      if (!selectedThread) {
        return;
      }

      setSending(true);
      setError("");
      try {
        await sendThreadMessage(selectedThread.threadKey, {
          content: content || undefined,
          attachments: attachments?.length ? attachments : undefined,
        });

        await Promise.all([
          loadMessages(selectedThread.threadKey, 1, true),
          loadThreads(threadsPage),
        ]);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Không thể gửi tin nhắn."
        );
      } finally {
        setSending(false);
      }
    },
    [selectedThread, loadMessages, loadThreads, threadsPage]
  );

  const handleCreateThread = useCallback(
    async (payload) => {
      setError("");
      try {
        const response = await createThread(payload);
        const newThread = response.data?.data;
        await loadThreads(1);
        if (newThread?.threadKey) {
          setSelectedThread(newThread);
          setMessages(newThread?.lastMessage ? [newThread.lastMessage] : []);
          setMessagesPage(1);
          setMessagesPagination({
            totalPages: 1,
            page: 1,
            limit: MESSAGE_LIMIT,
            total: newThread?.lastMessage ? 1 : 0,
          });
          await loadMessages(newThread.threadKey, 1, true);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Không thể tạo hội thoại."
        );
      }
    },
    [loadMessages, loadThreads]
  );

  const handleTogglePin = useCallback(
    async (thread) => {
      try {
        if (thread.meta?.isPinned) {
          await unpinThread(thread.threadKey);
        } else {
          await pinThread(thread.threadKey);
        }
        await loadThreads(threadsPage);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Không thể cập nhật trạng thái ghim."
        );
      }
    },
    [loadThreads, threadsPage]
  );

  useEffect(() => {
    if (!selectedThread) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadThreads(threadsPage);
      loadMessages(selectedThread.threadKey, 1, true);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [selectedThread, loadThreads, loadMessages, threadsPage]);

  const handleLoadMoreMessages = useCallback(() => {
    if (
      !selectedThread ||
      messagesPage >= (messagesPagination?.totalPages || 1)
    ) {
      return;
    }

    const nextPage = messagesPage + 1;
    loadMessages(selectedThread.threadKey, nextPage, false);
  }, [
    selectedThread,
    messagesPage,
    messagesPagination?.totalPages,
    loadMessages,
  ]);

  const conversationHeader = useMemo(
    () => buildConversationHeader(selectedThread, currentUserId),
    [selectedThread, currentUserId]
  );

  useEffect(() => {
    if (!selectedThread && threads.length > 0) {
      handleSelectThread(threads[0]);
    }
  }, [threads, selectedThread, handleSelectThread]);

  return (
    <div className="messages-page">
      <aside className="messages__sidebar">
        <div className="messages__threads-header">
          <div>
            <h2>Trung tâm tin nhắn</h2>
            <p className="messages__subtitle">Lịch sử trò chuyện của bạn</p>
          </div>
          <button
            type="button"
            className="messages__button messages__button--primary"
            onClick={() => setShowNewThread(true)}
          >
            + Hội thoại mới
          </button>
        </div>

        {error && (
          <div className="messages__placeholder" style={{ color: "#ff3d71" }}>
            {error}
          </div>
        )}

        <ThreadsList
          threads={threads}
          selectedThreadKey={selectedThread?.threadKey}
          onSelect={handleSelectThread}
          onRefresh={() => loadThreads(threadsPage)}
          loading={threadsLoading}
          currentUserId={currentUserId}
          onTogglePin={handleTogglePin}
        />
      </aside>

      <main className="messages__chat-column">
        {selectedThread ? (
          <>
            <div className="messages__chat-heading">
              <div className="messages__chat-heading-text">
                <span className="messages__chat-label">Cuộc trò chuyện</span>
                <h2>
                  {conversationHeader.title
                    ? conversationHeader.title
                    : "Trực tiếp"}
                </h2>
                {conversationHeader.meta && (
                  <span className="messages__chat-meta">
                    {conversationHeader.meta}
                  </span>
                )}
              </div>
            </div>

            <ChatWindow
              messages={messages}
              loading={messagesLoading}
              currentUserId={currentUserId}
              onLoadMore={
                messagesPage < (messagesPagination?.totalPages || 1)
                  ? handleLoadMoreMessages
                  : undefined
              }
            />
            <MessageInput onSend={handleSendMessage} disabled={sending} />
          </>
        ) : (
          <div className="messages__placeholder">
            Hãy chọn một hội thoại để bắt đầu trò chuyện.
          </div>
        )}
      </main>

      <aside className="messages__info-column">
        {selectedThread ? (
          <div className="messages__info-content">
            <h3>Thông tin hội thoại</h3>
            <div className="messages__info-item">
              <span>Loại hội thoại</span>
              <strong>{selectedThread.type}</strong>
            </div>
            <div className="messages__info-item">
              <span>Tin nhắn đã trao đổi</span>
              <strong>{selectedThread.messageCount || messages.length}</strong>
            </div>
            <div className="messages__info-item">
              <span>Trạng thái ghim</span>
              <strong>{selectedThread.meta?.isPinned ? "Đang ghim" : "Không"}</strong>
            </div>

            <div className="messages__participants-section">
              <span className="messages__participants-title">
                Thành viên tham gia
              </span>
              <ul>
                {(selectedThread.participants || []).map((participant) => {
                  if (participant.user) {
                    return (
                      <li key={`user-${participant.user._id || participant.user.id}`}>
                        👤 {participant.user.name}
                      </li>
                    );
                  }
                  if (participant.club) {
                    return (
                      <li key={`club-${participant.club._id || participant.club.id}`}>
                        🏛️ {participant.club.name}
                      </li>
                    );
                  }
                  if (participant.event) {
                    return (
                      <li
                        key={`event-${participant.event._id || participant.event.id}`}
                      >
                        🎉 {participant.event.title}
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="messages__placeholder">
            Thông tin hội thoại sẽ hiển thị tại đây.
          </div>
        )}
      </aside>

      <NewThreadModal
        isOpen={showNewThread}
        onClose={() => setShowNewThread(false)}
        onCreate={handleCreateThread}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default Messages;

