import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.scss";

const Home = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const menuItems = [
    { title: "Hồ sơ của tôi", onClick: () => navigate("/profile") },
    { title: "Đổi mật khẩu", onClick: () => navigate("/change-password") },
    { title: "Đăng xuất", onClick: handleLogout },
  ];

  const quickActions = [
    {
      title: "Xem hồ sơ",
      description: "Xem và cập nhật thông tin cá nhân",
      icon: "👤",
      onClick: () => navigate("/profile"),
    },
    {
      title: "Đổi mật khẩu",
      description: "Cập nhật mật khẩu tài khoản",
      icon: "🔒",
      onClick: () => navigate("/change-password"),
    },
  ];

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <h1>
          {userInfo?.user?.role === "admin"
            ? "Admin Dashboard"
            : "Student Dashboard"}
        </h1>

        <div className="header-actions">
          <button className="notif-btn">🔔</button>

          <div className="user-menu">
            <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {userInfo?.user?.name?.charAt(0) || "U"}
            </div>

            {menuOpen && (
              <div className="dropdown-menu">
                {menuItems.map((item, i) => (
                  <div
                    key={i}
                    className="dropdown-item"
                    onClick={() => {
                      item.onClick();
                      setMenuOpen(false);
                    }}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-card">
          <div className="avatar-large">
            {userInfo?.user?.name?.charAt(0) || "U"}
          </div>
          <h2>Chào mừng, {userInfo?.user?.name || "Người dùng"}!</h2>
          <p>
            {userInfo?.user?.role === "admin" ? "Quản trị viên" : "Sinh viên"}
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={action.onClick}>
              <div className="action-icon">{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <button className="detail-btn">Chi tiết</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
