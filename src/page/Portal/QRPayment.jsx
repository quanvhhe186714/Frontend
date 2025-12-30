import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/apiService";
import walletService, { getSePayAccountInfo, checkTransactionStatus } from "../../services/wallet";
import { debugQRCode, generateCorrectQRUrl } from "../../utils/qrDebugHelper";
import "./QRPayment.scss";

const QRPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [sepayAccountInfo, setSepayAccountInfo] = useState(null);
  const [loadingAccountInfo, setLoadingAccountInfo] = useState(false);
  
  // QR Generation states
  const [amount, setAmount] = useState("");
  const [content, setContent] = useState("");
  const [bank, setBank] = useState("mb");
  const [generatingQR, setGeneratingQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  
  // Payment status polling
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch SePay account info và tự động generate QR
  useEffect(() => {
    const fetchSePayAccountInfo = async () => {
      try {
        setLoading(true);
        setLoadingAccountInfo(true);
        const response = await getSePayAccountInfo();
        // Response có thể là { success: true, data: {...} } hoặc trực tiếp là data
        const accountData = response.data?.data || response.data;
        setSepayAccountInfo(accountData);
        
        // Tự động tạo referenceCode
        if (!content) {
          const timestamp = Date.now();
          setContent(`PAYMENT-${timestamp}`);
        }
      } catch (err) {
        console.error("Error fetching SePay account info:", err);
        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin tài khoản SePay. Vui lòng thử lại sau."
        );
      } finally {
        setLoadingAccountInfo(false);
        setLoading(false);
      }
    };

    fetchSePayAccountInfo();
  }, []);

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Refresh wallet balance
  const refreshWalletBalance = async () => {
    try {
      const response = await walletService.getWallet();
      if (response.data?.wallet) {
        console.log('✅ Wallet balance refreshed:', response.data.wallet);
        // Có thể emit event hoặc update context/state global ở đây
        // Ví dụ: window.dispatchEvent(new CustomEvent('walletUpdated', { detail: response.data.wallet }));
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success', duration = 5000) => {
    const el = document.createElement('div');
    el.className = 'simple-toast';
    el.style.background = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#ff9800';
    el.style.color = '#fff';
    el.style.padding = '12px 20px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    el.style.zIndex = '10000';
    el.style.position = 'fixed';
    el.style.top = '20px';
    el.style.right = '20px';
    el.style.maxWidth = '400px';
    el.style.fontSize = '14px';
    el.style.fontWeight = '500';
    el.innerText = message;
    document.body.appendChild(el);
    
    setTimeout(() => {
      if (document.body.contains(el)) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          if (document.body.contains(el)) {
            document.body.removeChild(el);
          }
        }, 300);
      }
    }, duration);
  };

  // Polling để check payment status từ backend theo transactionId (Cách 1: Polling Transaction Status - Khuyến nghị)
  const startPollingPaymentStatus = (transactionId) => {
    // Clear previous polling nếu có
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setPaymentStatus('pending');

    if (!transactionId) {
      console.warn("startPollingPaymentStatus called without transactionId");
      return;
    }

    // Function để check transaction status theo transactionId
    const checkStatus = async () => {
      try {
        // Backend: GET /wallet/transactions/status/:transactionId
        const response = await checkTransactionStatus(transactionId);

        // Backend có thể trả về { transaction, wallet } hoặc trực tiếp transaction
        const data = response.data || {};
        // Backend trả về { success, transaction, wallet }
        const tx = data.transaction || data;
        const wallet = data.wallet;

        if (tx) {
          setCurrentTransaction(tx);

          // Nếu backend trả về wallet mới, phát event để Profile (và nơi khác) có thể cập nhật ngay
          if (wallet) {
            try {
              window.dispatchEvent(
                new CustomEvent("walletUpdated", {
                  detail: wallet,
                })
              );
            } catch (e) {
              console.warn("Could not dispatch walletUpdated event:", e);
            }
          }
          
          if (tx.status === 'completed' || tx.status === 'success') {
            // Dừng polling
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            setPaymentStatus('success');

            // ✅ Hiển thị thông báo thành công với thông tin chi tiết
            const amountFormatted = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(tx.amount || Number(amount));
            
            showToast(
              `✅ Nạp tiền thành công! ${amountFormatted} đã được cập nhật vào ví của bạn.`,
              'success',
              6000
            );

            // ✅ Refresh wallet balance
            await refreshWalletBalance();
          } else if (tx.status === 'failed' || tx.status === 'cancelled') {
            // Dừng polling
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            setPaymentStatus('failed');
            showToast('❌ Thanh toán thất bại hoặc đã bị hủy.', 'error', 4000);
          }
          // Nếu vẫn pending, tiếp tục polling
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Continue polling on error (không dừng khi có lỗi network tạm thời)
      }
    };

    // ✅ Check ngay lập tức (không đợi interval đầu tiên)
    checkStatus();

    // ✅ Polling mỗi 1.5 giây (nhanh hơn để user nhận thông báo sớm)
    pollingRef.current = setInterval(checkStatus, 1500);

    // ✅ Dừng polling sau 5 phút
    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (paymentStatus === 'pending') {
        setPaymentStatus(null);
        showToast('⏱️ Đã hết thời gian chờ. Vui lòng kiểm tra lại sau.', 'error', 4000);
      }
    }, 300000); // 5 minutes
  };

  // Generate QR code: Tạo transaction TRƯỚC, rồi mới lấy QR và bắt đầu polling
  const generateQR = async () => {
    if (!amount || Number(amount) <= 0) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Vui lòng nhập số tiền hợp lệ';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 2000);
      return;
    }

    setGeneratingQR(true);
    setError("");
    setPaymentStatus(null);
    
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    try {
      // 1. Tạo transaction TRƯỚC KHI hiển thị QR code
      // Backend sẽ tạo transaction với referenceCode và status = 'pending'
      const topupResponse = await api.post("/wallet/topup", {
        amount: Number(amount),
        method: "bank_transfer", // theo tài liệu backend
        bank: bank,
      });

      const { transaction, instructions } = topupResponse.data || {};

      if (!transaction || !transaction._id) {
        throw new Error("Không nhận được transaction từ backend");
      }

      const transactionId = transaction._id;
      const referenceCode =
        transaction.referenceCode || instructions?.referenceCode;

      setCurrentTransaction(transaction);
      console.log("✅ Transaction created:", {
        id: transactionId,
        referenceCode,
        amount: transaction.amount,
      });

      // 2. Tạo QR code với referenceCode từ transaction/instructions
      const res = await api.get("/payments/qr", {
        params: {
          amount: instructions?.amount || Number(amount),
          content: referenceCode,
          bank: bank,
        },
      });
      
      // Lấy accountName từ nhiều nguồn để đảm bảo có dữ liệu
      // Ưu tiên: res.data.accountName > sepayAccountInfo.accountName > ""
      // Nếu API không trả về, lấy từ sepayAccountInfo đã fetch trước đó
      let accountName = res.data?.accountName || sepayAccountInfo?.accountName || "";
      let accountNo = res.data?.accountNo || sepayAccountInfo?.accountNo || "";
      
      // Debug logs để kiểm tra với helper
      const validation = debugQRCode(res.data, sepayAccountInfo);
      
      // Nếu QR URL có accountName, ưu tiên sử dụng nó
      if (validation.qrUrlInfo?.accountName) {
        accountName = validation.qrUrlInfo.accountName;
        console.log("Using accountName from QR URL:", accountName);
      }
      
      // Nếu backend trả về sai, tạo QR URL đúng
      let finalQrUrl = res.data?.imageUrl;
      if (!validation.isValid && res.data?.imageUrl) {
        console.warn("⚠️ Backend trả về QR URL sai. Tạo QR URL đúng...");
        finalQrUrl = generateCorrectQRUrl({
          amount: Number(amount),
          content: referenceCode,
          accountNo: "77891011121314",
          accountName: "TRAN DANG LINH",
          bin: "970422"
        });
        console.log("✅ QR URL đúng đã được tạo:", finalQrUrl);
      }
      
      // Thông tin tài khoản đúng (theo tài liệu)
      const EXPECTED_ACCOUNT_NAME = "TRAN DANG LINH";
      const EXPECTED_ACCOUNT_NO = "77891011121314";
      
      // Kiểm tra và override nếu backend trả về sai
      let finalAccountName = accountName;
      let finalAccountNo = accountNo;
      let accountMismatch = false;
      
      if (accountName && accountName.toUpperCase() !== EXPECTED_ACCOUNT_NAME.toUpperCase()) {
        console.warn("⚠️ WARNING: Account name mismatch!");
        console.warn(`Expected: ${EXPECTED_ACCOUNT_NAME}, Got: ${accountName}`);
        console.warn("Backend may be returning incorrect account information.");
        console.warn("Overriding with correct account name for display.");
        accountMismatch = true;
        // Override với thông tin đúng để hiển thị trong UI
        finalAccountName = EXPECTED_ACCOUNT_NAME;
      }
      
      if (accountNo && accountNo !== EXPECTED_ACCOUNT_NO) {
        console.warn("⚠️ WARNING: Account number mismatch!");
        console.warn(`Expected: ${EXPECTED_ACCOUNT_NO}, Got: ${accountNo}`);
        console.warn("Backend may be returning incorrect account information.");
        console.warn("Overriding with correct account number for display.");
        accountMismatch = true;
        // Override với thông tin đúng để hiển thị trong UI
        finalAccountNo = EXPECTED_ACCOUNT_NO;
      }
      
      // Nếu không có thông tin từ API, sử dụng thông tin đúng
      if (!finalAccountName) {
        finalAccountName = EXPECTED_ACCOUNT_NAME;
      }
      if (!finalAccountNo) {
        finalAccountNo = EXPECTED_ACCOUNT_NO;
      }
      
      console.log("Final Account Name:", finalAccountName);
      console.log("Final Account No:", finalAccountNo);
      console.log("Account Mismatch Detected:", accountMismatch);
      
      // Nếu vẫn không có accountName, thử fetch lại sepayAccountInfo
      if (!accountName && !sepayAccountInfo) {
        try {
          const accountInfoResponse = await getSePayAccountInfo();
          const accountData = accountInfoResponse.data?.data || accountInfoResponse.data;
          setSepayAccountInfo(accountData);
          
          // Sử dụng accountName từ response mới
          let tempAccountName = accountData?.accountName || "";
          let tempAccountNo = accountData?.accountNo || "";
          
          // Override nếu không đúng
          const EXPECTED_ACCOUNT_NAME = "TRAN DANG LINH";
          const EXPECTED_ACCOUNT_NO = "77891011121314";
          
          if (tempAccountName && tempAccountName.toUpperCase() !== EXPECTED_ACCOUNT_NAME.toUpperCase()) {
            tempAccountName = EXPECTED_ACCOUNT_NAME;
          }
          if (tempAccountNo && tempAccountNo !== EXPECTED_ACCOUNT_NO) {
            tempAccountNo = EXPECTED_ACCOUNT_NO;
          }
          
          if (!tempAccountName) tempAccountName = EXPECTED_ACCOUNT_NAME;
          if (!tempAccountNo) tempAccountNo = EXPECTED_ACCOUNT_NO;
          
          setQrData({
            imageUrl: res.data.imageUrl,
            amount: Number(amount),
            content: referenceCode,
            accountName: tempAccountName,
            accountNo: tempAccountNo,
            phone: res.data?.phone || "",
            referenceCode: referenceCode,
            accountMismatch: true
          });
          return;
        } catch (err) {
          console.error("Error fetching account info again:", err);
        }
      }
      
      setQrData({
        imageUrl: finalQrUrl || res.data.imageUrl, // Sử dụng QR URL đúng nếu đã tạo
        amount: Number(amount),
        content: referenceCode,
        accountName: finalAccountName,
        accountNo: finalAccountNo,
        phone: res.data?.phone || "",
        referenceCode: referenceCode,
        accountMismatch: accountMismatch || !validation.isValid // Flag để hiển thị warning trong UI
      });

      // 3. Bắt đầu polling theo transactionId
      // ✅ Sử dụng interval ngắn (1.5 giây) để nhận thông báo nhanh hơn
      startPollingPaymentStatus(transactionId);
      
    } catch (error) {
      console.error("QR Code Error:", error);
      let errorMessage = "Không tạo được QR code";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        if (error.response.status === 401) {
          errorMessage = "Vui lòng đăng nhập để sử dụng tính năng này";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
        }
      } else if (error.request) {
        errorMessage = "Không kết nối được với server. Vui lòng thử lại sau.";
      }
      
      setError(errorMessage);
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading || loadingAccountInfo) {
    return (
      <div className="qr-payment-container">
        <div className="loading-message">Đang tải thông tin tài khoản...</div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="qr-payment-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="qr-payment-container">
      <div className="qr-payment-wrapper">
        <h2 className="page-title">Thanh toán qua QR</h2>
        <p className="page-subtitle">
          Tạo QR code thanh toán của bạn. Sau khi thanh toán, hệ thống sẽ tự động cập nhật số tiền vào ví.
        </p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-banner">
            {successMessage}
          </div>
        )}

        {/* Form tạo QR code */}
        {!qrData ? (
          <div className="qr-generate-section">
            <h3 className="section-title">Tạo QR code thanh toán</h3>
            <form className="qr-generate-form" onSubmit={(e) => { e.preventDefault(); generateQR(); }}>
              <div className="form-group">
                <label>Số tiền (VND) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền cần thanh toán"
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
                  placeholder="PAYMENT-XXXXX (để trống = tự động tạo)"
                />
                <small>Để trống để hệ thống tự động tạo mã</small>
              </div>
              
              <button 
                type="submit" 
                className="generate-qr-btn" 
                disabled={generatingQR}
              >
                {generatingQR ? "Đang tạo QR code..." : "Tạo QR code thanh toán"}
              </button>
            </form>
          </div>
        ) : (
          <div className="qr-detail-section">
            <h3 className="section-title">Chi tiết thanh toán</h3>
            
            <div className="qr-detail-card">
              <div className="qr-detail-left">
                <div className="qr-detail-name">QR Thanh toán của bạn</div>
                {qrData.imageUrl && (
                  <img
                    src={qrData.imageUrl}
                    alt="QR Code"
                    className="qr-detail-image"
                  />
                )}
              </div>

              <div className="qr-detail-right">
                <div className="amount-box">
                  <div className="amount-label">Số tiền cần thanh toán</div>
                  <div className="amount-value">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(qrData.amount)}
                  </div>
                </div>

                {/* Warning nếu có mismatch */}
                {qrData.accountMismatch && (
                  <div className="account-mismatch-warning" style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    color: '#856404'
                  }}>
                    <strong>⚠️ Lưu ý:</strong> Backend đã trả về thông tin tài khoản không chính xác. 
                    Thông tin hiển thị bên dưới đã được điều chỉnh để đảm bảo chính xác. 
                    Vui lòng kiểm tra lại QR code và thông tin tài khoản trước khi chuyển khoản.
                  </div>
                )}

                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Mã giao dịch</div>
                    <div className="info-value">{qrData.content}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">Nội dung chuyển khoản</div>
                    <div className="info-value">{qrData.content}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">Tên tài khoản</div>
                    <div className="info-value" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {qrData.accountName || sepayAccountInfo?.accountName || "TRAN DANG LINH"}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">Số tài khoản</div>
                    <div className="info-value" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {qrData.accountNo || sepayAccountInfo?.accountNo || "77891011121314"}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">Ngân hàng</div>
                    <div className="info-value">{bank.toUpperCase()}</div>
                  </div>
                </div>

                {/* Payment Status Indicator */}
                {paymentStatus && (
                  <div className={`payment-status-indicator status-${paymentStatus}`}>
                    {paymentStatus === 'pending' && (
                      <>
                        <div className="status-spinner"></div>
                        <div>
                          <strong>⏳ Đang chờ thanh toán...</strong>
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                            Hệ thống đang tự động kiểm tra trạng thái giao dịch (mỗi 1.5 giây).
                            Bạn sẽ nhận thông báo ngay khi thanh toán thành công.
                          </p>
                          {currentTransaction && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                              Mã giao dịch: {currentTransaction._id?.substring(0, 8) || 'N/A'}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {paymentStatus === 'success' && (
                      <>
                        <span className="status-icon">✅</span>
                        <div>
                          <strong>Thanh toán thành công!</strong>
                          {currentTransaction && (
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                              Số tiền: {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(currentTransaction.amount || qrData.amount)}
                            </p>
                          )}
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                            Bạn có thể quay lại trang hồ sơ để xem số dư mới.
                          </p>
                        </div>
                      </>
                    )}
                    {paymentStatus === 'failed' && (
                      <>
                        <span className="status-icon">❌</span>
                        <div>
                          <strong>Thanh toán thất bại hoặc đã bị hủy.</strong>
                          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                            Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="payment-instructions">
                  <h4>Hướng dẫn thanh toán:</h4>
                  <ul>
                    <li>Mở ứng dụng ngân hàng hoặc ví điện tử của bạn.</li>
                    <li>
                      Chọn chức năng quét mã QR và đưa camera vào mã bên trái.
                    </li>
                    <li>
                      Kiểm tra lại số tiền, tên tài khoản và nội dung chuyển
                      khoản trước khi xác nhận.
                    </li>
                    <li>
                      Sau khi thanh toán, hệ thống sẽ tự động cập nhật số tiền vào ví của bạn (thông qua webhook SePay).
                    </li>
                    <li>
                      Vui lòng lưu lại biên lai hoặc screenshot để làm bằng chứng.
                    </li>
                  </ul>
                </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPayment;
