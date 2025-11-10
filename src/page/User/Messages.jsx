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

  const loadThreads = useCallback(
    async (page = 1) => {
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
    },
    []
  );

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
        setMessagesPagination(payload?.pagination || { totalPages: 1 });
        setMessagesPage(page);

        await markThreadRead(threadKey);
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
      const response = await createThread(payload);
      const newThread = response.data?.data;
      await loadThreads(1);
      if (newThread?.threadKey) {
        setSelectedThread(newThread);
        await loadMessages(newThread.threadKey, 1, true);
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

  return (
    <div className="messages-page">
      <div className="messages__column">
        <div className="messages__threads-header">
          <h2>Trung tâm tin nhắn</h2>
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
      </div>

      <div className="messages__column">
        {selectedThread ? (
          <>
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
      </div>

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

