import React, { useEffect, useState } from "react";
import {
  getMyManagedClubs,
  createClub,
  updateClub,
  deleteClub,
} from "../../services/club";
import "./manager-manage-clubs.scss";

const ManageClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingClub, setEditingClub] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Other",
    logo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const { data } = await getMyManagedClubs();
      setClubs(data || []);
    } catch (e) {
      setMessage("Lỗi khi tải danh sách CLB của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const openCreate = () => {
    setEditingClub(null);
    setForm({ name: "", description: "", category: "Other", logo: "" });
    setShowForm(true);
  };

  const openEdit = (club) => {
    setEditingClub(club);
    setForm({
      name: club.name || "",
      description: club.description || "",
      category: club.category || "Other",
      logo: club.logo || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      if (editingClub) {
        await updateClub(editingClub._id, form);
        setMessage("Cập nhật CLB thành công");
      } else {
        await createClub(form);
        setMessage("Tạo CLB thành công. Vui lòng chờ admin duyệt");
      }
      setEditingClub(null);
      setForm({ name: "", description: "", category: "Other", logo: "" });
      setShowForm(false);
      await loadClubs();
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa CLB này?")) return;
    try {
      await deleteClub(clubId);
      setMessage("Đã xóa CLB");
      await loadClubs();
    } catch (e) {
      setMessage(e.response?.data?.message || "Xóa CLB thất bại");
    }
  };

  return (
    <div className="manager-manage-clubs-page">
      <div className="container">
        <h1 className="page-title">🛠️ Quản lý CLB của tôi</h1>

        {message && <div className="message">{message}</div>}

        <div className="actions">
          <button className="btn primary" onClick={openCreate}>
            ➕ Tạo CLB
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : clubs.length === 0 ? (
          <p>Bạn chưa có CLB nào. Hãy tạo một CLB mới.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.category}</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button onClick={() => openEdit(c)}>✏️ Sửa</button>
                    <button onClick={() => handleDelete(c._id)}>🗑️ Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div
          className={`drawer ${showForm ? "open" : ""}`}
          style={{ display: showForm ? "block" : "none" }}
        >
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingClub ? "Chỉnh sửa CLB" : "Tạo CLB mới"}</h3>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Tên CLB</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Logo (chọn ảnh)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, logo: e.target.files[0] })
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingClub(null);
                    setForm({
                      name: "",
                      description: "",
                      category: "Other",
                      logo: "",
                    });
                    setShowForm(false);
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="primary" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageClubs;
