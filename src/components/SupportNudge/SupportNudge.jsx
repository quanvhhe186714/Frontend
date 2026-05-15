import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SupportNudge.scss";

const SUPPORT_NUDGE_INTERVAL = 30 * 60 * 1000;
const LAST_SHOWN_KEY = "supportNudgeLastShownAt";

const SupportNudge = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const scheduleNextNudge = () => {
      const lastShownAt = Number(sessionStorage.getItem(LAST_SHOWN_KEY) || 0);
      const elapsed = lastShownAt ? Date.now() - lastShownAt : 0;
      const delay = lastShownAt
        ? Math.max(SUPPORT_NUDGE_INTERVAL - elapsed, 0)
        : SUPPORT_NUDGE_INTERVAL;

      timeoutRef.current = window.setTimeout(() => {
        setVisible(true);
        sessionStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      }, delay);
    };

    scheduleNextNudge();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const closeNudge = () => {
    setVisible(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    }, SUPPORT_NUDGE_INTERVAL);
  };

  const openSupport = () => {
    closeNudge();
    navigate("/ho-tro");
  };

  if (!visible) return null;

  return (
    <div className="support-nudge" role="dialog" aria-modal="false" aria-label="Gợi ý hỗ trợ">
      <div className="support-nudge__card">
        <button
          className="support-nudge__close"
          type="button"
          onClick={closeNudge}
          aria-label="Đóng gợi ý hỗ trợ"
        >
          x
        </button>

        <button className="support-nudge__avatar" type="button" onClick={openSupport}>
          {!imageFailed ? (
            <img
              src="/support-assistant.svg"
              alt="Trợ lý hỗ trợ"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span aria-hidden="true">AI</span>
          )}
        </button>

        <div className="support-nudge__message">Bạn iu cần tớ hỗ trợ gì?</div>

        <div className="support-nudge__actions">
          <button type="button" onClick={openSupport}>
            Cần hỗ trợ
          </button>
          <button type="button" onClick={closeNudge}>
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportNudge;
