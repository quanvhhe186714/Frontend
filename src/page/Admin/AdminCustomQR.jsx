import React, { useState, useEffect } from 'react';
import { getAllCustomQRs, createCustomQR, updateCustomQR, deleteCustomQR, publishCustomQR, unpublishCustomQR } from '../../services/customQR';
import QRCodeForm from '../../components/QRCodeForm/QRCodeForm';

const AdminCustomQR = () => {
  const [customQRs, setCustomQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCustomQRs = async () => {
    try {
      setLoading(true);
      const { data } = await getAllCustomQRs();
      setCustomQRs(data);
      setLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi tải danh sách QR code');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomQRs();
  }, []);

  const handleCreate = () => {
    setEditingQR(null);
    setShowForm(true);
  };

  const handleEdit = (qr) => {
    setEditingQR(qr);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQR(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setMessage(''); // Clear previous messages
      if (editingQR) {
        await updateCustomQR(editingQR._id, formData);
        setMessage('Cập nhật QR code thành công');
      } else {
        await createCustomQR(formData);
        setMessage('Tạo QR code thành công');
      }
      setShowForm(false);
      setEditingQR(null);
      fetchCustomQRs();
    } catch (error) {
      console.error('Error saving QR code:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Lỗi khi lưu QR code';
      setMessage(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa QR code này?')) {
      return;
    }

    try {
      await deleteCustomQR(id);
      setMessage('Xóa QR code thành công');
      fetchCustomQRs();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa QR code');
    }
  };

  const handleTogglePublish = async (qr) => {
    try {
      setMessage('');
      if (qr.isPublished) {
        await unpublishCustomQR(qr._id);
        setMessage('Đã gỡ QR khỏi trang thanh toán');
      } else {
        await publishCustomQR(qr._id);
        setMessage('Đã publish QR lên trang thanh toán');
      }
      fetchCustomQRs();
    } catch (error) {
      console.error('Error toggling publish QR code:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Lỗi khi publish/gỡ publish QR code';
      setMessage(errorMessage);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Quản lý QR Code tùy chỉnh</h3>
        {!showForm && (
          <button
            onClick={handleCreate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Tạo QR code mới
          </button>
        )}
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

      {showForm ? (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>{editingQR ? 'Chỉnh sửa QR code' : 'Tạo QR code mới'}</h4>
          <QRCodeForm
            initialData={editingQR}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={formLoading}
          />
        </div>
      ) : (
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tên</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nhân viên</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>QR Code</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Mã giao dịch</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Số tiền</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Trạng thái</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Trang thanh toán QR</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customQRs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>
                  Chưa có QR code nào. Hãy tạo QR code mới.
                </td>
              </tr>
            ) : (
              customQRs.map((qr) => (
                <tr key={qr._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{qr.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {qr.createdBy ? (
                      <div>
                        <div style={{ fontWeight: '500' }}>{qr.createdBy.name || 'N/A'}</div>
                        <div style={{ fontSize: '11px', color: '#6c757d' }}>{qr.createdBy.email || ''}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#6c757d' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {qr.imageUrl && (
                      <img 
                        src={qr.imageUrl} 
                        alt={qr.name}
                        style={{ maxWidth: '100px', maxHeight: '100px', cursor: 'pointer' }}
                        onClick={() => window.open(qr.imageUrl, '_blank')}
                      />
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{qr.transactionCode || '-'}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {qr.amount ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(qr.amount) : '-'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: qr.isActive ? '#28a745' : '#6c757d',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {qr.isActive ? 'Kích hoạt' : 'Tắt'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: qr.isPublished ? '#17a2b8' : '#e9ecef',
                        color: qr.isPublished ? 'white' : '#495057',
                        fontSize: '12px',
                        display: 'inline-block',
                        width: 'fit-content'
                      }}>
                        {qr.isPublished ? 'Đang hiển thị' : 'Chưa hiển thị'}
                      </span>
                      <button
                        onClick={() => handleTogglePublish(qr)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: qr.isPublished ? '#6c757d' : '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {qr.isPublished ? 'Gỡ khỏi trang thanh toán' : 'Đẩy lên trang thanh toán'}
                      </button>
                      {qr.isPublished && (
                        <span style={{ fontSize: '11px', color: '#6c757d' }}>
                          Link: <a href="/qr-payment" target="_blank" rel="noopener noreferrer">/qr-payment</a>
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEdit(qr)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(qr._id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminCustomQR;

