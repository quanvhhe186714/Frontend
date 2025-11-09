import React from "react";
import { useNavigate } from "react-router-dom";
import "./student-home.scss";

const StudentHome = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <div className="student-home">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-box">
          <h2>Chào mừng, {userInfo?.user?.name || "Sinh viên"}!</h2>
          <p>Bạn đang đăng nhập với vai trò <strong>Student</strong></p>
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
