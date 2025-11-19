import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
          <Link to="/">TelePremium</Link>
        </h1>

        <nav className="nav-links">
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          
          {userInfo ? (
            <div className="user-menu">
              <button
                className="avatar-button"
                onClick={() => setOpenMenu((v) => !v)}
              >
                <img
                    src={userInfo.user?.avatar || "https://via.placeholder.com/30"}
                    alt="avatar"
                />
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
