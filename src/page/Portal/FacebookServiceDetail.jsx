import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import facebookService from "../../services/facebook/facebookService";
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

  // Danh sách cảm xúc Facebook
  const emotions = [
    { code: "like", icon: "👍", label: "Like" },
    { code: "love", icon: "❤️", label: "Love" },
    { code: "haha", icon: "😂", label: "Haha" },
    { code: "wow", icon: "😮", label: "Wow" },
    { code: "sad", icon: "😢", label: "Sad" },
    { code: "angry", icon: "😠", label: "Angry" }
  ];

  useEffect(() => {
    loadService();
  }, [id]);

  useEffect(() => {
    if (service && quantity) {
      calculatePrice();
    }
  }, [quantity, service, selectedServer, selectedEmotion]);

  const loadService = async () => {
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
    } catch (error) {
      console.error("Failed to load service", error);
      navigate("/dich-vu");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
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
          <h1>{service.name}</h1>
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

        {/* Phần nhập số lượng và tính giá */}
        <div className="quantity-section">
          <label className="section-label">Số lượng ({service.unitLabel}):</label>
          <input
            type="number"
            className="quantity-input"
            min={parseInt(service.unit)}
            step={parseInt(service.unit)}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || parseInt(service.unit))}
            placeholder={`Tối thiểu: ${service.unit}`}
          />
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
            className="order-btn" 
            onClick={addToCart}
            disabled={calculating || !priceInfo || (service.servers && service.servers.length > 0 && !selectedServer)}
          >
            {calculating ? "Đang tính..." : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacebookServiceDetail;
