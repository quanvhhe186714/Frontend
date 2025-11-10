import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../layoutcss/_header.scss";

const Header = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="logo">
          <Link to="/">FPT Clubs</Link>
        </h1>

        <nav className="nav-links">
          <Link to="/event">Sự kiện</Link>
          <Link to="/club">Câu lạc bộ</Link>
          {userInfo ? (
            <>
              <Link to="/profile">Hồ sơ</Link>
              <Link to="/messages">Tin nhắn</Link>
              {userInfo.user?.role === "manager" && (
                <Link to="/manager/requests">Quản lý yêu cầu</Link>
              )}
              {userInfo.user?.role === "admin" && (
                <Link to="/admin">Quản trị</Link>
              )}
              <button className="btn-logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
