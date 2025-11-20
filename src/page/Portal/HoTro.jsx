import React, { useState, useEffect } from "react";
import ChatBox from "../../components/Chat/ChatBox";
import "./portal.scss";

const HoTro = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo"));
      setUserInfo(info);
      setIsAdmin(info?.user?.role === "admin");
    } catch {
      setUserInfo(null);
      setIsAdmin(false);
    }
  }, []);

  return (
    <div className="portal-page">
      <div className="portal-hero">
        <h2>Hỗ trợ</h2>
        <div>Trung tâm trợ giúp và liên hệ</div>
      </div>

      <div className="support-content">
        <div className="support-info">
          <h3>Thông tin liên hệ</h3>
          <ul>
            <li>📧 Email: nambansao@gmail.com</li>
            <li>💬 Telegram: @nambansao</li>
            <li>🕐 Giờ làm việc: 08:00 - 22:00 (Hàng ngày)</li>
            <li>⚡ Phản hồi nhanh trong vòng 5-15 phút</li>
          </ul>
          
          <div className="support-note">
            <p><strong>💡 Lưu ý:</strong></p>
            <p>Bạn có thể chat trực tiếp với chủ shop qua box chat bên cạnh để được hỗ trợ nhanh nhất!</p>
          </div>
        </div>

        <div className="support-chat">
          {userInfo ? (
            <ChatBox isAdmin={isAdmin} />
          ) : (
            <div className="chat-login-prompt">
              <h3>Đăng nhập để chat với chủ shop</h3>
              <p>Vui lòng đăng nhập để sử dụng tính năng chat hỗ trợ</p>
              <button onClick={() => window.location.href = "/login"}>
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HoTro;


