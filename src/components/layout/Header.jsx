import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatarHelper";
import "../layoutcss/_header.scss";

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

  useEffect(() => {
    try {
      setUserInfo(JSON.parse(localStorage.getItem("userInfo")));
    } catch {
      setUserInfo(null);
    }
    setOpenMenu(false);
  }, [location]);

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="logo">
          <Link to="/">ShopNamBS</Link>
        </h1>

        <nav className="nav-links">
          <Link to="/san-pham">Sản phẩm</Link>
          <Link to="/dich-vu">Dịch vụ</Link>
          <Link to="/ho-tro">Hỗ trợ</Link>
          <Link to="/chia-se">Chia sẻ</Link>
          <Link to="/cong-cu">Công cụ</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/products">Premium</Link>
          <Link to="/cart">Cart</Link>
          
          {userInfo ? (
            <div className="user-menu">
              <button
                className="avatar-button"
                onClick={() => setOpenMenu((v) => !v)}
              >
                {getAvatarUrl(userInfo.user?.avatar) ? (
                  <img
                    src={getAvatarUrl(userInfo.user?.avatar)}
                    alt="avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!getAvatarUrl(userInfo.user?.avatar) && (
                  <div className="avatar-placeholder">
                    {userInfo.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>{userInfo.user?.name}</span>
              </button>
              
              {openMenu && (
                <div className="dropdown">
                  <button onClick={() => navigate("/profile")}>My Profile</button>
                  {userInfo.user?.role === "admin" && (
                    <button onClick={() => navigate("/admin")}>Admin Dashboard</button>
                  )}
                  <button onClick={handleLogout} className="logout">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
