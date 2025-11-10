import React, { useState, useEffect } from "react";
import { getAllUsers, deleteUser, updateUser } from "../../services/user";
import { getClubsForAdmin, approveClub, rejectClub } from "../../services/club";
import "./admin.scss";

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // 🧭 Lấy danh sách user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (error) {
      setMessage("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingClubs();
  }, []);

  // ✏️ Mở form chỉnh sửa
  const handleEdit = (user) => setEditUser({ ...user });

  const handleSave = async () => {
    try {
      await updateUser(
        editUser._id,
        editUser.name,
        editUser.role,
        editUser.status
      );
      setMessage("Cập nhật thành công");
      setEditUser(null);
      fetchUsers();
    } catch {
      setMessage("Lỗi khi cập nhật người dùng");
    }
  };

  // ❌ Xóa user
  const confirmDelete = (user) =>
    setConfirmDialog({
      title: "Xóa người dùng",
      message: `Bạn có chắc muốn xóa ${user.name}?`,
      onConfirm: async () => {
        try {
          await deleteUser(user._id);
          setMessage("Đã xóa người dùng");
          fetchUsers();
        } catch {
          setMessage("Lỗi khi xóa người dùng");
        } finally {
          setConfirmDialog(null);
        }
      },
    });

  // 🔒 Khóa / Mở khóa user
  const confirmBlock = (user) =>
    setConfirmDialog({
      title: user.status === "blocked" ? "Mở khóa" : "Khóa người dùng",
      message: `Bạn có chắc muốn ${
        user.status === "blocked" ? "mở khóa" : "khóa"
      } ${user.name}?`,
      onConfirm: async () => {
        try {
          const newStatus = user.status === "blocked" ? "active" : "blocked";
          await updateUser(user._id, user.name, user.role, newStatus);
          setMessage("Cập nhật trạng thái thành công");
          fetchUsers();
        } catch {
          setMessage("Lỗi khi cập nhật trạng thái");
        } finally {
          setConfirmDialog(null);
        }
      },
    });

  // 🏷️ Lấy danh sách CLB pending để duyệt
  const fetchPendingClubs = async () => {
    try {
      setClubsLoading(true);
      const { data } = await getClubsForAdmin({ status: "pending" });
      setPendingClubs(data || []);
    } catch (error) {
      setMessage("Lỗi khi tải danh sách CLB chờ duyệt");
      setPendingClubs([]);
    } finally {
      setClubsLoading(false);
    }
  };

  // ✅ Duyệt CLB
  const handleApproveClub = async (clubId) => {
    try {
      await approveClub(clubId);
      setMessage("Đã duyệt CLB. User được nâng lên Manager nếu cần.");
      fetchPendingClubs();
    } catch {
      setMessage("Lỗi khi duyệt CLB");
    }
  };

  // ❌ Từ chối CLB
  const handleRejectClub = async (clubId) => {
    try {
      await rejectClub(clubId);
      setMessage("Đã từ chối yêu cầu tạo CLB.");
      fetchPendingClubs();
    } catch {
      setMessage("Lỗi khi từ chối CLB");
    }
  };

  return (
    <div className="admin-page container">
      <h1 className="admin-title">👑 Quản trị</h1>

      {/* Section: Duyệt CLB */}
      <section className="admin-section">
        <h2>📝 Yêu cầu tạo CLB (chờ duyệt)</h2>
        {clubsLoading ? (
          <p>Đang tải danh sách CLB...</p>
        ) : pendingClubs.length === 0 ? (
          <p>Không có yêu cầu tạo CLB nào.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên CLB</th>
                <th>Người đề xuất</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingClubs.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>
                    {c.managerId?.name} ({c.managerId?.email})
                  </td>
                  <td>{c.description}</td>
                  <td>
                    <span className="status">{c.status}</span>
                  </td>
                  <td>
                    <button onClick={() => handleApproveClub(c._id)}>✅ Duyệt</button>
                    <button onClick={() => handleRejectClub(c._id)}>❌ Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {loading ? (
        <p>Đang tải danh sách người dùng...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className={u.status === "blocked" ? "blocked" : ""}
              >
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span
                    className={`status ${
                      u.status === "blocked" ? "error" : "success"
                    }`}
                  >
                    {u.status === "blocked" ? "Đã khóa" : "Hoạt động"}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(u)}>✏️</button>
                  <button onClick={() => confirmBlock(u)}>
                    {u.status === "blocked" ? "🔓" : "🔒"}
                  </button>
                  <button onClick={() => confirmDelete(u)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <div className="snackbar">{message}</div>}

      {/* Edit Dialog */}
      {editUser && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>Chỉnh sửa người dùng</h3>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />
            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <div className="dialog-actions">
              <button onClick={() => setEditUser(null)}>Hủy</button>
              <button onClick={handleSave} className="primary">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="dialog">
          <div className="dialog-content">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="dialog-actions">
              <button onClick={() => setConfirmDialog(null)}>Hủy</button>
              <button onClick={confirmDialog.onConfirm} className="danger">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
