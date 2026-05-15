import React from "react";
import { useNavigate } from "react-router-dom";
import "./shop.scss";

const STATS = [
  { value: "10,000+", label: "Khách hàng tin dùng" },
  { value: "50+", label: "Dịch vụ đa nền tảng" },
  { value: "99%", label: "Uptime ổn định" },
];

const PLATFORMS = [
  { key: "facebook", name: "Facebook", short: "F", color: "#1877f2" },
  { key: "tiktok", name: "TikTok", short: "T", color: "#010101" },
  { key: "youtube", name: "YouTube", short: "Y", color: "#ff0000" },
  { key: "instagram", name: "Instagram", short: "I", color: "#e1306c" },
  { key: "telegram", name: "Telegram", short: "TG", color: "#229ed9" },
];

const FEATURES = [
  {
    icon: "01",
    title: "Đa nền tảng",
    desc: "Facebook, TikTok, YouTube, Telegram, Instagram và hơn thế nữa.",
    accent: "#229ed9",
  },
  {
    icon: "02",
    title: "Tốc độ & ổn định",
    desc: "Xử lý nhanh, hạn chế tụt, phù hợp chiến dịch số lượng lớn.",
    accent: "#f59e0b",
  },
  {
    icon: "03",
    title: "Bảo hành",
    desc: "Chính sách bảo hành rõ ràng, hỗ trợ khôi phục khi tụt.",
    accent: "#10b981",
  },
  {
    icon: "04",
    title: "Tùy chỉnh",
    desc: "Nhận chiến dịch theo yêu cầu: nguồn, tốc độ, khu vực, lịch chạy.",
    accent: "#8b5cf6",
  },
  {
    icon: "05",
    title: "Hỗ trợ 24/7",
    desc: "Tư vấn và theo dõi tiến độ qua Telegram/Email.",
    accent: "#ec4899",
  },
  {
    icon: "06",
    title: "Giá cạnh tranh",
    desc: "Bảng giá minh bạch, ưu đãi cho đơn số lượng lớn.",
    accent: "#06b6d4",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="shop-home">
      <section className="hero hero-cyber">
        <div className="hero-lights" aria-hidden="true" />
        <div className="hero-grid-floor" aria-hidden="true" />

        <div className="cyber-panel cyber-panel--left-top" aria-hidden="true">
          <div className="panel-lines">
            <span />
            <span />
            <span />
          </div>
          <div className="line-chart">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="cyber-panel cyber-panel--right-top" aria-hidden="true">
          <div className="donut-chart">
            <span>75%</span>
          </div>
          <div className="panel-lines compact">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="cyber-panel cyber-panel--left-bottom" aria-hidden="true">
          <div className="people-icon">
            <span />
            <span />
            <span />
          </div>
          <strong>+128%</strong>
          <small>Tăng trưởng</small>
        </div>

        <div className="cyber-panel cyber-panel--right-bottom" aria-hidden="true">
          <div className="mini-bars">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="hero-cyber-content">
          <div className="hero-kicker">Nền tảng hỗ trợ tăng trưởng mạng xã hội</div>
          <h1 className="cyber-brand">WEBBUFFMXH</h1>
          <div className="cyber-service-banner">
            <span>Dịch vụ hỗ trợ mạng xã hội</span>
          </div>
          <p className="cyber-proofline">
            <span>Tăng hiện diện thương hiệu</span>
            <span>Thu hút khách hàng</span>
            <span>Tối ưu tương tác</span>
          </p>
          <div className="hero-actions cyber-actions">
            <button
              className="cta-btn cta-btn--primary"
              onClick={() => navigate("/dich-vu")}
            >
              Xem dịch vụ
            </button>
            <button
              className="cta-btn cta-btn--ghost"
              onClick={() => navigate("/san-pham")}
            >
              Xem sản phẩm
            </button>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {STATS.map((stat) => (
          <div className="stat-item" key={stat.label}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="platforms-strip">
        <p className="platforms-label">Hỗ trợ tất cả nền tảng lớn</p>
        <div className="platforms-row">
          {PLATFORMS.map((platform) => (
            <button
              type="button"
              className="platform-chip"
              key={platform.name}
              onClick={() => navigate(`/dich-vu?platform=${platform.key}`)}
            >
              <span style={{ color: platform.color }}>{platform.short}</span>
              <span>{platform.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2>Tại sao chọn chúng tôi?</h2>
          <p>Dịch vụ chuyên nghiệp, đảm bảo chất lượng và tốc độ xử lý hàng đầu.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <div
              className="feature-card"
              key={feature.title}
              style={{ "--accent": feature.accent }}
            >
              <div className="feature-icon-wrap">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>Bắt đầu tăng trưởng ngay hôm nay</h2>
          <p>Tham gia cùng hàng nghìn khách hàng đang tăng trưởng với WEB BUFF MXH.</p>
          <div className="cta-band-actions">
            <button
              className="cta-btn cta-btn--primary"
              onClick={() => navigate("/dich-vu")}
            >
              Xem tất cả dịch vụ
            </button>
            <button
              className="cta-btn cta-btn--ghost"
              onClick={() => navigate("/register")}
            >
              Đăng ký miễn phí
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
