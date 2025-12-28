import React, { useState, useEffect } from 'react';
import messageService from '../../services/message';

const AdminFakeMessages = () => {
  const [fakeMessages, setFakeMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    senderName: '',
    senderAvatar: '',
    conversationId: '',
    orderId: '',
    createdAt: new Date().toISOString().slice(0, 16)
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchFakeMessages();
    fetchConversations();
  }, []);

  const fetchFakeMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getAllFakeMessages();
      setFakeMessages(data);
      setLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi tải danh sách tin nhắn ảo');
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await messageService.getAllConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      content: '',
      senderName: '',
      senderAvatar: '',
      conversationId: '',
      orderId: '',
      createdAt: new Date().toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      content: '',
      senderName: '',
      senderAvatar: '',
      conversationId: '',
      orderId: '',
      createdAt: new Date().toISOString().slice(0, 16)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.conversationId) {
      setMessage('Vui lòng điền đầy đủ nội dung và chọn conversation');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setFormLoading(true);
      await messageService.createFakeMessage({
        ...formData,
        createdAt: new Date(formData.createdAt).toISOString()
      });
      setMessage('Tạo tin nhắn ảo thành công');
      setShowForm(false);
      setFormData({
        content: '',
        senderName: '',
        senderAvatar: '',
        conversationId: '',
        orderId: '',
        createdAt: new Date().toISOString().slice(0, 16)
      });
      fetchFakeMessages();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi tạo tin nhắn ảo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin nhắn ảo này?')) {
      return;
    }

    try {
      await messageService.deleteFakeMessage(id);
      setMessage('Xóa tin nhắn ảo thành công');
      fetchFakeMessages();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa tin nhắn ảo');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Quản lý tin nhắn ảo</h3>
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
            + Tạo tin nhắn ảo mới
          </button>
        )}
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
          <h4>Tạo tin nhắn ảo mới</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Conversation (bắt buộc):
              </label>
              <select
                value={formData.conversationId}
                onChange={(e) => setFormData({ ...formData, conversationId: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">-- Chọn conversation --</option>
                {conversations.map((conv) => (
                  <option key={conv.conversationId} value={conv.conversationId}>
                    {conv.sender?.name || 'Unknown'} ({conv.conversationId})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nội dung tin nhắn (bắt buộc):
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={4}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Nhập nội dung tin nhắn ảo..."
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tên người gửi (tùy chọn - để trống sẽ dùng tên user trong conversation):
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="Tên người gửi (tùy chọn)"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Avatar URL (tùy chọn):
              </label>
              <input
                type="text"
                value={formData.senderAvatar}
                onChange={(e) => setFormData({ ...formData, senderAvatar: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="URL avatar (tùy chọn)"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Order ID (tùy chọn):
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                placeholder="ID đơn hàng (tùy chọn)"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Thời gian gửi:
              </label>
              <input
                type="datetime-local"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
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
                {formLoading ? 'Đang tạo...' : 'Tạo tin nhắn ảo'}
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
        <h4>Danh sách tin nhắn ảo ({fakeMessages.length})</h4>
        {fakeMessages.length === 0 ? (
          <p>Chưa có tin nhắn ảo nào</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Người gửi</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Nội dung</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Conversation</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Thời gian</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {fakeMessages.map((msg) => (
                <tr key={msg._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {msg.sender?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', maxWidth: '300px', wordBreak: 'break-word' }}>
                    {msg.content || '-'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                    {msg.conversationId}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleDelete(msg._id)}
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

export default AdminFakeMessages;

