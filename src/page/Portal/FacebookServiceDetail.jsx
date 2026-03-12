import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import facebookService from "../../services/facebook/facebookService";
import { getServiceReviews, getServiceRatingSummary } from "../../services/review";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import PriceTable from "../../components/PriceTable/PriceTable";
import ServiceStatusBadge from "../../components/ServiceStatusBadge/ServiceStatusBadge";
import "./portal.scss";

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

  const loadReviews = async () => {
    try {
      const reviewsData = await getServiceReviews(id);
      setReviews(reviewsData);
      const summary = await getServiceRatingSummary(id);
      setRatingSummary(summary);
    } catch (error) {
      console.error("Failed to load reviews", error);
    }
  };

  // Danh sách cảm xúc Facebook
  const emotions = [
    { code: "like", icon: "👍", label: "Like" },
    { code: "love", icon: "❤️", label: "Love" },
    { code: "haha", icon: "😂", label: "Haha" },
    { code: "wow", icon: "😮", label: "Wow" },
    { code: "sad", icon: "😢", label: "Sad" },
    { code: "angry", icon: "😠", label: "Angry" }
  ];

  const loadService = useCallback(async () => {
    try {
      const data = await facebookService.getServiceById(id);
      setService(data);
      
      // Chọn server đầu tiên nếu có
      if (data.servers && data.servers.length > 0) {
        setSelectedServer(data.servers[0]);
      }
      
      // Khởi tạo urls object với các required fields
      const initialUrls = {};
      if (data.requiredFields) {
        data.requiredFields.forEach(field => {
          initialUrls[field] = "";
        });
      }
      setUrls(initialUrls);

      // Load price table
      try {
        const priceTableData = await facebookService.getPriceTable(id);
        setPriceTable(priceTableData);
      } catch (error) {
        console.error("Failed to load price table", error);
      }

      // Load service status
      try {
        const statusData = await facebookService.getServiceStatus(id);
        setServiceStatus(statusData);
      } catch (error) {
        console.error("Failed to load service status", error);
      }

      // Load rating summary
      try {
        const summary = await getServiceRatingSummary(id);
        setRatingSummary(summary);
      } catch (error) {
        console.error("Failed to load rating summary", error);
      }

      // Load reviews
      try {
        const reviewsData = await getServiceReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to load reviews", error);
      }
    } catch (error) {
      console.error("Failed to load service", error);
      navigate("/dich-vu");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const calculatePrice = useCallback(async () => {
    if (!service || !quantity || quantity <= 0) return;
    
    setCalculating(true);
    try {
      // Gọi API để tính giá (có thể tính trên server hoặc client)
      const serverId = selectedServer?.serverId || null;
      const data = await facebookService.calculatePrice(service._id, quantity, serverId);
      setPriceInfo(data);
    } catch (error) {
      console.error("Failed to calculate price", error);
      // Fallback: tính giá client-side
      const unitPrice = selectedServer?.price || service.basePrice;
      let totalPrice = (quantity / parseInt(service.unit)) * unitPrice;
      if (service.minPrice && totalPrice < service.minPrice) {
        totalPrice = service.minPrice;
      }
      if (service.maxPrice && totalPrice > service.maxPrice) {
        totalPrice = service.maxPrice;
      }
      setPriceInfo({
        unitPrice,
        totalPrice: Math.ceil(totalPrice),
        quantity
      });
    } finally {
      setCalculating(false);
    }
  }, [quantity, selectedServer, service]);

  useEffect(() => {
    if (service && quantity) {
      calculatePrice();
    }
  }, [calculatePrice, quantity, service, selectedServer, selectedEmotion]);

  const handleQuickQuantitySelect = (qty) => {
    setQuantity(qty);
  };

  const handleOrderNow = () => {
    addToCart();
    // Navigate to checkout after adding to cart
    setTimeout(() => {
      navigate("/checkout");
    }, 500);
  };

  const addToCart = () => {
    // Kiểm tra đăng nhập
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Vui lòng đăng nhập hoặc đăng ký để sử dụng dịch vụ!';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);
      navigate("/login");
      return;
    }

    // Kiểm tra required fields
    if (service.requiredFields && service.requiredFields.length > 0) {
      const missingFields = service.requiredFields.filter(field => !urls[field] || !urls[field].trim());
      if (missingFields.length > 0) {
        const el = document.createElement('div');
        el.className = 'simple-toast';
        el.innerText = 'Vui lòng điền đầy đủ thông tin bắt buộc';
        document.body.appendChild(el);
        setTimeout(() => document.body.removeChild(el), 2000);
        return;
      }
    }

    // Kiểm tra server (nếu có)
    if (service.servers && service.servers.length > 0 && !selectedServer) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Vui lòng chọn server';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 2000);
      return;
    }

    // Kiểm tra giá
    if (!priceInfo || !priceInfo.totalPrice) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Vui lòng nhập số lượng hợp lệ';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 2000);
      return;
    }

    // Thêm vào giỏ hàng (giống như sản phẩm)
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Tạo item dịch vụ
    const serviceItem = {
      productId: `service_${service._id}_${Date.now()}`, // Unique ID cho mỗi lần thêm
      name: service.name,
      price: priceInfo.totalPrice,
      quantity: 1,
      type: "service", // Đánh dấu là dịch vụ
      serviceId: service._id,
      serviceName: service.name,
      serviceQuantity: quantity, // Số lượng dịch vụ (ví dụ: 5000 likes)
      serviceUnit: service.unit,
      serviceUnitLabel: service.unitLabel,
      urls: urls,
      server: selectedServer,
      emotion: selectedEmotion,
      serviceType: "facebook_service"
    };

    cart.push(serviceItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Thông báo thành công
    const el = document.createElement('div');
    el.className = 'simple-toast';
    el.innerText = 'Đã thêm vào giỏ hàng';
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 1500);
    
    // Dispatch event để cập nhật cart
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Chuyển đến giỏ hàng
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="error">Không tìm thấy dịch vụ</div>
        <button onClick={() => navigate("/dich-vu")}>Quay lại</button>
      </div>
    );
  }

  const getFieldLabel = (field) => {
    const labels = {
      post_url: "Link bài viết",
      fanpage_url: "Link fanpage",
      group_url: "Link group",
      livestream_url: "Link livestream",
      reels_url: "Link reels",
      story_url: "Link story",
      comment_url: "Link comment"
    };
    return labels[field] || field;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: "Hoạt động", class: "status-active" },
      backup: { text: "Dự phòng", class: "status-backup" },
      inactive: { text: "Không hoạt động", class: "status-inactive" }
    };
    return badges[status] || badges.active;
  };

  return (
    <div className="service-detail-page">
      <div className="service-detail-container">
        <div className="service-detail-header">
          <div className="service-header-top">
            <h1>{service.name}</h1>
            {serviceStatus && (
              <ServiceStatusBadge 
                status={serviceStatus.status} 
                dropRate={serviceStatus.dropRate}
              />
            )}
          </div>
          
          {/* Rating Summary */}
          {ratingSummary && ratingSummary.totalReviews > 0 ? (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>⭐</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{ratingSummary.averageRating.toFixed(1)}</span>
                </div>
                <span style={{ color: '#666' }}>({ratingSummary.totalUsers || ratingSummary.totalReviews} người đánh giá)</span>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa có đánh giá</span>
            </div>
          )}
          
          {service.description && (
            <p className="service-description">{service.description}</p>
          )}
          {serviceStatus && serviceStatus.warrantyDays && (
            <p className="service-warranty">
              Bảo hành: {serviceStatus.warrantyDays} ngày
            </p>
          )}
        </div>

        {/* Phần nhập link */}
        {service.requiredFields && service.requiredFields.length > 0 && (
          <div className="service-input-section">
            <label className="input-label">
              {getFieldLabel(service.requiredFields[0])}:
            </label>
            <input
              type="url"
              className="service-url-input"
              value={urls[service.requiredFields[0]] || ""}
              onChange={(e) => setUrls({ ...urls, [service.requiredFields[0]]: e.target.value })}
              placeholder={`Nhập ${getFieldLabel(service.requiredFields[0]).toLowerCase()}`}
            />
            
            {/* Hướng dẫn */}
            {service.instructions && service.instructions.length > 0 && (
              <ul className="instructions-list">
                {service.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Phần chọn server */}
        {service.servers && service.servers.length > 0 && (
          <div className="server-selection-section">
            <label className="section-label">Chọn server:</label>
            <div className="server-list">
              {service.servers.map((server, idx) => {
                const statusBadge = getStatusBadge(server.status);
                return (
                  <div 
                    key={server.serverId || idx} 
                    className={`server-option ${selectedServer?.serverId === server.serverId ? 'selected' : ''}`}
                    onClick={() => setSelectedServer(server)}
                  >
                    <div className="server-radio">
                      <input
                        type="radio"
                        name="server"
                        checked={selectedServer?.serverId === server.serverId}
                        onChange={() => setSelectedServer(server)}
                      />
                    </div>
                    <div className="server-info">
                      <div className="server-header">
                        <span className="server-name">
                          {server.name || `Server ${server.serverId || idx + 1}`}
                        </span>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="server-description">
                        {server.description || server.features?.join(", ")}
                      </div>
                      <div className="server-price">
                        {new Intl.NumberFormat('vi-VN').format(server.price || service.basePrice)} ₫
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phần chọn cảm xúc (nếu server hỗ trợ) */}
        {selectedServer?.supportsMultipleEmotions && (
          <div className="emotion-selection-section">
            <label className="section-label">Chọn loại cảm xúc:</label>
            <div className="emotion-list">
              {emotions.map((emotion) => (
                <button
                  key={emotion.code}
                  type="button"
                  className={`emotion-btn ${selectedEmotion === emotion.code ? 'selected' : ''}`}
                  onClick={() => setSelectedEmotion(emotion.code)}
                >
                  <span className="emotion-icon">{emotion.icon}</span>
                  <span className="emotion-label">{emotion.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bảng giá tham khảo */}
        {priceTable && (
          <PriceTable
            priceTable={priceTable.priceTable}
            unit={priceTable.unit}
            unitLabel={priceTable.unitLabel}
            onQuantitySelect={handleQuickQuantitySelect}
          />
        )}

        {/* Phần nhập số lượng và tính giá */}
        <div className="quantity-section">
          <label className="section-label">Số lượng ({service.unitLabel}):</label>
          <div className="quantity-input-wrapper">
            <input
              type="number"
              className="quantity-input"
              min={parseInt(service.unit)}
              step={parseInt(service.unit)}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || parseInt(service.unit))}
              placeholder={`Tối thiểu: ${service.unit}`}
            />
            <div className="quick-quantity-buttons">
              <button
                type="button"
                className="quick-qty-btn"
                onClick={() => handleQuickQuantitySelect(1000)}
              >
                1K
              </button>
              <button
                type="button"
                className="quick-qty-btn"
                onClick={() => handleQuickQuantitySelect(5000)}
              >
                5K
              </button>
              <button
                type="button"
                className="quick-qty-btn"
                onClick={() => handleQuickQuantitySelect(10000)}
              >
                10K
              </button>
              <button
                type="button"
                className="quick-qty-btn"
                onClick={() => handleQuickQuantitySelect(50000)}
              >
                50K
              </button>
            </div>
          </div>
          {service.processingTime && (
            <p className="processing-info">
              Thời gian xử lý: {service.processingTime} phút | 
              Hoàn thành: {service.completionTime || 60} phút
            </p>
          )}
        </div>

        {/* Hiển thị giá */}
        {priceInfo && (
          <div className="price-summary-section">
            <div className="price-summary">
              <div className="price-row">
                <span>Đơn giá:</span>
                <span>{new Intl.NumberFormat('vi-VN').format(priceInfo.unitPrice)} ₫ / {service.unit} {service.unitLabel}</span>
              </div>
              <div className="price-row">
                <span>Số lượng:</span>
                <span>{quantity} {service.unitLabel}</span>
              </div>
              <div className="price-row total">
                <span>Tổng cộng:</span>
                <span>{new Intl.NumberFormat('vi-VN').format(priceInfo.totalPrice)} ₫</span>
              </div>
            </div>
          </div>
        )}

        {/* Nút thêm vào giỏ hàng */}
        <div className="order-action-section">
          <button 
            className="order-btn secondary" 
            onClick={addToCart}
            disabled={calculating || !priceInfo || (service.servers && service.servers.length > 0 && !selectedServer)}
          >
            {calculating ? "Đang tính..." : "Thêm vào giỏ hàng"}
          </button>
          <button 
            className="order-btn primary" 
            onClick={handleOrderNow}
            disabled={calculating || !priceInfo || (service.servers && service.servers.length > 0 && !selectedServer)}
          >
            {calculating ? "Đang tính..." : "Đặt ngay"}
          </button>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section" style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Đánh giá dịch vụ</h3>
          
          {/* Review Form */}
          <ReviewForm 
            serviceId={id}
            onReviewSubmitted={loadReviews}
            onReviewUpdated={loadReviews}
            onReviewDeleted={loadReviews}
          />
          
          <div style={{ marginTop: '30px', marginBottom: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Chưa có đánh giá nào cho dịch vụ này</p>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                <p>
                  <strong>Tổng đánh giá:</strong> {reviews.length} đánh giá
                  {reviews.length > 0 && (
                    <>
                      <span style={{ marginLeft: '15px' }}>
                        <strong>Số người đánh giá:</strong> {new Set(reviews.map(r => {
                          if (typeof r.user === 'object' && r.user?._id) return r.user._id.toString();
                          if (typeof r.user === 'string') return r.user;
                          return null;
                        }).filter(Boolean)).size} người
                      </span>
                      <span style={{ marginLeft: '15px' }}>
                        <strong>Đánh giá trung bình:</strong> {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}/5
                        {'⭐'.repeat(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {review.user?.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#007bff',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}
                          >
                            {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <strong>{review.user?.name || 'Unknown'}</strong>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      {'⭐'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)} ({review.rating}/5)
                    </div>
                    {review.comment && (
                      <p style={{ margin: 0, color: '#333' }}>{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookServiceDetail;
