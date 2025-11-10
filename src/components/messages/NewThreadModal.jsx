import React, { useCallback, useEffect, useState } from "react";
import "./messages.scss";
import { fetchMessageUsers } from "../../services/message";

const createDefaultForm = () => ({
  type: "DIRECT",
  participantIds: [],
  clubId: "",
  eventId: "",
  content: "",
});

const NewThreadModal = ({ isOpen, onClose, onCreate, currentUserId }) => {
  const [form, setForm] = useState(createDefaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const loadUsers = useCallback(
    async (searchTerm = "") => {
      setUsersLoading(true);
      try {
        const response = await fetchMessageUsers({
          search: searchTerm,
          limit: 50,
        });
        setAvailableUsers(response.data?.data || []);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Không thể tải danh sách người dùng."
        );
      } finally {
        setUsersLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createDefaultForm());
    setError("");
    setUserSearch("");
    loadUsers();
  }, [isOpen, loadUsers]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "type") {
      setForm({
        type: value,
        participantIds: value === "DIRECT" ? [] : "",
        clubId: "",
        eventId: "",
        content: "",
      });
      setError("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelect = (event) => {
    const selected = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );

    setForm((prev) => ({
      ...prev,
      participantIds: selected,
    }));
  };

  const sanitizeParticipantIds = () => {
    if (Array.isArray(form.participantIds)) {
      return form.participantIds.filter(Boolean);
    }

    if (typeof form.participantIds === "string") {
      return form.participantIds
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }

    return [];
  };

  const buildParticipantsPayload = () => {
    switch (form.type) {
      case "DIRECT": {
        const ids = sanitizeParticipantIds().filter(
          (id) => id !== currentUserId
        );
        const uniqueIds = [...new Set(ids)];

        if (!currentUserId) {
          throw new Error("Không xác định được người dùng hiện tại.");
        }

        if (uniqueIds.length === 0) {
          throw new Error("Vui lòng chọn ít nhất một người nhận.");
        }

        const participants = [
          { userId: currentUserId },
          ...uniqueIds.map((id) => ({ userId: id })),
        ];

        return participants;
      }

      case "USER_CLUB": {
        if (!form.participantIds.trim() || !form.clubId.trim()) {
          throw new Error("Vui lòng nhập userId và clubId.");
        }
        return [
          { userId: form.participantIds.trim() },
          { clubId: form.clubId.trim() },
        ];
      }

      case "CLUB_BROADCAST": {
        if (!form.clubId.trim()) {
          throw new Error("Vui lòng nhập clubId.");
        }
        return [{ clubId: form.clubId.trim() }];
      }

      case "EVENT": {
        if (!form.eventId.trim()) {
          throw new Error("Vui lòng nhập eventId.");
        }
        return [{ eventId: form.eventId.trim() }];
      }

      default:
        return [];
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const participants = buildParticipantsPayload();
      await onCreate({
        type: form.type,
        participants,
        content: form.content.trim() || undefined,
      });

      setForm(createDefaultForm());
      onClose();
    } catch (err) {
      setError(err.message || "Không thể tạo hội thoại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderTypeFields = () => {
    switch (form.type) {
      case "DIRECT":
        return (
          <div className="messages__form-group">
            <label>Người nhận</label>
            <div className="messages__user-search">
              <input
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Nhập tên hoặc email người nhận"
              />
              <button
                type="button"
                className="messages__button messages__button--ghost"
                onClick={() => loadUsers(userSearch)}
                disabled={usersLoading}
              >
                {usersLoading ? "Đang tìm..." : "Tìm"}
              </button>
            </div>
            <select
              multiple
              name="participantIds"
              value={Array.isArray(form.participantIds) ? form.participantIds : []}
              onChange={handleUserSelect}
              size={6}
              disabled={usersLoading}
            >
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && !usersLoading && (
              <small>Không tìm thấy người dùng phù hợp.</small>
            )}
            {usersLoading && <small>Đang tải danh sách người dùng...</small>}
            <small>Giữ Ctrl/Cmd để chọn nhiều người nhận.</small>
          </div>
        );

      case "USER_CLUB":
        return (
          <>
            <div className="messages__form-group">
              <label>User ID</label>
              <input
                type="text"
                name="participantIds"
                value={form.participantIds}
                onChange={handleChange}
                required
              />
            </div>
            <div className="messages__form-group">
              <label>Club ID</label>
              <input
                type="text"
                name="clubId"
                value={form.clubId}
                onChange={handleChange}
                required
              />
            </div>
          </>
        );

      case "CLUB_BROADCAST":
        return (
          <div className="messages__form-group">
            <label>Club ID</label>
            <input
              type="text"
              name="clubId"
              value={form.clubId}
              onChange={handleChange}
              required
            />
          </div>
        );

      case "EVENT":
        return (
          <div className="messages__form-group">
            <label>Event ID</label>
            <input
              type="text"
              name="eventId"
              value={form.eventId}
              onChange={handleChange}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="messages__modal-backdrop">
      <div className="messages__modal">
        <div className="messages__modal-header">
          <h3>Tạo hội thoại mới</h3>
          <button
            type="button"
            className="messages__icon-button"
            onClick={() => {
              setForm(createDefaultForm());
              setError("");
              onClose();
            }}
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="messages__form-group">
            <label>Loại hội thoại</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="DIRECT">DIRECT</option>
              <option value="USER_CLUB">USER_CLUB</option>
              <option value="CLUB_BROADCAST">CLUB_BROADCAST</option>
              <option value="EVENT">EVENT</option>
            </select>
          </div>

          {renderTypeFields()}

          <div className="messages__form-group">
            <label>Tin nhắn đầu tiên (tuỳ chọn)</label>
            <textarea
              name="content"
              rows={3}
              value={form.content}
              onChange={handleChange}
              placeholder="Nội dung mở đầu cuộc trò chuyện"
            />
          </div>

          {error && <div className="messages__error">{error}</div>}

          <div className="messages__modal-actions">
            <button
              type="button"
              className="messages__button messages__button--ghost"
              onClick={() => {
                setForm(createDefaultForm());
                setError("");
                onClose();
              }}
              disabled={submitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="messages__button messages__button--primary"
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo hội thoại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewThreadModal;

