import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product";
import facebookService from "../../services/facebook/facebookService";
import "./portal.scss";

const DichVu = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [facebookServices, setFacebookServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    loadProducts();
    loadFacebookServices();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const loadFacebookServices = async () => {
    try {
      const data = await facebookService.getServices();
      setFacebookServices(data);
    } catch (error) {
      console.error("Failed to load Facebook services", error);
    } finally {
      setLoading(false);
    }
  };

  // Định nghĩa các dịch vụ dựa trên category
  const services = useMemo(() => {
    const serviceMap = {
      VIA: {
        name: "VIA - Tài khoản xác thực",
        description: "Tài khoản VIA Facebook, Gmail chất lượng cao, trust cao, phù hợp chạy ads và cày tool.",
        icon: "🔐",
        category: "VIA",
        filterKey: "Facebook"
      },
      PROXY: {
        name: "PROXY - Dịch vụ Proxy",
        description: "Proxy Residential 4G và Datacenter chất lượng, tốc độ cao, ổn định.",
        icon: "🌐",
        category: "PROXY",
        filterKey: "Khác"
      },
      DICH_VU_MXH: {
        name: "Dịch vụ Mạng Xã Hội",
        description: "Tăng tương tác, tối ưu hồ sơ, nội dung cho Facebook, TikTok, YouTube...",
        icon: "📱",
        category: "DICH_VU_MXH",
        filterKey: "Khác"
      },
      TELEGRAM: {
        name: "Telegram Premium (Chính chủ)",
        description: "Gói 1/3/6/12 tháng. Kích hoạt nhanh, bảo hành đầy đủ.",
        icon: "✈️",
        category: "TELEGRAM",
        filterKey: "Telegram"
      }
    };

    // Tạo danh sách dịch vụ từ products
    const serviceList = [];
    
    // Thêm Telegram Premium nếu có products
    const telegramProducts = products.filter(p => !p.category || p.category === "OTHER");
    if (telegramProducts.length > 0) {
      const prices = telegramProducts.map(p => p.price).sort((a, b) => a - b);
      serviceList.push({
        ...serviceMap.TELEGRAM,
        products: telegramProducts,
        priceRange: `${new Intl.NumberFormat('vi-VN').format(prices[0])}₫ - ${new Intl.NumberFormat('vi-VN').format(prices[prices.length - 1])}₫`
      });
    }

    // Thêm VIA nếu có
    const viaProducts = products.filter(p => p.category === "VIA");
    if (viaProducts.length > 0) {
      const prices = viaProducts.map(p => p.price).sort((a, b) => a - b);
      serviceList.push({
        ...serviceMap.VIA,
        products: viaProducts,
        priceRange: `${new Intl.NumberFormat('vi-VN').format(prices[0])}₫ - ${new Intl.NumberFormat('vi-VN').format(prices[prices.length - 1])}₫`
      });
    }

    // Thêm PROXY nếu có
    const proxyProducts = products.filter(p => p.category === "PROXY");
    if (proxyProducts.length > 0) {
      const prices = proxyProducts.map(p => p.price).sort((a, b) => a - b);
      serviceList.push({
        ...serviceMap.PROXY,
        products: proxyProducts,
        priceRange: `${new Intl.NumberFormat('vi-VN').format(prices[0])}₫ - ${new Intl.NumberFormat('vi-VN').format(prices[prices.length - 1])}₫`
      });
    }

    // Thêm Dịch vụ MXH nếu có
    const mxhProducts = products.filter(p => p.category === "DICH_VU_MXH");
    if (mxhProducts.length > 0) {
      const prices = mxhProducts.map(p => p.price).sort((a, b) => a - b);
      serviceList.push({
        ...serviceMap.DICH_VU_MXH,
        products: mxhProducts,
        priceRange: `${new Intl.NumberFormat('vi-VN').format(prices[0])}₫ - ${new Intl.NumberFormat('vi-VN').format(prices[prices.length - 1])}₫`
      });
    }

    // Thêm dịch vụ tham khảo
    serviceList.push({
      name: "Dịch vụ mạng xã hội (tham khảo)",
      description: "Tăng tương tác, tối ưu hồ sơ, nội dung... (sắp triển khai)",
      icon: "💬",
      category: "COMING_SOON",
      filterKey: "Khác",
      priceRange: "Liên hệ",
      products: []
    });

    return serviceList;
  }, [products]);

  // Lọc dịch vụ theo filter
  const filteredServices = useMemo(() => {
    if (activeFilter === "ALL") return services;
    
    const filterMap = {
      "Telegram": "TELEGRAM",
      "Facebook": "VIA",
      "TikTok": "DICH_VU_MXH",
      "Youtube": "DICH_VU_MXH",
      "Khác": ["PROXY", "COMING_SOON"]
    };

    const targetCategories = filterMap[activeFilter];
    if (Array.isArray(targetCategories)) {
      return services.filter(s => targetCategories.includes(s.category));
    }
    return services.filter(s => s.filterKey === activeFilter || s.category === targetCategories);
  }, [services, activeFilter]);

  const filters = [
    { key: "ALL", label: "Tất cả" },
    { key: "Telegram", label: "Telegram" },
    { key: "Facebook", label: "Facebook" },
    { key: "TikTok", label: "TikTok" },
    { key: "Youtube", label: "Youtube" },
    { key: "Khác", label: "Khác" }
  ];

  const handleServiceClick = (service) => {
    if (service.category === "COMING_SOON") {
      alert("Dịch vụ này sắp được triển khai. Vui lòng liên hệ để biết thêm chi tiết.");
      return;
    }
    
    if (service.products && service.products.length > 0) {
      // Nếu có nhiều sản phẩm, chuyển đến trang products với filter
      if (service.category === "TELEGRAM") {
        navigate("/products");
      } else {
        navigate("/products", { state: { category: service.category } });
      }
    } else {
      navigate("/products");
    }
  };

  if (loading) {
    return (
      <div className="portal-page">
        <div className="portal-hero">
          <h2>Dịch vụ số</h2>
          <div>Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-hero">
        <h2>Dịch vụ số</h2>
        <div>Chọn dịch vụ bạn quan tâm để xem chi tiết và đặt mua</div>
      </div>

      <div className="market-grid">
        <aside className="market-filter">
          <h4>Bộ lọc</h4>
          <ul>
            {filters.map(filter => (
              <li
                key={filter.key}
                className={activeFilter === filter.key ? "active" : ""}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </li>
            ))}
          </ul>
        </aside>

        <div className="market-list">
          {/* Quick Actions layout like reference images */}
          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Facebook</div>
            <div className="svc-grid">
              {facebookServices.length > 0 ? (
                facebookServices.map((service) => (
                  <div 
                    key={service._id} 
                    className="svc-item" 
                    onClick={() => navigate(`/dich-vu/facebook/${service._id}`)}
                  >
                    <span className="svc-icon">{service.icon || "👍"}</span>
                    <strong>{service.name}</strong>
                  </div>
                ))
              ) : (
                ["Tăng like bài viết","Tăng sub/follow","Tăng like fanpage","Tăng comment","Tăng like comment","Tăng share bài viết","Tăng share vào group","Tăng share livestream","Đánh giá 5* sao FANPAGE","Tăng mắt livestream","Tăng member group","Tăng view video","Tăng view story","Tăng like reels","Tăng view reels","Tăng comment reels","Tăng share reels"].map((label, idx) => (
                  <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                    <span className="svc-icon">👍</span><strong>{label}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Tiktok</div>
            <div className="svc-grid">
              {["Tăng lượt tim video","Tăng follow tiktok","Tăng view tiktok","Tăng comment tiktok","Tăng lượt share tiktok","Thêm vào yêu thích","Tăng mắt livestream","Tăng comment livestream","Tăng tim livestream","Tăng share livestream","Điểm chiến đấu (PK) Tiktok","Tăng like comment tiktok"].map((label, idx) => (
                <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                  <span className="svc-icon">🎵</span><strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Youtube</div>
            <div className="svc-grid">
              {["Tăng like video","Tăng like short video","Tăng view video","Tăng view video short","Tăng sub Youtube","Tăng comment video","Tăng like comment video","Tăng mắt livestream","View youtube 4000h"].map((label, idx) => (
                <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                  <span className="svc-icon">▶️</span><strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Twitter (X)</div>
            <div className="svc-grid">
              {["Tăng Like","Tăng Follow","Tăng lượt xem","Tăng Retweet","Tăng Comment","Tăng mắt livestream"].map((label, idx) => (
                <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                  <span className="svc-icon">𝕏</span><strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Telegram</div>
            <div className="svc-grid">
              {["Member & Sub Telegram","View Bài Viết Telegram","Cảm Xúc Bài Viết Telegram","Referrals for Game Bots"].map((label, idx) => (
                <div key={idx} className="svc-item" onClick={() => navigate("/products")}>
                  <span className="svc-icon">✈️</span><strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="svc-section">
            <div className="svc-title">Dịch vụ buff Instagram</div>
            <div className="svc-grid">
              {["Tăng lượt like","Tăng lượt comment","Tăng lượt theo dõi","Tăng lượt xem","Tăng mắt livestream"].map((label, idx) => (
                <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                  <span className="svc-icon">📸</span><strong>{label}</strong>
                </div>
              ))}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="service-card">
              <div className="meta">
                <h3>Không tìm thấy dịch vụ</h3>
                <p>Vui lòng thử bộ lọc khác</p>
              </div>
            </div>
          ) : (
            filteredServices.map((service, index) => (
              <div key={index} className="service-card">
                <div className="thumb">
                  <div className="service-icon">{service.icon}</div>
                </div>
                <div className="meta">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <div className="actions">
                  <div className="price">{service.priceRange}</div>
                  <button 
                    className="link-btn" 
                    onClick={() => handleServiceClick(service)}
                  >
                    {service.category === "COMING_SOON" ? "Chi tiết" : "Xem các gói"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DichVu;


