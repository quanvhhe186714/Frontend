import React from "react";
import { useNavigate } from "react-router-dom";
import "./portal.scss";

const DichVu = () => {
  const navigate = useNavigate();
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
            <li>• Telegram</li>
            <li>• Facebook</li>
            <li>• TikTok</li>
            <li>• Youtube</li>
            <li>• Khác</li>
          </ul>
        </aside>

        <div className="market-list">
          <div className="service-card">
            <div className="thumb">
              <img src="/telepremium.png" alt="Telegram Premium" />
            </div>
            <div className="meta">
              <h3>Telegram Premium (Chính chủ)</h3>
              <p>Gói 1/3/6/12 tháng. Kích hoạt nhanh, bảo hành đầy đủ.</p>
            </div>
            <div className="actions">
              <div className="price">130.000đ - 900.000đ</div>
              <button className="link-btn" onClick={() => navigate("/products")}>
                Xem các gói
              </button>
            </div>
          </div>

          {/* Placeholder cho các dịch vụ khác */}
          <div className="service-card">
            <div className="thumb">
              <img src="https://via.placeholder.com/96x96" alt="Service" />
            </div>
            <div className="meta">
              <h3>Dịch vụ mạng xã hội (tham khảo)</h3>
              <p>Tăng tương tác, tối ưu hồ sơ, nội dung... (sắp triển khai)</p>
            </div>
            <div className="actions">
              <div className="price">Liên hệ</div>
              <button className="link-btn" onClick={() => alert("Sắp có")}>
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DichVu;


