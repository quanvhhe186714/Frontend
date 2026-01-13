import React, { useState, useEffect } from 'react';
import { getAllBankQRs, updateBankQRVisibility } from '../../services/bankQR';

const AdminBankQR = () => {
  const [bankQRs, setBankQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState({}); // { code: true/false }

  const fetchBankQRs = async () => {
    try {
      setLoading(true);
      const { data } = await getAllBankQRs();
      setBankQRs(data);
      setLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi tải danh sách Bank QR code');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankQRs();
  }, []);

  const handleToggleVisibility = async (code, currentVisibility) => {
    try {
      setUpdating({ ...updating, [code]: true });
      setMessage('');
      const newVisibility = !currentVisibility;
      await updateBankQRVisibility(code, newVisibility);
      setMessage(`Đã ${newVisibility ? 'hiển thị' : 'ẩn'} QR code thành công`);
      fetchBankQRs(); // Refresh danh sách
    } catch (error) {
      console.error('Error toggling visibility:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Lỗi khi cập nhật trạng thái QR code';
      setMessage(errorMessage);
    } finally {
      setUpdating({ ...updating, [code]: false });
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Quản lý QR Code Ngân hàng</h3>
        <p style={{ color: '#6c757d', fontSize: '14px' }}>
          Bật/tắt hiển thị QR code ngân hàng trên trang nạp tiền. QR code bị ẩn sẽ không hiển thị trong dropdown chọn ngân hàng.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: message.includes('thành công') ? '#d4edda' : '#f8d7da',
          color: message.includes('thành công') ? '#155724' : '#721c24',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Mã</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tên ngân hàng</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Số tài khoản</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tên chủ TK</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Trạng thái</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bankQRs.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                Chưa có QR code ngân hàng nào.
              </td>
            </tr>
          ) : (
            bankQRs.map((bank) => (
              <tr key={bank.code}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{bank.code}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{bank.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{bank.accountNo || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{bank.accountName || '-'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: bank.isVisible !== false ? '#28a745' : '#6c757d',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {bank.isVisible !== false ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleToggleVisibility(bank.code, bank.isVisible !== false)}
                    disabled={updating[bank.code]}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: bank.isVisible !== false ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: updating[bank.code] ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      opacity: updating[bank.code] ? 0.6 : 1
                    }}
                  >
                    {updating[bank.code] ? 'Đang xử lý...' : (bank.isVisible !== false ? 'Ẩn QR' : 'Hiện QR')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBankQR;
