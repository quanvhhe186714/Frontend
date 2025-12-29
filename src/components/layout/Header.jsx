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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/san-pham" onClick={() => setMobileMenuOpen(false)}>Sản phẩm</Link>
          <Link to="/dich-vu" onClick={() => setMobileMenuOpen(false)}>Dịch vụ</Link>
          <Link to="/ho-tro" onClick={() => setMobileMenuOpen(false)}>Hỗ trợ</Link>
          <Link to="/chia-se" onClick={() => setMobileMenuOpen(false)}>Chia sẻ</Link>
          <Link to="/faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
          {userInfo && (
            <Link to="/qr-payment" onClick={() => setMobileMenuOpen(false)}>
              Thanh toán QR
            </Link>
          )}
          
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
                  <button onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}>My Profile</button>
                  {userInfo.user?.role === "admin" && (
                    <button onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}>Admin Dashboard</button>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="logout">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
