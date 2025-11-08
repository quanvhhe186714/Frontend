// src/components/AdminUserList.js
import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUser } from '../../services/user.js';
const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setMessage('Lỗi khi tải danh sách người dùng. Bạn có phải là Admin?');
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await deleteUser(id); 
        setMessage('Xóa thành công!');
        fetchUsers(); 
      } catch (error) {
        setMessage(error.response?.data?.message || 'Lỗi khi xóa');
      }
    }
  };
  const handleRoleChange = async (id, name, newRole) => {
      try {
          await updateUser(id, name, newRole); 
          setMessage('Cập nhật vai trò thành công!');
          fetchUsers(); 
      } catch (error) {
          setMessage(error.response?.data?.message || 'Lỗi cập nhật vai trò');
      }
  };
  if (loading) return <div>Đang tải...</div>;
  return (
    <div>
      <h2>Quản lý Người dùng (Admin)</h2>
      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user._id, user.name, e.target.value)}
                >
                  <option value="student">student</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(user._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminUserList;