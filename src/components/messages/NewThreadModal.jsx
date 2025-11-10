import React, { useState } from "react";
import "./messages.scss";

const DEFAULT_FORM = {
  type: "DIRECT",
  participantIds: "",
  clubId: "",
  eventId: "",
  content: "",
};

const NewThreadModal = ({ isOpen, onClose, onCreate, currentUserId }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildParticipantsPayload = () => {
    switch (form.type) {
      case "DIRECT": {
        const ids = form.participantIds
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

        if (!currentUserId) {
          throw new Error("Không xác định được người dùng hiện tại.");
        }

        if (ids.length === 0) {
          throw new Error("Vui lòng nhập ít nhất một userId.");
        }

        const participants = [
          { userId: currentUserId },
          ...ids.map((id) => ({ userId: id })),
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

      setForm(DEFAULT_FORM);
      onClose();
    } catch (err) {
      setError(err.message || "Không thể tạo hội thoại.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTypeFields = () => {
    switch (form.type) {
      case "DIRECT":
        return (
          <div className="messages__form-group">
            <label>User ID (cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              name="participantIds"
              value={form.participantIds}
              onChange={handleChange}
              placeholder="vd: 65f1a..., 65f1b..."
              required
            />
            <small>
              Hệ thống tự động thêm bạn vào participants, chỉ cần nhập người nhận.
            </small>
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
              setForm(DEFAULT_FORM);
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
                setForm(DEFAULT_FORM);
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

