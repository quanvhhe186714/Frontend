import React from 'react';

const QRCodeModal = ({ qrData, onClose }) => {
  if (!qrData) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Thông tin giao dịch</h3>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          {qrData.imageUrl && (
            <img
              src={qrData.imageUrl}
              alt="QR Code"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Tên QR code:</strong>
          <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            {qrData.name || '-'}
          </div>
        </div>

        {qrData.transactionCode && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Mã giao dịch:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {qrData.transactionCode}
            </div>
          </div>
        )}

        {qrData.content && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Nội dung chuyển khoản:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {qrData.content}
            </div>
          </div>
        )}

        {qrData.amount && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Số tiền:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(qrData.amount)}
            </div>
          </div>
        )}

        {qrData.bank && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Ngân hàng:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {qrData.bank === 'vietin' ? 'VietinBank' : qrData.bank === 'hdbank' ? 'HDBank' : qrData.bank === 'bidv' ? 'BIDV' : qrData.bank === 'momo' ? 'MoMo' : qrData.bank}
            </div>
          </div>
        )}

        {qrData.accountName && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Tên chủ tài khoản:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {qrData.accountName}
            </div>
          </div>
        )}

        {qrData.accountNo && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Số tài khoản:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {qrData.accountNo}
            </div>
          </div>
        )}

        {qrData.createdAt && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Thời gian tạo:</strong>
            <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              {new Date(qrData.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

