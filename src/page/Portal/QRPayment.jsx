import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCustomQRs, getPublishedQRDetail } from "../../services/customQR";
import walletService from "../../services/wallet";
import "./QRPayment.scss";

const QRPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrList, setQrList] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [qrDetail, setQrDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPublished = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPublishedCustomQRs();
        const data = response?.data || [];

        if (!data || data.length === 0) {
          setQrList([]);
        } else {
          setQrList(data);
          // Không tự động chọn QR đầu tiên nữa
        }
      } catch (err) {
        console.error("Error fetching published QR:", err);
        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin QR thanh toán. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublished();
  }, []);

  // Khi user chọn QR, fetch chi tiết đầy đủ
  const handleSelectQR = async (qr) => {
    try {
      setLoadingDetail(true);
      setError("");
      setSelectedQR(qr);
      setQrDetail(null); // Reset detail khi chọn QR mới
      
      // Fetch chi tiết đầy đủ từ API
      const { data } = await getPublishedQRDetail(qr._id);
      setQrDetail(data);
      
      // Scroll to detail section
      setTimeout(() => {
        const detailSection = document.querySelector('.qr-detail-section');
        if (detailSection) {
          detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching QR detail:", err);
      setError(err.response?.data?.message || "Không thể tải chi tiết QR code");
      setQrDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Tạo transaction khi user xác nhận thanh toán
  const handleConfirmPayment = async () => {
    if (!selectedQR || !qrDetail) return;

    try {
      setSubmitting(true);
      setError("");
      
      // Gọi API tạo transaction
      const note = qrDetail.content || qrDetail.transactionCode || `Thanh toán qua QR: ${qrDetail.name}`;
      await walletService.recordPaymentFromQR(selectedQR._id, note);
      
      setSuccessMessage("Đã tạo yêu cầu nạp tiền thành công! Đang chuyển đến trang profile...");
      
      // Redirect về profile sau 2 giây
      setTimeout(() => {
        navigate("/profile", { 
          state: { 
            message: "Đã tạo yêu cầu nạp tiền. Vui lòng chờ admin xác nhận thanh toán." 
          } 
        });
      }, 2000);
    } catch (err) {
      console.error("Error creating payment:", err);
      setError(err.response?.data?.message || "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="qr-payment-container">
        <div className="loading-message">Đang tải QR thanh toán...</div>
      </div>
    );
  }

  if (error && !selectedQR) {
    return (
      <div className="qr-payment-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (qrList.length === 0) {
    return (
      <div className="qr-payment-container">
        <div className="empty-state">
          <h2>Chưa có QR thanh toán được publish</h2>
          <p>Vui lòng liên hệ Admin để được cung cấp QR thanh toán phù hợp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-payment-container">
      <div className="qr-payment-wrapper">
        <h2 className="page-title">Thanh toán qua QR</h2>
        <p className="page-subtitle">
          Chọn QR code của nhân viên bạn muốn thanh toán. Sau khi chọn, bạn sẽ thấy đầy đủ thông tin và có thể xác nhận thanh toán.
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

        {/* Danh sách QR codes - chỉ hiện thông tin cơ bản */}
        <div className="qr-list-section">
          <h3 className="section-title">Chọn QR code thanh toán</h3>
          <div className="qr-cards-grid">
            {qrList.map((qr) => (
              <div
                key={qr._id}
                className={`qr-card ${selectedQR?._id === qr._id ? "selected" : ""}`}
                onClick={() => handleSelectQR(qr)}
              >
                <div className="qr-card-header">
                  <div className="staff-info">
                    <div className="staff-name">
                      {qr.createdBy?.name || "N/A"}
                    </div>
                    {qr.createdBy?.email && (
                      <div className="staff-email">{qr.createdBy.email}</div>
                    )}
                  </div>
                  {qr.bank && (
                    <div className="bank-badge">{qr.bank.toUpperCase()}</div>
                  )}
                </div>
                {qr.imageUrl && (
                  <div className="qr-image-wrapper">
                    <img src={qr.imageUrl} alt={qr.name} className="qr-image" />
                  </div>
                )}
                <div className="qr-card-footer">
                  <div className="qr-name">{qr.name}</div>
                  {qr.amount && (
                    <div className="qr-amount">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(qr.amount)}
                    </div>
                  )}
                </div>
                <button className="select-qr-btn" onClick={(e) => { e.stopPropagation(); handleSelectQR(qr); }}>
                  {selectedQR?._id === qr._id ? "Đã chọn" : "Chọn QR này"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chi tiết QR đã chọn - chỉ hiện khi đã fetch được detail */}
        {selectedQR && (
          <div className="qr-detail-section">
            <h3 className="section-title">Chi tiết thanh toán</h3>
            
            {loadingDetail ? (
              <div className="loading-detail">Đang tải chi tiết QR code...</div>
            ) : qrDetail ? (
              <div className="qr-detail-card">
                <div className="qr-detail-left">
                  <div className="qr-detail-name">{qrDetail.name}</div>
                  {qrDetail.imageUrl && (
                    <img
                      src={qrDetail.imageUrl}
                      alt={qrDetail.name}
                      className="qr-detail-image"
                    />
                  )}
                  {qrDetail.createdBy && (
                    <div className="qr-detail-staff">
                      <span className="label">Nhân viên:</span>{" "}
                      {qrDetail.createdBy.name || "N/A"}
                    </div>
                  )}
                </div>

                <div className="qr-detail-right">
                  <div className="amount-box">
                    <div className="amount-label">Số tiền cần thanh toán</div>
                    <div className="amount-value">
                      {qrDetail.amount
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(qrDetail.amount)
                        : "Theo thỏa thuận"}
                    </div>
                  </div>

                  <div className="info-grid">
                    {qrDetail.transactionCode && (
                      <div className="info-item">
                        <div className="info-label">Mã giao dịch</div>
                        <div className="info-value">
                          {qrDetail.transactionCode}
                        </div>
                      </div>
                    )}

                    {qrDetail.content && (
                      <div className="info-item">
                        <div className="info-label">Nội dung chuyển khoản</div>
                        <div className="info-value">{qrDetail.content}</div>
                      </div>
                    )}

                    {qrDetail.accountName && (
                      <div className="info-item">
                        <div className="info-label">Tên tài khoản</div>
                        <div className="info-value">
                          {qrDetail.accountName}
                        </div>
                      </div>
                    )}

                    {qrDetail.accountNo && (
                      <div className="info-item">
                        <div className="info-label">Số tài khoản</div>
                        <div className="info-value">{qrDetail.accountNo}</div>
                      </div>
                    )}

                    {qrDetail.bank && (
                      <div className="info-item">
                        <div className="info-label">Ngân hàng</div>
                        <div className="info-value">
                          {qrDetail.bank.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

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
                        Sau khi thanh toán thành công, nhấn nút "Xác nhận thanh toán" bên dưới để tạo yêu cầu nạp tiền.
                      </li>
                      <li>
                        Vui lòng lưu lại biên lai hoặc screenshot để làm bằng chứng.
                      </li>
                    </ul>
                  </div>

                  <button 
                    className="confirm-payment-btn"
                    onClick={handleConfirmPayment}
                    disabled={submitting || loadingDetail}
                  >
                    {submitting ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="error-detail">
                Không thể tải chi tiết QR code. Vui lòng thử lại.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPayment;
