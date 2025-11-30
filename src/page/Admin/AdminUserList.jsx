import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, updateUser, getUserPassword, loginAsUser } from '../../services/user.js';

const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [passwords, setPasswords] = useState({}); // Lưu password đã xem
  const [loadingPasswords, setLoadingPasswords] = useState({});

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

  // Xem password của user
  const handleViewPassword = async (userId) => {
    if (passwords[userId]) {
      // Nếu đã xem rồi, ẩn đi
      setPasswords(prev => {
        const newPasswords = { ...prev };
        delete newPasswords[userId];
        return newPasswords;
      });
      return;
    }

    try {
      setLoadingPasswords(prev => ({ ...prev, [userId]: true }));
      const { data } = await getUserPassword(userId);
      setPasswords(prev => ({ ...prev, [userId]: data.password }));
      setMessage(`Password của ${data.email}: ${data.password}`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Lỗi khi lấy password');
    } finally {
      setLoadingPasswords(prev => ({ ...prev, [userId]: false }));
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
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user._id, user.name, e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                {passwords[user._id] ? (
                  <div>
                    <strong style={{ color: '#28a745', fontFamily: 'monospace' }}>
                      {passwords[user._id]}
                    </strong>
                    <button 
                      style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 8px' }}
                      onClick={() => handleViewPassword(user._id)}
                    >
                      Ẩn
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleViewPassword(user._id)}
                    disabled={loadingPasswords[user._id]}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    {loadingPasswords[user._id] ? 'Đang tải...' : 'Xem password'}
                  </button>
                )}
              </td>
              <td>
                <button 
                  style={{ marginRight: '5px', fontSize: '12px', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => handleLoginAsUser(user._id)}
                >
                  Login as
                </button>
                <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserList;
