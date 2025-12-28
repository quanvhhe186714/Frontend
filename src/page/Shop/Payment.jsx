import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/apiService";
import "./shop.scss";

const Payment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [content, setContent] = useState("");
  const [bank, setBank] = useState("mb"); // mb bank
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    // Tự động tạo mã nội dung nếu chưa có
    if (!content) {
      const timestamp = Date.now();
      setContent(`MMOS-${timestamp}`);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  const generateQR = async () => {
    if (!amount || Number(amount) <= 0) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Vui lòng nhập số tiền hợp lệ';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/payments/qr", {
        params: { 
          amount: Number(amount), 
          content: content || `MMOS-${Date.now()}`,
          bank: bank
        },
      });
      setQrData({
        imageUrl: res.data.imageUrl,
        amount: Number(amount),
        content: content || `MMOS-${Date.now()}`,
        accountName: res.data.accountName || "",
        accountNo: res.data.accountNo || "",
        phone: res.data.phone || ""
      });
    } catch (error) {
      console.error("QR Code Error:", error);
      let errorMessage = "Không tạo được QR code";
      
      if (error.response) {
        // Server trả về lỗi
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        if (error.response.status === 401) {
          errorMessage = "Vui lòng đăng nhập để sử dụng tính năng này";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorMessage = "Không kết nối được với server. Vui lòng thử lại sau.";
      }
      
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = errorMessage;
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateQR();
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h2>Nạp tiền & Thanh toán</h2>
        
        {!qrData ? (
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Số tiền (VND)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số tiền cần nạp"
                required
                min="1000"
                step="1000"
              />
            </div>
            
            <div className="form-group">
              <label>Ngân hàng</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                <option value="mb">MB Bank</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Nội dung chuyển khoản</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="MMOS-XXXXX (để trống = mặc định)"
              />
              <small>Để trống để dùng nội dung mặc định</small>
            </div>
            
            <button type="submit" className="payment-generate-btn" disabled={loading}>
              {loading ? "Đang tạo QR code..." : "Tạo QR code thanh toán"}
            </button>
          </form>
        ) : (
          <div className="qr-display">
            <div className="qr-card">
              {qrData.accountName && (
                <div className="qr-recipient">
                  <div className="qr-recipient-icon">⭐</div>
                  <div className="qr-recipient-info">
                    <div className="qr-recipient-name">{qrData.accountName}</div>
                    {qrData.phone && <div className="qr-recipient-phone">{qrData.phone}</div>}
                  </div>
                </div>
              )}
              
              <div className="qr-code-wrapper">
                <img src={qrData.imageUrl} alt="VietQR" className="qr-code-image" />
              </div>
              
              <div className="qr-info">
                <p className="qr-amount">
                  Số tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrData.amount)}</strong>
                </p>
                <p className="qr-content-text">
                  Nội dung: <strong>{qrData.content}</strong>
                </p>
              </div>
              
              <div className="qr-logos">
                <span className="qr-logo-vietqr">VIETQR</span>
                <span className="qr-logo-napas">napas 247</span>
              </div>
            </div>
            
            <div className="qr-actions">
              <button 
                className="qr-back-btn" 
                onClick={() => {
                  setQrData(null);
                  setAmount("");
                }}
              >
                Tạo QR mới
              </button>
              <button 
                className="qr-close-btn" 
                onClick={() => navigate("/profile")}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;

