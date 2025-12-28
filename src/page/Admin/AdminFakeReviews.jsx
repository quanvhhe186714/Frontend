import React, { useState, useEffect } from 'react';
import { getAllReviews, getAllFakeReviews, createFakeReview, updateReview, deleteReview } from '../../services/review';
import api from '../../services/apiService';

const AdminFakeReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'fake', 'real'
  const [formData, setFormData] = useState({
    productId: '',
    serviceId: '',
    userName: '',
    userAvatar: '',
    rating: 5,
    comment: '',
    createdAt: new Date().toISOString().slice(0, 16),
    totalReviewers: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
    fetchServices();
  }, [filterType]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType === 'fake') params.isFake = true;
      if (filterType === 'real') params.isFake = false;
      const data = await getAllReviews(params);
      console.log('AdminFakeReviews - Received data:', data);
      console.log('AdminFakeReviews - Reviews array:', data.reviews || data);
      console.log('AdminFakeReviews - Reviews count:', (data.reviews || data)?.length);
      setReviews(data.reviews || data);
      setLoading(false);
    } catch (error) {
      console.error('AdminFakeReviews - Error:', error);
      setMessage(error.response?.data?.message || 'Lỗi khi tải danh sách đánh giá');
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/facebook-services');
      setServices(response.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleCreate = () => {
    setEditingReview(null);
    setFormData({
      productId: '',
      serviceId: '',
      userName: '',
      userAvatar: '',
      rating: 5,
      comment: '',
      createdAt: new Date().toISOString().slice(0, 16),
      totalReviewers: ''
    });
    setShowForm(true);
  };

  const handleEdit = async (review) => {
    setEditingReview(review);
    
    // Fetch current product/service to get totalReviewers
    let currentTotalReviewers = '';
    try {
      if (review.product?._id) {
        const productResponse = await api.get(`/products/${review.product._id}`);
        currentTotalReviewers = productResponse.data.totalReviewers || '';
      } else if (review.facebookService?._id) {
        const serviceResponse = await api.get(`/facebook-services/${review.facebookService._id}`);
        currentTotalReviewers = serviceResponse.data.totalReviewers || '';
      }
    } catch (error) {
      console.error('Error fetching product/service:', error);
    }
    
    setFormData({
      productId: review.product?._id || '',
      serviceId: review.facebookService?._id || '',
      userName: review.user?.name || '',
      userAvatar: review.user?.avatar || '',
      rating: review.rating,
      comment: review.comment || '',
      createdAt: new Date(review.createdAt).toISOString().slice(0, 16),
      totalReviewers: currentTotalReviewers
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
    setFormData({
      productId: '',
      serviceId: '',
      userName: '',
      userAvatar: '',
      rating: 5,
      comment: '',
      createdAt: new Date().toISOString().slice(0, 16),
      totalReviewers: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!formData.productId && !formData.serviceId) || !formData.userName || !formData.rating) {
      setMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setFormLoading(true);
      const submitData = {
        ...formData,
        rating: parseInt(formData.rating),
        createdAt: new Date(formData.createdAt).toISOString()
      };

      if (editingReview) {
        // For editing, use updateReview which works for both fake and real reviews
        await updateReview(editingReview._id, {
          rating: submitData.rating,
          comment: submitData.comment,
          createdAt: submitData.createdAt
        });
        setMessage('Cập nhật đánh giá thành công');
      } else {
        // Only allow creating fake reviews from admin panel
        await createFakeReview(submitData);
        setMessage('Tạo đánh giá ảo thành công');
      }

      // Update totalReviewers for product or service
      if (formData.totalReviewers !== '' && formData.totalReviewers !== null) {
        const totalReviewersValue = formData.totalReviewers ? parseInt(formData.totalReviewers) : null;
        if (formData.productId) {
          await api.put(`/products/${formData.productId}`, { totalReviewers: totalReviewersValue });
        } else if (formData.serviceId) {
          await api.put(`/facebook-services/${formData.serviceId}`, { totalReviewers: totalReviewersValue });
        }
      }

      setShowForm(false);
      setEditingReview(null);
      setFormData({
        productId: '',
        serviceId: '',
        userName: '',
        userAvatar: '',
        rating: 5,
        comment: '',
        createdAt: new Date().toISOString().slice(0, 16),
        totalReviewers: ''
      });
      fetchReviews();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi lưu đánh giá ảo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await deleteReview(id);
      setMessage('Xóa đánh giá thành công');
      fetchReviews();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa đánh giá');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div>Đang tải...</div>;

  const filteredReviews = reviews.filter(review => {
    if (filterType === 'fake') return review.isFake === true;
    if (filterType === 'real') return review.isFake === false;
    return true;
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Quản lý đánh giá</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="fake">Đánh giá ảo</option>
            <option value="real">Đánh giá thật</option>
          </select>
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
              + Tạo đánh giá ảo mới
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: message.includes('thành công') ? '#d4edda' : '#f8d7da',
            color: message.includes('thành công') ? '#155724' : '#721c24',
            borderRadius: '4px'
          }}
        >
          {message}
        </div>
      )}

      {showForm && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h4>{editingReview ? 'Chỉnh sửa đánh giá ảo' : 'Tạo đánh giá ảo mới'}</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Sản phẩm:
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value, serviceId: '' })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Dịch vụ:
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, productId: '' })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tên người đánh giá (bắt buộc):
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Tên người đánh giá"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Avatar URL (tùy chọn):
              </label>
              <input
                type="text"
                value={formData.userAvatar}
                onChange={(e) => setFormData({ ...formData, userAvatar: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="URL avatar (tùy chọn)"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Đánh giá (1-5 sao) (bắt buộc):
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value={1}>1 sao</option>
                <option value={2}>2 sao</option>
                <option value={3}>3 sao</option>
                <option value={4}>4 sao</option>
                <option value={5}>5 sao</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Bình luận (tùy chọn):
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Nhập bình luận đánh giá..."
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Thời gian đánh giá:
              </label>
              <input
                type="datetime-local"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Số người đánh giá (tùy chọn):
              </label>
              <input
                type="number"
                value={formData.totalReviewers}
                onChange={(e) => setFormData({ ...formData, totalReviewers: e.target.value })}
                min="0"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Để trống để tự động tính từ số lượng reviews"
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Nhập số người đánh giá để hiển thị (ví dụ: 50). Để trống sẽ tự động tính từ số lượng reviews thực tế.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: formLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {formLoading ? 'Đang lưu...' : (editingReview ? 'Cập nhật' : 'Tạo đánh giá ảo')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h4>Danh sách đánh giá ({filteredReviews.length})</h4>
        {filteredReviews.length === 0 ? (
          <p>Chưa có đánh giá nào</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Loại</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Sản phẩm/Dịch vụ</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Người đánh giá</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Đánh giá</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Bình luận</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Thời gian</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {review.isFake ? (
                      <span style={{ padding: '2px 6px', backgroundColor: '#ffc107', color: '#000', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>ẢO</span>
                    ) : (
                      <span style={{ padding: '2px 6px', backgroundColor: '#28a745', color: '#fff', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>THẬT</span>
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {review.product?.name || review.facebookService?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {review.user?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {renderStars(review.rating)} ({review.rating}/5)
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', maxWidth: '300px', wordBreak: 'break-word' }}>
                    {review.comment || '-'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(review.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEdit(review)}
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
                        onClick={() => handleDelete(review._id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminFakeReviews;

