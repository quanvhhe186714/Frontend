import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import api from "../../services/apiService";
import { BANKS, BANK_MAP, buildVietQrUrl } from "../../utils/banks";
import { getPublicCustomQRs } from "../../services/customQR";
import { recordPaymentFromQR } from "../../services/wallet";
import { generatePaymentQR } from "../../services/payment";
import QRCodeModal from "../../components/QRCodeModal/QRCodeModal";
import "./shop.scss";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("create"); // "create" or "custom"
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("vietin"); // VietinBank
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  
  // Custom QR states
  const [customQRs, setCustomQRs] = useState([]);
  const [customQRsLoading, setCustomQRsLoading] = useState(false);
  const [selectedCustomQR, setSelectedCustomQR] = useState(null);
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Kiểm tra nếu có thông tin từ trang QRPayment
  useEffect(() => {
    if (location.state?.fromQRPayment) {
      // Chuyển sang tab "Tạo QR mới" và set ngân hàng đã chọn
      setActiveTab("create");
      
      // Tự động chọn ngân hàng từ QR code đã chọn
      if (location.state.selectedBank) {
        setBank(location.state.selectedBank);
      }
      
      // Số tiền: User sẽ tự điền, không tự động điền
      
      // Clear state để tránh hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch custom QR codes when switching to custom tab
    if (activeTab === "custom") {
      fetchCustomQRs();
    }
  }, [activeTab]);

  const fetchCustomQRs = async () => {
    try {
      setCustomQRsLoading(true);
      const { data } = await getPublicCustomQRs();
      setCustomQRs(data || []);
    } catch (error) {
      console.error("Error fetching custom QR codes:", error);
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Không thể tải danh sách QR code tùy chỉnh';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);
    } finally {
      setCustomQRsLoading(false);
    }
  };

  const handleCustomQRClick = (qr) => {
    setSelectedCustomQR(qr);
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomQR) return;

    try {
      setRecordingPayment(true);
      await recordPaymentFromQR(selectedCustomQR._id, "Đã thanh toán qua QR code tùy chỉnh");
      
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Ghi nhận thanh toán thành công! Vui lòng chờ admin xác nhận.';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);

      setSelectedCustomQR(null);
      // Optionally refresh custom QR list
      fetchCustomQRs();
    } catch (error) {
      console.error("Error recording payment:", error);
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = error.response?.data?.message || 'Không thể ghi nhận thanh toán. Vui lòng thử lại.';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);
    } finally {
      setRecordingPayment(false);
    }
  };

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
      // Gọi API backend - chỉ cần gửi số tiền, backend tự động xử lý nội dung
      // Backend sẽ tự động tìm trong file JSON hoặc dùng mặc định
      const response = await generatePaymentQR(Number(amount), bank);
      
      if (response.data) {
        setQrData({
          imageUrl: BANK_MAP[bank]?.qrImage || response.data.imageUrl,
          amount: response.data.amount,
          content: response.data.content,
          accountName: response.data.accountName,
          accountNo: response.data.accountNo,
          phone: response.data.phone || "",
          bank: response.data.bank,
        });
      }
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
        } else if (error.response.status === 404) {
          errorMessage = "API endpoint không tồn tại. Vui lòng kiểm tra backend.";
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

  const formatAmount = (amount) => {
    if (!amount) return 'Không xác định';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getBankName = (bank) => {
    const bankMap = {
      vietin: 'VietinBank',
      hdbank: 'HDBank',
      bidv: 'BIDV',
      bidv_hieu: 'BIDV',
      ocb: 'OCB',
      ocb_ca: 'OCB',
    };
    return bankMap[bank] || bank;
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h2>Nạp tiền & Thanh toán</h2>
        
        {/* Tabs */}
        <div className="payment-tabs">
          <button
            className={`payment-tab ${activeTab === "create" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("create");
              setQrData(null);
            }}
          >
            Tạo QR mới
          </button>
          <button
            className={`payment-tab ${activeTab === "custom" ? "active" : ""}`}
            onClick={() => setActiveTab("custom")}
          >
            QR Tùy chỉnh
          </button>
        </div>

        {/* Tab Content: Create QR */}
        {activeTab === "create" && (
          <>
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
                    <option value="vietin">VietinBank</option>
                    <option value="hdbank">HDBank</option>
                    <option value="bidv">BIDV (HONG CON BINH)</option>
                    <option value="bidv_hieu">BIDV (VO MINH HIEU)</option>
                    <option value="ocb">OCB (NGUYEN DOAN LUAN)</option>
                    <option value="ocb_ca">OCB (NGO VAN CA)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#e7f3ff', 
                    borderRadius: '4px',
                    border: '1px solid #b3d9ff',
                    marginTop: '8px'
                  }}>
                    <p style={{ margin: 0, color: '#0066cc', fontSize: '14px' }}>
                      ℹ️ <strong>Nội dung tự động:</strong>
                    </p>
                  </div>
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
                  
                  {qrData.imageUrl && (
                    <>
                      <div className="qr-code-wrapper">
                        <img src={qrData.imageUrl} alt="VietQR" className="qr-code-image" />
                      </div>
                      <div className="qr-logos">
                        <span className="qr-logo-vietqr">VIETQR</span>
                        <span className="qr-logo-napas">napas 247</span>
                      </div>
                    </>
                  )}

                  <div className="qr-info">
                    <p className="qr-amount">
                      Số tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrData.amount)}</strong>
                    </p>
                    <p className="qr-content-text">
                      Nội dung: <strong>{qrData.content}</strong>
                    </p>
                    <p className="qr-content-text">
                      Ngân hàng: <strong>{qrData.bank}</strong>
                    </p>
                    <p className="qr-content-text">
                      Số TK: <strong>{qrData.accountNo}</strong>
                    </p>
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
          </>
        )}

        {/* Tab Content: Custom QR */}
        {activeTab === "custom" && (
          <div className="custom-qr-section">
            {customQRsLoading ? (
              <div className="loading-spinner">Đang tải QR codes...</div>
            ) : customQRs.length === 0 ? (
              <div className="empty-state">
                <p>Hiện tại chưa có QR code tùy chỉnh nào được kích hoạt.</p>
              </div>
            ) : (
              <div className="custom-qr-grid">
                {customQRs.map((qr) => (
                  <div key={qr._id} className="custom-qr-card">
                    <div className="custom-qr-card-header">
                      <h3>{qr.name}</h3>
                    </div>
                    <div className="custom-qr-card-body">
                      <div className="custom-qr-image-wrapper">
                        <img
                          src={qr.imageUrl}
                          alt={qr.name}
                          className="custom-qr-image"
                          onClick={() => handleCustomQRClick(qr)}
                        />
                      </div>
                      <div className="custom-qr-info">
                        {qr.amount && (
                          <div className="custom-qr-info-item">
                            <span className="custom-qr-info-label">Số tiền:</span>
                            <span className="custom-qr-info-value">{formatAmount(qr.amount)}</span>
                          </div>
                        )}
                        {qr.content && (
                          <div className="custom-qr-info-item">
                            <span className="custom-qr-info-label">Nội dung:</span>
                            <span className="custom-qr-info-value">{qr.content}</span>
                          </div>
                        )}
                        {qr.accountName && (
                          <div className="custom-qr-info-item">
                            <span className="custom-qr-info-label">Người nhận:</span>
                            <span className="custom-qr-info-value">{qr.accountName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="custom-qr-card-footer">
                      <button
                        className="custom-qr-select-btn"
                        onClick={() => handleCustomQRClick(qr)}
                      >
                        Chọn QR này
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for Custom QR with Payment Button */}
        {selectedCustomQR && (
          <div
            className="custom-qr-modal-overlay"
            onClick={() => setSelectedCustomQR(null)}
          >
            <div
              className="custom-qr-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="custom-qr-modal-close"
                onClick={() => setSelectedCustomQR(null)}
              >
                ×
              </button>
              <QRCodeModal
                qrData={selectedCustomQR}
                onClose={() => setSelectedCustomQR(null)}
              />
              <div className="custom-qr-modal-actions">
                <button
                  className="custom-qr-payment-btn"
                  onClick={handleRecordPayment}
                  disabled={recordingPayment}
                >
                  {recordingPayment ? "Đang xử lý..." : "Đã thanh toán"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;

