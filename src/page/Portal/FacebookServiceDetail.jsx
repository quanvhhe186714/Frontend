import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import facebookService from "../../services/facebook/facebookService";
import { getServiceRatingSummary, getServiceReviews } from "../../services/review";
import { getWallet } from "../../services/wallet";
import PriceTable from "../../components/PriceTable/PriceTable";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import ServiceStatusBadge from "../../components/ServiceStatusBadge/ServiceStatusBadge";
import "./service-detail.scss";

const EMOTIONS = [
  { code: "like", icon: "Like", label: "Like" },
  { code: "love", icon: "Love", label: "Love" },
  { code: "haha", icon: "Haha", label: "Haha" },
  { code: "wow", icon: "Wow", label: "Wow" },
  { code: "sad", icon: "Sad", label: "Sad" },
  { code: "angry", icon: "Angry", label: "Angry" },
];

const FIELD_LABELS = {
  post_url: "Link bai viet",
  fanpage_url: "Link fanpage",
  group_url: "Link group",
  livestream_url: "Link livestream",
  reels_url: "Link reels",
  story_url: "Link story",
  comment_url: "Link comment",
};

const isImageIcon = (icon) => /^https?:\/\//i.test(icon || "");

const ServiceIcon = ({ icon, fallback = "S", className = "" }) => {
  if (isImageIcon(icon)) {
    return <img className={`${className} image-icon`} src={icon} alt="" loading="lazy" />;
  }
  return <span className={className}>{icon || fallback}</span>;
};

const FacebookServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1000);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState("like");
  const [priceInfo, setPriceInfo] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [urls, setUrls] = useState({});
  const [priceTable, setPriceTable] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("order");
  const [urlError, setUrlError] = useState("");
  const [toast, setToast] = useState("");

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    if (userInfo) {
      getWallet()
        .then((response) => setWallet(response?.data?.wallet || response?.data))
        .catch(() => {});
    }
  }, [userInfo]);

  const loadReviews = useCallback(async () => {
    try {
      const [reviewData, summaryData] = await Promise.all([
        getServiceReviews(id),
        getServiceRatingSummary(id),
      ]);
      setReviews(reviewData);
      setRatingSummary(summaryData);
    } catch {
      setReviews([]);
    }
  }, [id]);

  const loadService = useCallback(async () => {
    try {
      const data = await facebookService.getServiceById(id);
      setService(data);
      if (data.servers?.length) setSelectedServer(data.servers[0]);

      const initialUrls = {};
      data.requiredFields?.forEach((field) => {
        initialUrls[field] = "";
      });
      setUrls(initialUrls);

      try {
        setPriceTable(await facebookService.getPriceTable(id));
      } catch {}
      try {
        setServiceStatus(await facebookService.getServiceStatus(id));
      } catch {}
      await loadReviews();
    } catch {
      navigate("/dich-vu");
    } finally {
      setLoading(false);
    }
  }, [id, loadReviews, navigate]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const calculatePrice = useCallback(async () => {
    if (!service || quantity <= 0) return;
    setCalculating(true);
    try {
      const data = await facebookService.calculatePrice(
        service._id,
        quantity,
        selectedServer?.serverId || null
      );
      setPriceInfo(data);
    } catch {
      const unitPrice = selectedServer?.price || service.basePrice;
      const unit = parseInt(service.unit, 10) || 1000;
      let totalPrice = (quantity / unit) * unitPrice;
      if (service.minPrice && totalPrice < service.minPrice) totalPrice = service.minPrice;
      if (service.maxPrice && totalPrice > service.maxPrice) totalPrice = service.maxPrice;
      setPriceInfo({ unitPrice, totalPrice: Math.ceil(totalPrice), quantity });
    } finally {
      setCalculating(false);
    }
  }, [quantity, selectedServer, service]);

  useEffect(() => {
    if (service && quantity) calculatePrice();
  }, [calculatePrice, quantity, service, selectedServer]);

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateOrderForm = () => {
    if (!userInfo) {
      showToast("Vui long dang nhap!");
      navigate("/login");
      return false;
    }

    if (service.requiredFields?.length) {
      const field = service.requiredFields[0];
      if (!urls[field]?.trim()) {
        setUrlError("Vui long nhap link");
        return false;
      }
      if (!validateUrl(urls[field])) {
        setUrlError("Link khong hop le");
        return false;
      }
    }

    if (!priceInfo?.totalPrice) {
      showToast("Vui long dang nhap!");
      return false;
    }
    return true;
  };

  const buildCartItem = () => ({
    productId: `service_${service._id}_${Date.now()}`,
    name: service.name,
    price: priceInfo.totalPrice,
    quantity: 1,
    type: "service",
    serviceId: service._id,
    serviceName: service.name,
    serviceQuantity: quantity,
    serviceUnit: service.unit,
    serviceUnitLabel: service.unitLabel,
    urls,
    server: selectedServer,
    emotion: selectedEmotion,
    serviceType: `${service.platform || "facebook"}_service`,
  });

  const addToCart = () => {
    if (!validateOrderForm()) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(buildCartItem());
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Da them vao gio hang");
    navigate("/cart");
  };

  const handleOrderNow = () => {
    if (!validateOrderForm()) return;
    localStorage.setItem("cart", JSON.stringify([buildCartItem()]));
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/checkout");
  };

  const fmt = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);
  const fmtBalance = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);
  const canAfford = wallet && priceInfo && wallet.balance >= priceInfo.totalPrice;
  const primaryField = service?.requiredFields?.[0];

  if (loading) return <div className="sd-page"><div className="sd-loading">Dang tai...</div></div>;
  if (!service) return null;

  return (
    <div className="sd-page">
      {toast && <div className="sd-toast">{toast}</div>}

      <div className="sd-container">
        <div className="sd-breadcrumb">
          <button onClick={() => navigate("/dich-vu")}>Quay lai dich vu</button>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        <div className="sd-header">
          <div className="sd-header-top">
            <ServiceIcon className="sd-icon" icon={service.icon} />
            <div className="sd-header-info">
              <h1>{service.name}</h1>
              <div className="sd-badges">
                {serviceStatus && (
                  <ServiceStatusBadge status={serviceStatus.status} dropRate={serviceStatus.dropRate} />
                )}
                {ratingSummary?.totalReviews > 0 && (
                  <span className="sd-rating">
                    Rating {ratingSummary.averageRating?.toFixed(1)} ({ratingSummary.totalReviews} danh gia)
                  </span>
                )}
                <span className="sd-meta-badge">
                  {service.processingTime || 5}-{service.completionTime || 60} phút
                </span>
                <span className="sd-meta-badge">
                  BH {serviceStatus?.warrantyDays || service.warrantyDays || 30} ngày
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sd-tabs">
          {["order", "pricetable", "reviews"].map((tab) => (
            <button
              key={tab}
              className={`sd-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "order"
                ? "Dat dich vu"
                : tab === "pricetable"
                  ? "Bang gia"
                  : `Danh gia (${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === "order" && (
          <div className="sd-order">
            {primaryField && (
              <div className="sd-step">
                <div className="sd-step-title"><span className="sd-step-num">1</span> Nhap link</div>
                <input
                  type="url"
                  className={`sd-input ${urlError ? "error" : ""}`}
                  placeholder={`Nhap ${FIELD_LABELS[primaryField]?.toLowerCase() || "link"}...`}
                  value={urls[primaryField] || ""}
                  onChange={(event) => {
                    setUrls({ ...urls, [primaryField]: event.target.value });
                    setUrlError("");
                  }}
                />
                {urlError && <div className="sd-error">{urlError}</div>}
                <div className="sd-hint">Vi du: https://www.facebook.com/...</div>
              </div>
            )}

            {service.servers?.length > 0 && (
              <div className="sd-step">
                <div className="sd-step-title"><span className="sd-step-num">2</span> Chon server</div>
                {service.servers.map((server, index) => (
                  <div
                    key={server.serverId || index}
                    className={`sd-server ${selectedServer?.serverId === server.serverId ? "active" : ""}`}
                    onClick={() => setSelectedServer(server)}
                  >
                    <input type="radio" readOnly checked={selectedServer?.serverId === server.serverId} />
                    <div className="sd-server-body">
                      <div className="sd-server-name">{server.name || `Server ${index + 1}`}</div>
                      <div className="sd-server-desc">{server.description}</div>
                    </div>
                    <div className="sd-server-price">{fmt(server.price || service.basePrice)} VND</div>
                  </div>
                ))}
              </div>
            )}

            {selectedServer?.supportsMultipleEmotions && (
              <div className="sd-step">
                <div className="sd-step-title"><span className="sd-step-num">3</span> Chon cam xuc</div>
                <div className="sd-emotions">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.code}
                      className={`sd-emotion-btn ${selectedEmotion === emotion.code ? "active" : ""}`}
                      onClick={() => setSelectedEmotion(emotion.code)}
                    >
                      <span>{emotion.icon}</span><span>{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="sd-step">
              <div className="sd-step-title">
                <span className="sd-step-num">{service.servers?.length ? "3" : "2"}</span>
                So luong ({service.unitLabel || "luot"})
              </div>
              <input
                type="number"
                className="sd-input"
                min={parseInt(service.unit, 10) || 1000}
                step={parseInt(service.unit, 10) || 1000}
                value={quantity}
                onChange={(event) => setQuantity(parseInt(event.target.value, 10) || parseInt(service.unit, 10) || 1000)}
              />
              <div className="sd-quick-qty">
                {[1000, 2000, 5000, 10000, 20000, 50000].map((value) => (
                  <button
                    key={value}
                    className={`sd-qty-btn ${quantity === value ? "active" : ""}`}
                    onClick={() => setQuantity(value)}
                  >
                    {value >= 1000 ? `${value / 1000}K` : value}
                  </button>
                ))}
              </div>
            </div>

            {priceInfo && (
              <div className="sd-price-box">
                <div className="sd-price-row"><span>Don gia</span><span>{fmt(priceInfo.unitPrice)} VND / {service.unit} {service.unitLabel}</span></div>
                <div className="sd-price-row"><span>So luong</span><span>{fmt(quantity)} {service.unitLabel}</span></div>
                <div className="sd-price-row total"><span>Thanh tien</span><span>{fmt(priceInfo.totalPrice)} VND</span></div>
                {userInfo && (
                  <div className={`sd-wallet-row ${canAfford ? "ok" : "warn"}`}>
                    <span>So du vi</span>
                    <span>{wallet ? fmtBalance(wallet.balance) : "---"} {canAfford ? "Du" : "Khong du"}</span>
                  </div>
                )}
                {userInfo && !canAfford && wallet && (
                  <button className="sd-topup-inline" onClick={() => navigate("/qr-payment")}>
                    + Nap them tien
                  </button>
                )}
              </div>
            )}

            <div className="sd-actions">
              <button className="sd-btn secondary" onClick={addToCart} disabled={calculating || !priceInfo}>
                {calculating ? "Dang tinh..." : "Them gio hang"}
              </button>
              <button className="sd-btn primary" onClick={handleOrderNow} disabled={calculating || !priceInfo}>
                {calculating ? "Dang tinh..." : "Dat ngay"}
              </button>
            </div>

            {service.description && <div className="sd-description">{service.description}</div>}
          </div>
        )}

        {activeTab === "pricetable" && priceTable && (
          <div className="sd-pricetable-wrap">
            <PriceTable
              priceTable={priceTable.priceTable}
              unit={priceTable.unit}
              unitLabel={priceTable.unitLabel}
              onQuantitySelect={(value) => {
                setQuantity(value);
                setActiveTab("order");
              }}
            />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="sd-reviews">
            <ReviewForm serviceId={id} onReviewSubmitted={loadReviews} onReviewUpdated={loadReviews} onReviewDeleted={loadReviews} />
            {reviews.length === 0 ? (
              <p className="sd-no-reviews">Chua co danh gia nao.</p>
            ) : (
              <div className="sd-review-list">
                {reviews.map((review) => (
                  <div key={review._id} className="sd-review-item">
                    <div className="sd-review-header">
                      <div className="sd-review-avatar">
                        {review.user?.avatar ? <img src={review.user.avatar} alt="" /> : <span>{(review.user?.name || "U").charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <div className="sd-review-name">{review.user?.name || "An danh"}</div>
                        <div className="sd-review-date">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</div>
                      </div>
                      <div className="sd-review-stars">{"*".repeat(review.rating)}{"-".repeat(5 - review.rating)}</div>
                    </div>
                    {review.comment && <p className="sd-review-comment">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookServiceDetail;
