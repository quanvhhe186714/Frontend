import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import facebookService from "../../services/facebook/facebookService";
import { getServiceRatingSummary } from "../../services/review";
import { getWallet } from "../../services/wallet";
import ServiceStatusBadge from "../../components/ServiceStatusBadge/ServiceStatusBadge";
import "./dich-vu.scss";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "F", color: "#1877f2" },
  { key: "tiktok", label: "TikTok", icon: "T", color: "#ff0050" },
  { key: "youtube", label: "YouTube", icon: "Y", color: "#ff0000" },
  { key: "instagram", label: "Instagram", icon: "I", color: "#e1306c" },
  { key: "twitter", label: "Twitter (X)", icon: "X", color: "#1da1f2" },
  { key: "telegram", label: "Telegram", icon: "TG", color: "#229ed9" },
];

const SERVICE_TYPES = {
  all: "Tất cả",
  like: "Like",
  follow: "Follow",
  view: "View",
  comment: "Comment",
  share: "Share",
  live: "Livestream",
};

const isImageIcon = (icon) => /^https?:\/\//i.test(icon || "");

const ServiceIcon = ({ icon, fallback = "S", className = "" }) => {
  if (isImageIcon(icon)) {
    return <img className={`${className} image-icon`} src={icon} alt="" loading="lazy" />;
  }
  return <span className={className}>{icon || fallback}</span>;
};

const DichVu = () => {
  const navigate = useNavigate();
  const [activePlatform, setActivePlatform] = useState("facebook");
  const [activeType, setActiveType] = useState("all");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [wallet, setWallet] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      getWallet()
        .then((response) => setWallet(response?.data?.wallet || response?.data))
        .catch(() => {});
    }
  }, [userInfo]);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const data = await facebookService.getServices(activePlatform);
        setServices(data);
        const ratings = await Promise.all(
          data.map(async (service) => {
            try {
              const rating = await getServiceRatingSummary(service._id);
              return { id: service._id, rating };
            } catch {
              return { id: service._id, rating: { averageRating: 0, totalReviews: 0 } };
            }
          })
        );
        const ratingMap = {};
        ratings.forEach(({ id, rating }) => {
          ratingMap[id] = rating;
        });
        setRatingSummaries(ratingMap);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [activePlatform]);

  const filtered = useMemo(() => {
    let result = services;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
      );
    }
    if (activeType !== "all") {
      result = result.filter((service) => {
        const type = service.serviceType?.toLowerCase() || "";
        if (activeType === "like") return type.includes("like");
        if (activeType === "follow") return type.includes("follow") || type.includes("member");
        if (activeType === "view") return type.includes("view");
        if (activeType === "comment") return type.includes("comment");
        if (activeType === "share") return type.includes("share");
        if (activeType === "live") return type.includes("livestream");
        return true;
      });
    }
    return result;
  }, [services, searchQuery, activeType]);

  const activePlatformInfo = PLATFORMS.find((platform) => platform.key === activePlatform);
  const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value);
  const formatBalance = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <div className="dv-page">
      <div className="dv-header">
        <div className="dv-header-left">
          <button className="dv-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Mở menu">
            ☰
          </button>
          <h1 className="dv-title">Dịch vụ số</h1>
        </div>

        <div className="dv-search-wrap">
          <span className="dv-search-icon">⌕</span>
          <input
            className="dv-search"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="dv-header-right">
          {userInfo ? (
            <div className="dv-wallet">
              <span className="dv-wallet-label">Số dư</span>
              <span className="dv-wallet-amount">{wallet ? formatBalance(wallet.balance) : "---"}</span>
              <button className="dv-topup-btn" onClick={() => navigate("/qr-payment")}>
                + Nạp tiền
              </button>
            </div>
          ) : (
            <button className="dv-login-btn" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      <div className="dv-body">
        <aside className={`dv-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="dv-sidebar-inner">
            <div className="dv-sidebar-title">Nền tảng</div>
            {PLATFORMS.map((platform) => (
              <button
                key={platform.key}
                className={`dv-platform-btn ${activePlatform === platform.key ? "active" : ""}`}
                style={activePlatform === platform.key ? { borderLeftColor: platform.color } : {}}
                onClick={() => {
                  setActivePlatform(platform.key);
                  setActiveType("all");
                  setSidebarOpen(false);
                }}
              >
                <span className="dv-platform-icon">{platform.icon}</span>
                <span>{platform.label}</span>
              </button>
            ))}

            <div className="dv-sidebar-divider" />
            <button className="dv-sidebar-link" onClick={() => navigate("/qr-payment")}>
              Nạp tiền
            </button>
            <button className="dv-sidebar-link" onClick={() => navigate("/transaction-history")}>
              Lịch sử giao dịch
            </button>
            <button className="dv-sidebar-link" onClick={() => navigate("/cart")}>
              Giỏ hàng
            </button>
          </div>
        </aside>
        {sidebarOpen && <div className="dv-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="dv-main">
          <div className="dv-platform-header">
            <span className="dv-platform-hero-icon">{activePlatformInfo?.icon}</span>
            <span className="dv-platform-hero-name">Dịch vụ buff {activePlatformInfo?.label}</span>
          </div>

          <div className="dv-subtabs">
            {Object.entries(SERVICE_TYPES).map(([key, label]) => (
              <button
                key={key}
                className={`dv-subtab ${activeType === key ? "active" : ""}`}
                onClick={() => setActiveType(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="dv-loading">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="dv-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="dv-empty">
              <div className="dv-empty-icon">⌕</div>
              <p>Không tìm thấy dịch vụ nào</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveType("all");
                }}
              >
                Xem tất cả
              </button>
            </div>
          ) : (
            <div className="dv-grid">
              {filtered.map((service) => {
                const rating = ratingSummaries[service._id] || { averageRating: 0, totalReviews: 0 };
                const unit = parseInt(service.unit, 10) || 1000;
                const price = Math.ceil((service.basePrice || 0) / (unit / 1000));

                return (
                  <div
                    key={service._id}
                    className="dv-card"
                    onClick={() => navigate(`/dich-vu/facebook/${service._id}`)}
                  >
                    <div className="dv-card-top">
                      <ServiceIcon className="dv-card-icon" icon={service.icon} />
                      <div className="dv-card-info">
                        <div className="dv-card-name">{service.name}</div>
                        {rating.totalReviews > 0 ? (
                          <div className="dv-card-rating">
                            ★ {rating.averageRating?.toFixed(1)} ({rating.totalReviews})
                          </div>
                        ) : (
                          <div className="dv-card-rating muted">Chưa có đánh giá</div>
                        )}
                      </div>
                      <ServiceStatusBadge status={service.status} dropRate={service.dropRate} showDropRate={false} />
                    </div>

                    <div className="dv-card-meta">
                      <span>{service.processingTime || 5}-{service.completionTime || 60} phút</span>
                      <span>BH {service.warrantyDays || 30} ngày</span>
                    </div>

                    <div className="dv-card-footer">
                      <span className="dv-card-price">
                        Từ {formatPrice(price)}đ/{service.unit || "1000"} {service.unitLabel || "lượt"}
                      </span>
                      <button className="dv-card-btn">Đặt ngay →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DichVu;
