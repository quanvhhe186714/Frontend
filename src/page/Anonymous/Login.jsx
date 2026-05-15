import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "../../services/user";
import "./login.scss";

const GOOGLE_SCRIPT_ID = "google-identity-script";

const loadScript = (id, src) =>
  new Promise((resolve, reject) => {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      resolve(existingScript);
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(script);
    script.onerror = reject;
    document.body.appendChild(script);
  });

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const mascotRef = useRef(null);
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleAuthSuccess = useCallback((data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    const from = location.state?.from;
    navigate(from || (data.user?.role === "admin" ? "/admin" : "/profile"), { replace: true });
  }, [location.state, navigate]);

  useEffect(() => {
    const container = containerRef.current;
    const mascot = mascotRef.current;
    if (!container || !mascot) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetX = ((event.clientX - cx) / (rect.width / 2)) * 18;
      targetY = ((event.clientY - cy) / (rect.height / 2)) * -18;
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

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let isMounted = true;

    loadScript(GOOGLE_SCRIPT_ID, "https://accounts.google.com/gsi/client")
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) {
              setError("Google không trả về thông tin đăng nhập.");
              return;
            }

            setError("");
            setLoading(true);
            try {
              const { data } = await loginWithGoogle(response.credential);
              handleAuthSuccess(data);
            } catch (err) {
              setError(getErrorMessage(err, "Đăng nhập Google thất bại"));
            } finally {
              setLoading(false);
            }
          },
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: 302,
          text: "signin_with",
        });
      })
      .catch(() => {
        if (isMounted) setError("Không tải được Google login.");
      });

    return () => {
      isMounted = false;
    };
  }, [googleClientId, handleAuthSuccess]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await loginUser(formData.email, formData.password);
      handleAuthSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err, "Đăng nhập thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" ref={containerRef}>
      <div className="login-mascot-wrap">
        <img
          ref={mascotRef}
          src="/robot-mascot.png"
          alt="ShopBS Robot Mascot"
          className="login-mascot"
          draggable={false}
        />
        <div className="mascot-glow" />
      </div>

      <div className="login-box">
        <div className="login-icon" aria-hidden="true">
          <img src="/robot-mascot.png" alt="" />
        </div>
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
              placeholder="Nhập địa chỉ email của bạn"
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
              placeholder="Nhập mật khẩu của bạn"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="login-divider">
          <span>Hoặc</span>
        </div>

        <div className="social-login">
          {googleClientId ? (
            <div ref={googleButtonRef} className="google-login-button" />
          ) : (
            <button type="button" className="social-btn google" disabled>
              Google chưa cấu hình
            </button>
          )}
        </div>

        <p className="login-register">
          Chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký ngay</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
