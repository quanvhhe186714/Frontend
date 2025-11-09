import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/user";
import "./login.scss"; // tạo file SCSS riêng

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await loginUser(formData.email, formData.password);
      localStorage.setItem("userInfo", JSON.stringify(data));

      if (data.user?.role === "admin") navigate("/admin");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">🔒</div>
        <h2>Đăng nhập</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="login-register">
          Chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
