import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../../utils/avatarHelper";
import "../layoutcss/_header.scss";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  });
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    closeMobileMenu();
    navigate("/login");
  };

  useEffect(() => {
    try {
      setUserInfo(JSON.parse(localStorage.getItem("userInfo")));
    } catch {
      setUserInfo(null);
    }
    setOpenMenu(false);
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="logo">
          <Link to="/">WEB BUFF MXH</Link>
        </h1>

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link to="/san-pham" onClick={closeMobileMenu}>Sản phẩm</Link>
          <Link to="/dich-vu" onClick={closeMobileMenu}>Dịch vụ</Link>
          <Link to="/ho-tro" onClick={closeMobileMenu}>Hỗ trợ</Link>
          <Link to="/tai-khoan-mang" onClick={closeMobileMenu}>TK mạng</Link>
          <Link to="/ai-tools" onClick={closeMobileMenu}>AI Tools</Link>
          <Link to="/vpn-vps" onClick={closeMobileMenu}>VPN/VPS</Link>
          <Link to="/cart" onClick={closeMobileMenu}>Cart</Link>
          {userInfo && (
            <Link to="/qr-payment" onClick={closeMobileMenu}>
              Thanh toán QR
            </Link>
          )}

          {userInfo ? (
            <div className="user-menu">
              <button
                className="avatar-button"
                type="button"
                onClick={() => setOpenMenu((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={openMenu}
              >
                {getAvatarUrl(userInfo.user?.avatar) ? (
                  <img
                    src={getAvatarUrl(userInfo.user?.avatar)}
                    alt="avatar"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const placeholder = e.target.parentElement.querySelector(".avatar-placeholder");
                      if (placeholder) placeholder.style.display = "flex";
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
                <div className="dropdown" role="menu">
                  <button type="button" onClick={() => { navigate("/profile"); closeMobileMenu(); }}>
                    My Profile
                  </button>
                  {userInfo.user?.role === "admin" && (
                    <button type="button" onClick={() => { navigate("/admin"); closeMobileMenu(); }}>
                      Admin Dashboard
                    </button>
                  )}
                  <button type="button" onClick={handleLogout} className="logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="btn-register" onClick={closeMobileMenu}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
