import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product";
import facebookService from "../../services/facebook/facebookService";
import ServiceStatusBadge from "../../components/ServiceStatusBadge/ServiceStatusBadge";
import "./portal.scss";

const DichVu = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [facebookServices, setFacebookServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceStatuses, setServiceStatuses] = useState({});

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
      
      // Load statuses for all services
      const statusPromises = data.map(async (service) => {
        try {
          const status = await facebookService.getServiceStatus(service._id);
          return { id: service._id, status };
        } catch (error) {
          console.error(`Failed to load status for service ${service._id}`, error);
          return { id: service._id, status: null };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach(({ id, status }) => {
        if (status) {
          statusMap[id] = status;
        }
      });
      setServiceStatuses(statusMap);
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

  // Tất cả các dịch vụ hardcoded để tìm kiếm
  const allHardcodedServices = useMemo(() => {
    return [
      // TikTok
      { name: "Tăng lượt tim video", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng follow tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng view tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng comment tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng lượt share tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Thêm vào yêu thích", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng mắt livestream", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng comment livestream", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng tim livestream", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng share livestream", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Điểm chiến đấu (PK) Tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      { name: "Tăng like comment tiktok", icon: "🎵", category: "TikTok", onClick: () => navigate("/dich-vu") },
      // YouTube
      { name: "Tăng like video", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng like short video", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng view video", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng view video short", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng sub Youtube", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng comment video", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng like comment video", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "Tăng mắt livestream", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      { name: "View youtube 4000h", icon: "▶️", category: "Youtube", onClick: () => navigate("/dich-vu") },
      // Twitter
      { name: "Tăng Like", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      { name: "Tăng Follow", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      { name: "Tăng lượt xem", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      { name: "Tăng Retweet", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      { name: "Tăng Comment", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      { name: "Tăng mắt livestream", icon: "𝕏", category: "Twitter", onClick: () => navigate("/dich-vu") },
      // Telegram
      { name: "Member & Sub Telegram", icon: "✈️", category: "Telegram", onClick: () => navigate("/products") },
      { name: "View Bài Viết Telegram", icon: "✈️", category: "Telegram", onClick: () => navigate("/products") },
      { name: "Cảm Xúc Bài Viết Telegram", icon: "✈️", category: "Telegram", onClick: () => navigate("/products") },
      { name: "Referrals for Game Bots", icon: "✈️", category: "Telegram", onClick: () => navigate("/products") },
      // Instagram
      { name: "Tăng lượt like", icon: "📸", category: "Instagram", onClick: () => navigate("/dich-vu") },
      { name: "Tăng lượt comment", icon: "📸", category: "Instagram", onClick: () => navigate("/dich-vu") },
      { name: "Tăng lượt theo dõi", icon: "📸", category: "Instagram", onClick: () => navigate("/dich-vu") },
      { name: "Tăng lượt xem", icon: "📸", category: "Instagram", onClick: () => navigate("/dich-vu") },
      { name: "Tăng mắt livestream", icon: "📸", category: "Instagram", onClick: () => navigate("/dich-vu") }
    ];
  }, [navigate]);

  // Tìm kiếm dịch vụ
  const filteredFacebookServices = useMemo(() => {
    if (!searchQuery.trim()) return facebookServices;
    const query = searchQuery.toLowerCase().trim();
    return facebookServices.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  }, [facebookServices, searchQuery]);

  const filteredHardcodedServices = useMemo(() => {
    if (!searchQuery.trim()) return allHardcodedServices;
    const query = searchQuery.toLowerCase().trim();
    return allHardcodedServices.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  }, [allHardcodedServices, searchQuery]);

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

      {/* Search Bar */}
      <div className="service-search-container">
        <div className="service-search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="market-list">
          {/* Quick Actions layout like reference images */}
          {(searchQuery.trim() === "" || filteredFacebookServices.length > 0) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Facebook</div>
              <div className="svc-grid">
                {searchQuery.trim() === "" ? (
                  // Hiển thị tất cả Facebook services khi không có search
                  <>
                    {facebookServices.length > 0 ? (
                      facebookServices.map((service) => {
                        const status = serviceStatuses[service._id];
                        const unitPrice = service.basePrice || 0;
                        const unit = parseInt(service.unit) || 1000;
                        const pricePerUnit = Math.ceil(unitPrice / (unit / 1000)); // Price per 1000
                        
                        return (
                          <div 
                            key={service._id} 
                            className="svc-item" 
                            onClick={() => navigate(`/dich-vu/facebook/${service._id}`)}
                          >
                            <div className="svc-item-header">
                              <span className="svc-icon">{service.icon || "👍"}</span>
                              <strong>{service.name}</strong>
                              {status && (
                                <ServiceStatusBadge 
                                  status={status.status} 
                                  dropRate={status.dropRate}
                                  showDropRate={false}
                                />
                              )}
                            </div>
                            <div className="svc-item-price">
                              {pricePerUnit > 0 ? (
                                <span className="price-text">{new Intl.NumberFormat('vi-VN').format(pricePerUnit)}₫</span>
                              ) : (
                                <span className="price-text">Liên hệ</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      ["Tăng like bài viết","Tăng sub/follow","Tăng like fanpage","Tăng comment","Tăng like comment","Tăng share bài viết","Tăng share vào group","Tăng share livestream","Đánh giá 5* sao FANPAGE","Tăng mắt livestream","Tăng member group","Tăng view video","Tăng view story","Tăng like reels","Tăng view reels","Tăng comment reels","Tăng share reels"].map((label, idx) => (
                        <div key={idx} className="svc-item" onClick={() => navigate("/dich-vu")}>
                          <span className="svc-icon">👍</span><strong>{label}</strong>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  // Hiển thị kết quả tìm kiếm
                  filteredFacebookServices.map((service) => {
                    const status = serviceStatuses[service._id];
                    const unitPrice = service.basePrice || 0;
                    const unit = parseInt(service.unit) || 1000;
                    const pricePerUnit = Math.ceil(unitPrice / (unit / 1000));
                    
                    return (
                      <div 
                        key={service._id} 
                        className="svc-item" 
                        onClick={() => navigate(`/dich-vu/facebook/${service._id}`)}
                      >
                        <div className="svc-item-header">
                          <span className="svc-icon">{service.icon || "👍"}</span>
                          <strong>{service.name}</strong>
                          {status && (
                            <ServiceStatusBadge 
                              status={status.status} 
                              dropRate={status.dropRate}
                              showDropRate={false}
                            />
                          )}
                        </div>
                        <div className="svc-item-price">
                          {pricePerUnit > 0 ? (
                            <span className="price-text">{new Intl.NumberFormat('vi-VN').format(pricePerUnit)}₫</span>
                          ) : (
                            <span className="price-text">Liên hệ</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TikTok Services */}
          {(searchQuery.trim() === "" || filteredHardcodedServices.some(s => s.category === "TikTok")) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Tiktok</div>
              <div className="svc-grid">
                {filteredHardcodedServices
                  .filter(s => s.category === "TikTok")
                  .map((service, idx) => (
                    <div key={idx} className="svc-item" onClick={service.onClick}>
                      <span className="svc-icon">{service.icon}</span><strong>{service.name}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* YouTube Services */}
          {(searchQuery.trim() === "" || filteredHardcodedServices.some(s => s.category === "Youtube")) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Youtube</div>
              <div className="svc-grid">
                {filteredHardcodedServices
                  .filter(s => s.category === "Youtube")
                  .map((service, idx) => (
                    <div key={idx} className="svc-item" onClick={service.onClick}>
                      <span className="svc-icon">{service.icon}</span><strong>{service.name}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Twitter Services */}
          {(searchQuery.trim() === "" || filteredHardcodedServices.some(s => s.category === "Twitter")) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Twitter (X)</div>
              <div className="svc-grid">
                {filteredHardcodedServices
                  .filter(s => s.category === "Twitter")
                  .map((service, idx) => (
                    <div key={idx} className="svc-item" onClick={service.onClick}>
                      <span className="svc-icon">{service.icon}</span><strong>{service.name}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Telegram Services */}
          {(searchQuery.trim() === "" || filteredHardcodedServices.some(s => s.category === "Telegram")) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Telegram</div>
              <div className="svc-grid">
                {filteredHardcodedServices
                  .filter(s => s.category === "Telegram")
                  .map((service, idx) => (
                    <div key={idx} className="svc-item" onClick={service.onClick}>
                      <span className="svc-icon">{service.icon}</span><strong>{service.name}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Instagram Services */}
          {(searchQuery.trim() === "" || filteredHardcodedServices.some(s => s.category === "Instagram")) && (
            <div className="svc-section">
              <div className="svc-title">Dịch vụ buff Instagram</div>
              <div className="svc-grid">
                {filteredHardcodedServices
                  .filter(s => s.category === "Instagram")
                  .map((service, idx) => (
                    <div key={idx} className="svc-item" onClick={service.onClick}>
                      <span className="svc-icon">{service.icon}</span><strong>{service.name}</strong>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {searchQuery.trim() !== "" && 
           filteredFacebookServices.length === 0 && 
           filteredHardcodedServices.length === 0 && (
            <div className="service-card">
              <div className="meta">
                <h3>Không tìm thấy dịch vụ</h3>
                <p>Vui lòng thử từ khóa khác</p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default DichVu;


