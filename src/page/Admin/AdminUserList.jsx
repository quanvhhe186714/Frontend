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
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserList;
