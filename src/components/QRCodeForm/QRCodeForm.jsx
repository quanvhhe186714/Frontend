import React, { useState, useEffect } from 'react';

const QRCodeForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    transactionCode: '',
    content: '', // Nội dung chuyển khoản – bắt buộc
    amount: '',  // Số tiền – bắt buộc
    bank: '', // text field, required
    accountName: '', // required
    accountNo: '', // required
    orderId: '',
    isActive: true
  });
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        transactionCode: initialData.transactionCode || '',
        content: initialData.content || '',
        amount: initialData.amount || '',
        bank: initialData.bank || '',
        accountName: initialData.accountName || '',
        accountNo: initialData.accountNo || '',
        orderId: initialData.orderId || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
      if (initialData.imageUrl) {
        setPreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bank || !formData.accountName || !formData.accountNo || !formData.content || !formData.amount) {
      alert('Vui lòng nhập Ngân hàng, Tên chủ tài khoản, Số tài khoản, Nội dung và Số tiền');
      return;
    }
    if (!/^[0-9]+$/.test(formData.accountNo)) {
      alert('Số tài khoản chỉ được chứa số (0-9)');
      return;
    }

    const submitData = new FormData();
    if (formData.name) submitData.append('name', formData.name);
    if (formData.transactionCode) submitData.append('transactionCode', formData.transactionCode);
    if (formData.content) submitData.append('content', formData.content);
    if (formData.amount) submitData.append('amount', formData.amount);

    submitData.append('bank', formData.bank);
    submitData.append('accountName', formData.accountName);
    submitData.append('accountNo', formData.accountNo);
    if (formData.orderId) submitData.append('orderId', formData.orderId);
    submitData.append('isActive', formData.isActive);

    if (imageFile) {
      submitData.append('qrImage', imageFile);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Bank */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Ngân hàng <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="bank"
          value={formData.bank}
          onChange={handleChange}
          required
          placeholder="Nhập tên ngân hàng (VD: VietinBank, MoMo, Vietcombank)"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Account Name */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Tên chủ tài khoản <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Account No */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Số tài khoản <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="accountNo"
          value={formData.accountNo}
          onChange={handleChange}
          required
          pattern="[0-9]+"
          title="Chỉ cho phép số (0-9)"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Content */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Nội dung chuyển khoản <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Số tiền <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="1000"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Optional QR Image */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Ảnh QR (tuỳ chọn)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        {preview && (
          <div style={{ marginTop: '10px' }}>
            <img
              src={preview}
              alt="QR Preview"
              style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        )}
      </div>

      {/* Other optional fields collapsed in details accordion? Keep old fields hidden maybe skip for now */}

      {/* Active toggle */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span style={{ fontWeight: 'bold' }}>Kích hoạt</span>
        </label>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default QRCodeForm;
