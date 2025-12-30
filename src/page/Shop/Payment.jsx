import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/apiService";
import { getPublicCustomQRs } from "../../services/customQR";
import { recordPaymentFromQR, checkTransactionStatus } from "../../services/wallet";
import QRCodeModal from "../../components/QRCodeModal/QRCodeModal";
import "./shop.scss";

const Payment = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create"); // "create" or "custom"
  const [amount, setAmount] = useState("");
  const [content, setContent] = useState("");
  const [bank, setBank] = useState("mb"); // mb bank
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  
  // Custom QR states
  const [customQRs, setCustomQRs] = useState([]);
  const [customQRsLoading, setCustomQRsLoading] = useState(false);
  const [selectedCustomQR, setSelectedCustomQR] = useState(null);
  const [recordingPayment, setRecordingPayment] = useState(false);
  
  // SePay webhook polling states
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'
  const [pollingInterval, setPollingInterval] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    // Tự động tạo mã nội dung nếu chưa có
    if (!content) {
      const timestamp = Date.now();
      setContent(`MMOS-${timestamp}`);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  useEffect(() => {
    // Fetch custom QR codes when switching to custom tab
    if (activeTab === "custom") {
      fetchCustomQRs();
    }
  }, [activeTab]);

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

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

  // Polling để check payment status từ SePay webhook
  const startPollingPaymentStatus = (referenceCode) => {
    // Clear previous polling nếu có
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setPaymentStatus('pending');

    // Poll mỗi 3 giây
    pollingRef.current = setInterval(async () => {
      try {
        const response = await checkTransactionStatus(referenceCode);
        const transaction = response.data;

        if (transaction) {
          if (transaction.status === 'completed' || transaction.status === 'success') {
            setPaymentStatus('success');
            clearInterval(pollingRef.current);
            pollingRef.current = null;

            // Show success message
            const el = document.createElement('div');
            el.className = 'simple-toast';
            el.style.background = '#4caf50';
            el.innerText = '✅ Thanh toán thành công! Số tiền đã được cập nhật vào ví.';
            document.body.appendChild(el);
            setTimeout(() => {
              if (document.body.contains(el)) {
                document.body.removeChild(el);
              }
            }, 5000);

            // Redirect to profile after 2 seconds
            setTimeout(() => {
              navigate("/profile", { 
                state: { 
                  message: "Thanh toán thành công! Số tiền đã được cập nhật vào ví của bạn." 
                } 
              });
            }, 2000);
          } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
            setPaymentStatus('failed');
            clearInterval(pollingRef.current);
            pollingRef.current = null;

            const el = document.createElement('div');
            el.className = 'simple-toast';
            el.style.background = '#f44336';
            el.innerText = '❌ Thanh toán thất bại hoặc đã bị hủy.';
            document.body.appendChild(el);
            setTimeout(() => {
              if (document.body.contains(el)) {
                document.body.removeChild(el);
              }
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Continue polling on error
      }
    }, 3000);

    // Stop polling after 5 minutes (100 checks)
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        if (paymentStatus === 'pending') {
          setPaymentStatus(null);
        }
      }
    }, 300000); // 5 minutes
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
    setPaymentStatus(null);
    
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    try {
      const referenceCode = content || `MMOS-${Date.now()}`;
      
      // Tạo transaction request trước (để backend có thể match với webhook từ SePay)
      // Backend sẽ tạo transaction với status 'pending' và referenceCode này
      // Khi SePay gửi webhook với referenceCode này, backend sẽ tự động cập nhật
      try {
        await api.post("/wallet/topup", {
          amount: Number(amount),
          method: "sepay",
          bank: bank,
          referenceCode: referenceCode,
          note: `Nạp tiền qua QR SePay - ${referenceCode}`
        });
      } catch (topupError) {
        // Nếu transaction đã tồn tại hoặc lỗi, vẫn tiếp tục tạo QR
        console.warn("Topup request creation:", topupError.response?.data || topupError.message);
        // Continue even if topup request fails (might already exist or backend handles differently)
      }

      // Tạo QR code với referenceCode
      const res = await api.get("/payments/qr", {
        params: { 
          amount: Number(amount), 
          content: referenceCode,
          bank: bank
        },
      });
      
      setQrData({
        imageUrl: res.data.imageUrl,
        amount: Number(amount),
        content: referenceCode,
        accountName: res.data.accountName || "",
        accountNo: res.data.accountNo || "",
        phone: res.data.phone || "",
        referenceCode: referenceCode
      });

      // Bắt đầu polling để check payment status từ webhook
      startPollingPaymentStatus(referenceCode);
      
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

  const formatAmount = (amount) => {
    if (!amount) return 'Không xác định';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getBankName = (bank) => {
    const bankMap = {
      mb: 'MB Bank',
      vietinbank: 'VietinBank',
      momo: 'MoMo',
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
                
                {/* Payment Status Indicator */}
                {paymentStatus && (
                  <div className={`payment-status-indicator status-${paymentStatus}`}>
                    {paymentStatus === 'pending' && (
                      <>
                        <div className="status-spinner"></div>
                        <span>Đang chờ thanh toán... (Tự động cập nhật khi có giao dịch)</span>
                      </>
                    )}
                    {paymentStatus === 'success' && (
                      <>
                        <span className="status-icon">✅</span>
                        <span>Thanh toán thành công! Đang chuyển hướng...</span>
                      </>
                    )}
                    {paymentStatus === 'failed' && (
                      <>
                        <span className="status-icon">❌</span>
                        <span>Thanh toán thất bại hoặc đã bị hủy.</span>
                      </>
                    )}
                  </div>
                )}

                <div className="qr-actions">
                  <button 
                    className="qr-back-btn" 
                    onClick={() => {
                      // Stop polling
                      if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                      }
                      setQrData(null);
                      setAmount("");
                      setPaymentStatus(null);
                    }}
                  >
                    Tạo QR mới
                  </button>
                  <button 
                    className="qr-close-btn" 
                    onClick={() => {
                      // Stop polling
                      if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                      }
                      navigate("/profile");
                    }}
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

