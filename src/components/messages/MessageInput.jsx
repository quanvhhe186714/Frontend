import React, { useMemo, useState } from "react";
import "./messages.scss";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MessageInput = ({ onSend, disabled }) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() && files.length === 0) {
      return;
    }

    const attachments = files.map((item) => ({
      url: item.base64,
      name: item.file.name,
      size: item.file.size,
    }));

    await onSend({
      content: content.trim(),
      attachments,
    });

    setContent("");
    setFiles([]);
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      const processed = await Promise.all(
        selectedFiles.map(async (file) => ({
          file,
          base64: await toBase64(file),
        }))
      );

      setFiles((prev) => [...prev, ...processed]);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const isSendDisabled = useMemo(
    () => disabled || isUploading || (!content.trim() && files.length === 0),
    [disabled, isUploading, content, files.length]
  );

  return (
    <form className="messages__input" onSubmit={handleSubmit}>
      <textarea
        placeholder="Nhập tin nhắn..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        disabled={disabled}
      />

      {files.length > 0 && (
        <div className="messages__attachments-preview">
          {files.map(({ file }, index) => (
            <div key={file.name + index} className="messages__attachment-chip">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="messages__icon-button"
                disabled={disabled}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="messages__input-actions">
        <label className="messages__button messages__button--ghost">
          📎 Đính kèm
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={disabled}
            style={{ display: "none" }}
          />
        </label>

        <div className="messages__input-status">
          {isUploading && <span>Đang xử lý tệp...</span>}
        </div>

        <button
          type="submit"
          className="messages__button messages__button--primary"
          disabled={isSendDisabled}
        >
          Gửi
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

