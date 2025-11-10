import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../layoutcss/_header.scss";
import NotificationBell from "../Notification/NotificationBell";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(
    () => JSON.parse(localStorage.getItem("userInfo"))
  );
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // Cập nhật userInfo khi đổi route hoặc có event từ tab khác
  useEffect(() => {
    try {
      setUserInfo(JSON.parse(localStorage.getItem("userInfo")));
    } catch {
      setUserInfo(null);
    }
    // đóng menu khi chuyển trang
    setOpenMenu(false);
  }, [location]);
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userInfo") {
        try {
          setUserInfo(JSON.parse(e.newValue));
        } catch {
          setUserInfo(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="logo">
          <Link to="/">FPT Clubs</Link>
        </h1>

        <nav className="nav-links" style={{ overflow: "visible" }}>
          <Link to="/event">Sự kiện</Link>
          <Link to="/club">Câu lạc bộ</Link>
          {userInfo ? (
            <>
              <Link to="/messages">Tin nhắn</Link>
              <Link to="/manager/clubs">CLB của tôi</Link>
              {userInfo.user?.role === "manager" && (
                <>
                  <Link to="/manager/requests">Quản lý yêu cầu</Link>
                </>
              )}
              {userInfo.user?.role === "admin" && (
                <Link to="/admin">Quản trị</Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center' }}> 
                  <NotificationBell /> 
              </div>
              
              <div className="user-menu" style={{ position: "relative" }}>
                <button
                  className="avatar-button"
                  onClick={() => setOpenMenu((v) => !v)}
                  aria-label="user-menu"
                >
                  <img
                    src={userInfo.user?.avatar || "/default-avatar.png"}
                    alt="avatar"
                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                  />
                </button>
                {openMenu && (
                  <div
                    className="dropdown"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: 8,
                      minWidth: 180,
                      zIndex: 1000,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      overflow: "visible",
                    }}
                  >
                    <button onClick={() => { setOpenMenu(false); navigate("/profile"); }} className="dropdown-item" style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", color: "#222" }}>
                      Hồ sơ
                    </button>
                    <button onClick={() => { setOpenMenu(false); navigate("/change-password"); }} className="dropdown-item" style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", color: "#222" }}>
                      Đổi mật khẩu
                    </button>
                    <button onClick={() => { setOpenMenu(false); handleLogout(); }} className="dropdown-item" style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", cursor: "pointer", color: "#d9534f" }}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
