import React from "react";
import { useNavigate } from "react-router-dom";
import "./shop.scss";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="shop-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Nền tảng hàng đầu</span>
            </div>
            <h1>
              <span className="gradient-text">WEB BUFF MXH</span>
            </h1>
            <p className="hero-subtitle">
              Nền tảng tăng trưởng mạng xã hội đa kênh: <strong>nhanh</strong>, <strong>ổn định</strong>, <strong>giá tốt</strong>
            </p>
            <div className="hero-cta">
              <button className="cta-btn primary" onClick={() => navigate('/san-pham')}>
                Xem sản phẩm
              </button>
              <button className="cta-btn secondary" onClick={() => navigate('/dich-vu')}>
                Xem dịch vụ
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Khách hàng</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Dịch vụ</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <div className="hero-icon-main">🚀</div>
              <div className="hero-floating-icons">
                <span className="floating-icon icon-1">📱</span>
                <span className="floating-icon icon-2">💬</span>
                <span className="floating-icon icon-3">📊</span>
                <span className="floating-icon icon-4">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <span className="section-badge">Dịch vụ</span>
          <h2>Dịch vụ nổi bật</h2>
          <p className="section-description">Những tính năng và dịch vụ tốt nhất cho chiến dịch mạng xã hội của bạn</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🌐</div>
            </div>
            <h3>Đa nền tảng</h3>
            <p>Facebook, TikTok, YouTube, Telegram, Instagram, và hơn thế nữa.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">⚡</div>
            </div>
            <h3>Tốc độ & ổn định</h3>
            <p>Xử lý nhanh, hạn chế tụt, phù hợp chiến dịch số lượng lớn.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🛡️</div>
            </div>
            <h3>Bảo hành</h3>
            <p>Chính sách bảo hành rõ ràng, hỗ trợ khôi phục khi tụt.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">⚙️</div>
            </div>
            <h3>Tuỳ chỉnh</h3>
            <p>Nhận chiến dịch theo yêu cầu: nguồn, tốc độ, khu vực, lịch chạy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🤝</div>
            </div>
            <h3>Hỗ trợ 24/7</h3>
            <p>Tư vấn và theo dõi tiến độ qua Telegram/Email.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">💰</div>
            </div>
            <h3>Giá cạnh tranh</h3>
            <p>Bảng giá minh bạch, ưu đãi cho đơn số lượng lớn.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Sẵn sàng bắt đầu?</h2>
            <p>Khám phá các dịch vụ và sản phẩm của chúng tôi ngay hôm nay</p>
            <button className="cta-btn-large" onClick={() => navigate('/san-pham')}>
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
