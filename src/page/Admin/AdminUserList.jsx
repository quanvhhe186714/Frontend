import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, updateUser, loginAsUser, updateUserWalletBalance, deleteUserOrderHistory, getUserOrders, getUserTransactions, promoteUser, demoteUser } from '../../services/user.js';
import orderService from '../../services/order.js';
import walletService from '../../services/wallet.js';

const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingBalance, setEditingBalance] = useState({}); // { userId: { amount: '', operation: 'add' } }
  const [loadingBalance, setLoadingBalance] = useState({});
  const [currentUser, setCurrentUser] = useState(null); // User hiện tại đang đăng nhập
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'purchased', 'transactions'
  const [pendingOrders, setPendingOrders] = useState([]);
  const [purchasedOrders, setPurchasedOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setMessage('Error fetching users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Lấy thông tin user hiện tại
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setCurrentUser(userInfo.user || null);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id); 
        setMessage('User deleted!');
        fetchUsers(); 
      } catch (error) {
        setMessage('Error deleting user');
      }
    }
  };

  const handleRoleChange = async (id, name, newRole) => {
      try {
          await updateUser(id, name, newRole); 
          setMessage('Role updated!');
          fetchUsers(); 
      } catch (error) {
          setMessage('Error updating role');
      }
  };

  // Promote user lên admin
  const handlePromote = async (userId, userEmail) => {
    if (!window.confirm(`Bạn có chắc muốn promote ${userEmail} lên admin?`)) {
      return;
    }

    try {
      const { data } = await promoteUser(userId);
      setMessage(data.message || `Đã promote ${userEmail} lên admin thành công`);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi promote user');
    }
  };

  // Demote admin về customer
  const handleDemote = async (userId, userEmail) => {
    if (!window.confirm(`Bạn có chắc muốn demote ${userEmail} về customer?`)) {
      return;
    }

    try {
      const { data } = await demoteUser(userId);
      setMessage(data.message || `Đã demote ${userEmail} về customer thành công`);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi demote user');
    }
  };

  // Cập nhật số dư ví của user
  const handleUpdateBalance = async (userId, userEmail) => {
    const editData = editingBalance[userId];
    if (!editData || !editData.amount || parseFloat(editData.amount) <= 0) {
      setMessage('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setLoadingBalance(prev => ({ ...prev, [userId]: true }));
      await updateUserWalletBalance(userId, editData.amount, editData.operation);
      setMessage(`Đã ${editData.operation === 'add' ? 'cộng' : 'trừ'} ${editData.amount} vào ví của ${userEmail}`);
      // Reset editing state
      setEditingBalance(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      // Refresh user list
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi cập nhật số dư ví');
    } finally {
      setLoadingBalance(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Bắt đầu chỉnh sửa balance
  const startEditingBalance = (userId) => {
    setEditingBalance(prev => ({
      ...prev,
      [userId]: { amount: '', operation: 'add' }
    }));
  };

  // Hủy chỉnh sửa balance
  const cancelEditingBalance = (userId) => {
    setEditingBalance(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  };

  // Xóa lịch sử mua hàng của user
  const handleDeleteOrderHistory = async (userId, userEmail) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tất cả lịch sử mua hàng của ${userEmail}? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const { data } = await deleteUserOrderHistory(userId);
      setMessage(data.message || `Đã xóa ${data.deletedCount} đơn hàng của ${userEmail}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa lịch sử mua hàng');
    }
  };

  // Mở modal xem chi tiết user
  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setActiveTab('pending');
    setLoadingData(true);
    
    try {
      // Lấy đơn hàng chờ thanh toán (chỉ lấy chưa xóa)
      const pendingRes = await getUserOrders(user._id, 'pending', false);
      setPendingOrders(pendingRes.data.orders || []);
      
      // Lấy đơn hàng đã mua (paid, completed, delivered) - chỉ lấy chưa xóa
      const purchasedRes = await getUserOrders(user._id, null, false);
      const allOrders = purchasedRes.data.orders || [];
      const purchased = allOrders.filter(o => ['paid', 'completed', 'delivered'].includes(o.status));
      setPurchasedOrders(purchased);
      
      // Lấy lịch sử thanh toán (chỉ lấy chưa xóa)
      const transRes = await getUserTransactions(user._id, null, false);
      setTransactions(transRes.data.transactions || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedUser(null);
    setPendingOrders([]);
    setPurchasedOrders([]);
    setTransactions([]);
  };

  // Xóa mềm đơn hàng
  const handleSoftDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này? Đơn hàng sẽ được đánh dấu là đã xóa trong database.')) return;
    
    try {
      setLoadingData(true);
      const { data } = await orderService.softDeleteOrder(orderId);
      setMessage(data.message || 'Đã xóa đơn hàng thành công');
      
      // Xóa ngay khỏi state để UI cập nhật ngay lập tức
      setPendingOrders(prev => prev.filter(o => o._id !== orderId));
      setPurchasedOrders(prev => prev.filter(o => o._id !== orderId));
      
      // Refresh data từ database để đảm bảo đồng bộ
      if (selectedUser) {
        await handleViewUserDetails(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa đơn hàng');
      setLoadingData(false);
    }
  };

  // Khôi phục đơn hàng
  const handleRestoreOrder = async (orderId) => {
    try {
      setLoadingData(true);
      const { data } = await orderService.restoreOrder(orderId);
      setMessage(data.message || 'Đã khôi phục đơn hàng thành công');
      // Refresh data từ database để hiển thị lại đơn hàng đã khôi phục
      if (selectedUser) {
        await handleViewUserDetails(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi khôi phục đơn hàng');
      setLoadingData(false);
    }
  };

  // Xóa mềm transaction
  const handleSoftDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này? Giao dịch sẽ được đánh dấu là đã xóa trong database.')) return;
    
    try {
      setLoadingData(true);
      const { data } = await walletService.softDeleteTransaction(transactionId);
      setMessage(data.message || 'Đã xóa giao dịch thành công');
      
      // Xóa ngay khỏi state để UI cập nhật ngay lập tức
      setTransactions(prev => prev.filter(t => t._id !== transactionId));
      
      // Refresh data từ database để đảm bảo đồng bộ
      if (selectedUser) {
        await handleViewUserDetails(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi xóa giao dịch');
      setLoadingData(false);
    }
  };

  // Khôi phục transaction
  const handleRestoreTransaction = async (transactionId) => {
    try {
      setLoadingData(true);
      const { data } = await walletService.restoreTransaction(transactionId);
      setMessage(data.message || 'Đã khôi phục giao dịch thành công');
      // Refresh data từ database để hiển thị lại transaction đã khôi phục
      if (selectedUser) {
        await handleViewUserDetails(selectedUser);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi khôi phục giao dịch');
      setLoadingData(false);
    }
  };

  // Admin login as user
  const handleLoginAsUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn đăng nhập vào tài khoản này? Bạn sẽ bị đăng xuất khỏi tài khoản admin.')) {
      return;
    }

    try {
      const { data } = await loginAsUser(userId);
      // Lưu thông tin user mới vào localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));
      setMessage(`Đã đăng nhập vào tài khoản ${data.user.email}`);
      
      // Chuyển hướng dựa trên role của user
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi đăng nhập');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>User Management</h3>
      {message && <p>{message}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Số dư ví</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    backgroundColor: user.role === 'admin' ? '#28a745' : '#6c757d',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    {user.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                  {currentUser && currentUser._id !== user._id && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {user.role === 'customer' ? (
                        <button
                          onClick={() => handlePromote(user._id, user.email)}
                          style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px', 
                            cursor: 'pointer' 
                          }}
                          title="Promote lên Admin"
                        >
                          Promote
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemote(user._id, user.email)}
                          style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px', 
                            cursor: 'pointer' 
                          }}
                          title="Demote về Customer"
                        >
                          Demote
                        </button>
                      )}
                    </div>
                  )}
                  {currentUser && currentUser._id === user._id && (
                    <span style={{ fontSize: '11px', color: '#6c757d', fontStyle: 'italic' }}>
                      (Bạn)
                    </span>
                  )}
                </div>
              </td>
              <td>
                {editingBalance[user._id] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '200px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <select
                        value={editingBalance[user._id].operation}
                        onChange={(e) => setEditingBalance(prev => ({
                          ...prev,
                          [user._id]: { ...prev[user._id], operation: e.target.value }
                        }))}
                        style={{ fontSize: '12px', padding: '2px 4px' }}
                      >
                        <option value="add">Cộng</option>
                        <option value="subtract">Trừ</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={editingBalance[user._id].amount}
                        onChange={(e) => setEditingBalance(prev => ({
                          ...prev,
                          [user._id]: { ...prev[user._id], amount: e.target.value }
                        }))}
                        placeholder="Số tiền"
                        style={{ fontSize: '12px', padding: '2px 4px', flex: 1 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleUpdateBalance(user._id, user.email)}
                        disabled={loadingBalance[user._id]}
                        style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        {loadingBalance[user._id] ? 'Đang xử lý...' : 'Xác nhận'}
                      </button>
                      <button
                        onClick={() => cancelEditingBalance(user._id)}
                        style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#007bff', minWidth: '100px' }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(user.balance || 0)}
                    </strong>
                    <button
                      onClick={() => startEditingBalance(user._id)}
                      style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div>
                    <button 
                      style={{ marginRight: '5px', fontSize: '12px', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => handleLoginAsUser(user._id)}
                    >
                      Login as
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                  </div>
                  <button
                    onClick={() => handleDeleteOrderHistory(user._id, user.email)}
                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    Xóa lịch sử mua hàng
                  </button>
                  <button
                    onClick={() => handleViewUserDetails(user)}
                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal xem chi tiết user */}
      {selectedUser && (
        <div 
          onClick={(e) => {
            // Đóng modal khi click vào backdrop
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
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
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              width: '800px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Chi tiết: {selectedUser.name} ({selectedUser.email})</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={handleCloseModal} 
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 12px',
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
                <button 
                  onClick={handleCloseModal} 
                  style={{ 
                    fontSize: '24px', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: '#666',
                    lineHeight: '1',
                    padding: '0',
                    width: '24px',
                    height: '24px'
                  }}
                  title="Đóng"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
              <button
                onClick={() => setActiveTab('pending')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'pending' ? '#007bff' : 'transparent',
                  color: activeTab === 'pending' ? 'white' : '#007bff',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'pending' ? '2px solid #007bff' : 'none'
                }}
              >
                Đơn hàng chờ thanh toán ({pendingOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('purchased')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'purchased' ? '#007bff' : 'transparent',
                  color: activeTab === 'purchased' ? 'white' : '#007bff',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'purchased' ? '2px solid #007bff' : 'none'
                }}
              >
                Đơn hàng đã mua ({purchasedOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === 'transactions' ? '#007bff' : 'transparent',
                  color: activeTab === 'transactions' ? 'white' : '#007bff',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'transactions' ? '2px solid #007bff' : 'none'
                }}
              >
                Lịch sử thanh toán ({transactions.length})
              </button>
            </div>

            {/* Content */}
            {loadingData ? (
              <div>Đang tải...</div>
            ) : (
              <div>
                {activeTab === 'pending' && (
                  <div>
                    <h4>Đơn hàng chờ thanh toán</h4>
                    {pendingOrders.length === 0 ? (
                      <p>Không có đơn hàng nào</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tổng tiền</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Ngày tạo</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingOrders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px' }}>#{order._id.substring(0, 8)}</td>
                              <td style={{ padding: '8px' }}>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.totalAmount)}
                              </td>
                              <td style={{ padding: '8px' }}>
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                              </td>
                              <td style={{ padding: '8px' }}>
                                {order.isDeleted ? (
                                  <button
                                    onClick={() => handleRestoreOrder(order._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Khôi phục
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSoftDeleteOrder(order._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'purchased' && (
                  <div>
                    <h4>Đơn hàng đã mua</h4>
                    {purchasedOrders.length === 0 ? (
                      <p>Không có đơn hàng nào</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tổng tiền</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Trạng thái</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Ngày tạo</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchasedOrders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px' }}>#{order._id.substring(0, 8)}</td>
                              <td style={{ padding: '8px' }}>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.totalAmount)}
                              </td>
                              <td style={{ padding: '8px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '3px',
                                  backgroundColor: order.status === 'completed' ? '#28a745' : order.status === 'paid' ? '#007bff' : '#6c757d',
                                  color: 'white',
                                  fontSize: '11px'
                                }}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px' }}>
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                              </td>
                              <td style={{ padding: '8px' }}>
                                {order.isDeleted ? (
                                  <button
                                    onClick={() => handleRestoreOrder(order._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Khôi phục
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSoftDeleteOrder(order._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div>
                    <h4>Lịch sử thanh toán</h4>
                    {transactions.length === 0 ? (
                      <p>Không có giao dịch nào</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Mã tham chiếu</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Số tiền</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Trạng thái</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Ngày tạo</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(transaction => (
                            <tr key={transaction._id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px' }}>{transaction.referenceCode}</td>
                              <td style={{ padding: '8px' }}>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(transaction.amount)}
                              </td>
                              <td style={{ padding: '8px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '3px',
                                  backgroundColor: transaction.status === 'success' ? '#28a745' : transaction.status === 'pending' ? '#ffc107' : '#dc3545',
                                  color: 'white',
                                  fontSize: '11px'
                                }}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px' }}>
                                {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                              </td>
                              <td style={{ padding: '8px' }}>
                                {transaction.isDeleted ? (
                                  <button
                                    onClick={() => handleRestoreTransaction(transaction._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Khôi phục
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSoftDeleteTransaction(transaction._id)}
                                    style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
