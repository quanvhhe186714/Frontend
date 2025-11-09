import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student-home.scss";

const StudentHome = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const menuItems = [
    { title: "Hồ sơ", onClick: () => navigate("/profile") },
    { title: "Đổi mật khẩu", onClick: () => navigate("/change-password") },
    { title: "Đăng xuất", onClick: handleLogout },
  ];

  return (
    <div className="student-home">
      {/* Header */}
      <header className="student-header">
        <h1>Student Dashboard</h1>
        <div className="header-right">
          <div
            className="avatar"
            onClick={() => setMenuOpen(!menuOpen)}
            title={userInfo?.user?.name}
          >
            {userInfo?.user?.avatar ? (
              <img src={userInfo.user.avatar} alt="avatar" />
            ) : (
              userInfo?.user?.name?.charAt(0)
            )}
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
      </header>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-box">
          <h2>Chào mừng, {userInfo?.user?.name}!</h2>
          <p>Bạn đang đăng nhập với vai trò Student</p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="info-section">
        <div className="info-card">
          <h3>Thông tin cá nhân</h3>
          <p>Email: {userInfo?.user?.email}</p>
          <p>Vai trò: {userInfo?.user?.role}</p>
        </div>

        <div className="info-card">
          <h3>Hồ sơ</h3>
          <p>Xem và chỉnh sửa thông tin cá nhân của bạn.</p>
          <button onClick={() => navigate("/profile")} className="primary-btn">
            Xem hồ sơ
          </button>
        </div>

        <div className="info-card">
          <h3>Đổi mật khẩu</h3>
          <p>Bảo vệ tài khoản của bạn bằng mật khẩu mới.</p>
          <button
            onClick={() => navigate("/change-password")}
            className="outline-btn"
          >
            Đổi mật khẩu
          </button>
        </div>
      </section>
    </div>
  );
};

export default StudentHome;
