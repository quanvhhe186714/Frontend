import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import facebookService from "../../services/facebook/facebookService";
import { getServiceRatingSummary } from "../../services/review";
import ServiceStatusBadge from "../../components/ServiceStatusBadge/ServiceStatusBadge";
import "./portal.scss";

const DichVu = () => {
  const navigate = useNavigate();
  const [facebookServices, setFacebookServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceStatuses, setServiceStatuses] = useState({});
  const [serviceRatingSummaries, setServiceRatingSummaries] = useState({});

  useEffect(() => {
    loadFacebookServices();
  }, []);


  const loadFacebookServices = async () => {
    try {
      const data = await facebookService.getServices();
      setFacebookServices(data);
      
      // Load statuses and rating summaries for all services
      const statusPromises = data.map(async (service) => {
        try {
          const status = await facebookService.getServiceStatus(service._id);
          return { id: service._id, status };
        } catch (error) {
          console.error(`Failed to load status for service ${service._id}`, error);
          return { id: service._id, status: null };
        }
      });
      
      const ratingPromises = data.map(async (service) => {
        try {
          const summary = await getServiceRatingSummary(service._id);
          return { id: service._id, summary };
        } catch (error) {
          console.error(`Failed to load rating for service ${service._id}`, error);
          return { id: service._id, summary: { averageRating: 0, totalReviews: 0 } };
        }
      });
      
      const [statuses, ratings] = await Promise.all([
        Promise.all(statusPromises),
        Promise.all(ratingPromises)
      ]);
      
      const statusMap = {};
      statuses.forEach(({ id, status }) => {
        if (status) {
          statusMap[id] = status;
        }
      });
      setServiceStatuses(statusMap);
      
      const ratingMap = {};
      ratings.forEach(({ id, summary }) => {
        ratingMap[id] = summary;
      });
      setServiceRatingSummaries(ratingMap);
    } catch (error) {
      console.error("Failed to load Facebook services", error);
    } finally {
      setLoading(false);
    }
  };


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
                        const ratingSummary = serviceRatingSummaries[service._id] || { averageRating: 0, totalReviews: 0 };
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
                            {ratingSummary.totalReviews > 0 ? (
                              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                                <span>⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                                <span style={{ marginLeft: '6px' }}>({ratingSummary.totalUsers || ratingSummary.totalReviews} người)</span>
                              </div>
                            ) : (
                              <div style={{ marginBottom: '4px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                Chưa có đánh giá
                              </div>
                            )}
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
                    const ratingSummary = serviceRatingSummaries[service._id] || { averageRating: 0, totalReviews: 0 };
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
                        {ratingSummary.totalReviews > 0 ? (
                          <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                            <span>⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                            <span style={{ marginLeft: '6px' }}>({ratingSummary.totalReviews})</span>
                          </div>
                        ) : (
                          <div style={{ marginBottom: '4px', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                            Chưa có đánh giá
                          </div>
                        )}
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


