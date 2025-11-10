import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../services/user";
import "./profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", avatar: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setUser(data);
        setFormData({
          name: data.name,
          avatar: data.avatar || "",
        });
      } catch (err) {
        setMessage("❌ Không thể tải hồ sơ. Bạn đã đăng nhập chưa?");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    navigate("/event");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateMyProfile(formData.name, formData.avatar);
      setUser(data);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        userInfo.user.name = data.name;
        userInfo.user.avatar = data.avatar;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      setMessage("✅ Cập nhật thành công!");
    } catch (err) {
      setMessage("❌ Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setMessage("❌ File quá lớn (tối đa 5MB)");

    const form = new FormData();
    form.append("avatar", file);

    try {
      setSaving(true);
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch("http://localhost:9999/users/upload-avatar", {
        method: "POST",
        headers: { Authorization: token },
        body: form,
      });
      const result = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, avatar: result.avatarUrl }));
        setUser((prev) => ({ ...prev, avatar: result.avatarUrl }));
        setMessage("✅ Upload ảnh thành công!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setMessage("❌ Upload ảnh thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">⏳ Đang tải hồ sơ...</div>;
  if (!user) return <div className="error">{message}</div>;

  return (
    <div className="profile-container">
      <div className="profile-box">
        <div className="profile-header">
          <h2>Hồ sơ của bạn</h2>
          <button onClick={handleBack} className="outline-btn">
            ← Quay lại
          </button>
        </div>

        {message && <div className="alert">{message}</div>}

        <div className="profile-content">
          <div className="profile-left">
            <div className="avatar-wrapper">
              <img
                src={formData.avatar || user.avatar || "/default-avatar.png"}
                alt="avatar"
                className="avatar"
              />
            </div>
            <p className="role">Vai trò: {user.role}</p>
            <div className="joined-clubs">
              <h4>CLB đã tham gia</h4>
              {Array.isArray(user.joinedClubs) && user.joinedClubs.length > 0 ? (
                <ul>
                  {user.joinedClubs.map((c, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {c.clubId?.logo && (
                        <img src={c.clubId.logo} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
                      )}
                      <span>{c.clubId?.name || "Không rõ"}</span>
                      <small style={{ color: "#666" }}>
                        ({new Date(c.joinedAt).toLocaleDateString("vi-VN")})
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa tham gia CLB nào.</p>
              )}
            </div>
          </div>

          <div className="profile-right">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
              </div>

              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ảnh đại diện</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "💾 Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
