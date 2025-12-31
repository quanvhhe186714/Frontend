import React, { useState, useEffect } from 'react';
import { getPublicCustomQRs } from '../../services/customQR';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';
import './shop.scss';

const PublicQRDisplay = () => {
  const [customQRs, setCustomQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchPublicQRs();
  }, []);

  const fetchPublicQRs = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getPublicCustomQRs();
      setCustomQRs(data || []);
    } catch (err) {
      console.error('Error fetching public QR codes:', err);
      setError('Không thể tải danh sách QR code. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRClick = (qr) => {
    setSelectedQR(qr);
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
      hdbank: 'HDBank',
      momo: 'MoMo',
    };
    return bankMap[bank] || bank;
  };

  if (loading) {
    return (
      <div className="public-qr-page">
        <div className="public-qr-container">
          <div className="loading-spinner">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-qr-page">
      <div className="public-qr-container">
        <div className="public-qr-header">
          <h1>Mã QR Thanh Toán</h1>
          <p className="public-qr-subtitle">
            Quét mã QR để thanh toán nhanh chóng và tiện lợi
          </p>
        </div>

        {error && (
          <div className="public-qr-error">
            {error}
            <button onClick={fetchPublicQRs} className="retry-btn">
              Thử lại
            </button>
          </div>
        )}

        {!error && customQRs.length === 0 && (
          <div className="public-qr-empty">
            <p>Hiện tại chưa có mã QR nào được kích hoạt.</p>
          </div>
        )}

        {!error && customQRs.length > 0 && (
          <div className="public-qr-grid">
            {customQRs.map((qr) => (
              <div key={qr._id} className="public-qr-card">
                <div className="qr-card-header">
                  <h3>{qr.name}</h3>
                </div>
                <div className="qr-card-body">
                  <div className="qr-image-wrapper">
                    <img
                      src={qr.imageUrl}
                      alt={qr.name}
                      className="qr-image"
                      onClick={() => handleQRClick(qr)}
                    />
                  </div>
                  <div className="qr-info">
                    {qr.amount && (
                      <div className="qr-info-item">
                        <span className="qr-info-label">Số tiền:</span>
                        <span className="qr-info-value amount">{formatAmount(qr.amount)}</span>
                      </div>
                    )}
                    {qr.content && (
                      <div className="qr-info-item">
                        <span className="qr-info-label">Nội dung:</span>
                        <span className="qr-info-value">{qr.content}</span>
                      </div>
                    )}
                    {qr.accountName && (
                      <div className="qr-info-item">
                        <span className="qr-info-label">Người nhận:</span>
                        <span className="qr-info-value">{qr.accountName}</span>
                      </div>
                    )}
                    {qr.accountNo && (
                      <div className="qr-info-item">
                        <span className="qr-info-label">Số TK:</span>
                        <span className="qr-info-value">{qr.accountNo}</span>
                      </div>
                    )}
                    {qr.bank && (
                      <div className="qr-info-item">
                        <span className="qr-info-label">Ngân hàng:</span>
                        <span className="qr-info-value">{getBankName(qr.bank)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="qr-card-footer">
                  <button
                    className="qr-view-btn"
                    onClick={() => handleQRClick(qr)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedQR && (
          <QRCodeModal
            qrData={selectedQR}
            onClose={() => setSelectedQR(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PublicQRDisplay;

