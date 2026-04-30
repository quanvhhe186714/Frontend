import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/user";
import "./register.scss";

const Register = () => {
  const navigate = useNavigate();
  const mascotRef = useRef(null);
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Mouse tilt / parallax effect ─────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const mascot = mascotRef.current;
    if (!container || !mascot) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      targetX = nx * 18;
      targetY = ny * -18;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      mascot.style.transform = `
        perspective(600px)
        rotateY(${currentX}deg)
        rotateX(${currentY}deg)
        translateZ(20px)
        scale(1.04)
      `;
      rafId = requestAnimationFrame(animate);
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData.name, formData.email, formData.password);
      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" ref={containerRef}>
      {/* Mascot nổi bên trái, tilt theo chuột */}
      <div className="register-mascot-wrap">
        <img
          ref={mascotRef}
          src="/robot-mascot.png"
          alt="ShopBS Robot Mascot"
          className="register-mascot"
          draggable={false}
        />
        <div className="mascot-glow" />
      </div>

      <div className="register-box">
        {/* Icon nhỏ dùng chính ảnh robot */}
        <div className="register-icon" aria-hidden="true">
          <img src="/robot-mascot.png" alt="" />
        </div>
        <h2>Đăng ký</h2>

        {error && <div className="register-error">{error}</div>}
        {success && <div className="register-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
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

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="register-login">
          Đã có tài khoản?{" "}
          <span onClick={() => navigate("/login")}>Đăng nhập</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
