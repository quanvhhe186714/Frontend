import React from "react";
import { useNavigate } from "react-router-dom";
import "./shop.scss";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="shop-home">
      <section className="hero">
        <div className="hero-content">
          <h1>WEB BUFF MXH</h1>
          <p>Nền tảng tăng trưởng mạng xã hội đa kênh: nhanh, ổn định, giá tốt.</p>
          <button className="cta-btn" onClick={() => navigate('/dich-vu')}>Xem dịch vụ</button>
        </div>
        <div style={{ marginTop: 24 }}>
          <img
            src="/buffmxh.png"
            alt="WEB BUFF MXH"
            style={{ width: 220, height: 'auto' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </section>

      <section className="features">
        <h2>Dịch vụ nổi bật</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🌐 Đa nền tảng</h3>
            <p>Facebook, TikTok, YouTube, Telegram, Instagram, và hơn thế nữa.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Tốc độ & ổn định</h3>
            <p>Xử lý nhanh, hạn chế tụt, phù hợp chiến dịch số lượng lớn.</p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Bảo hành</h3>
            <p>Chính sách bảo hành rõ ràng, hỗ trợ khôi phục khi tụt.</p>
          </div>
          <div className="feature-card">
            <h3>⚙️ Tuỳ chỉnh</h3>
            <p>Nhận chiến dịch theo yêu cầu: nguồn, tốc độ, khu vực, lịch chạy.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Hỗ trợ 24/7</h3>
            <p>Tư vấn và theo dõi tiến độ qua Telegram/Email.</p>
          </div>
           <div className="feature-card">
            <h3>💰 Giá cạnh tranh</h3>
            <p>Bảng giá minh bạch, ưu đãi cho đơn số lượng lớn.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
