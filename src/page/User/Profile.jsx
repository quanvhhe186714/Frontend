import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../services/user";
import orderService from "../../services/order";
import "./profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", avatar: "" });
  const [orders, setOrders] = useState([]);
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
        
        // Fetch Orders
        const ordersData = await orderService.getMyOrders();
        setOrders(ordersData);

      } catch (err) {
        setMessage("Please login.");
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
    navigate("/");
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
      setMessage("Updated successfully!");
    } catch (err) {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
        setMessage("Avatar uploaded!");
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setMessage("Avatar upload failed!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">{message}</div>;

  return (
    <div className="profile-container">
      <div className="profile-box">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button onClick={handleBack} className="outline-btn">
            ← Back
          </button>
        </div>

        {message && <div className="alert">{message}</div>}

        <div className="profile-content">
          <div className="profile-left">
            <div className="avatar-wrapper">
              <img
                src={formData.avatar || user.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                className="avatar"
              />
            </div>
            <p className="role">Role: {user.role}</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
               <div className="form-group">
                <label>Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

          </div>

          <div className="profile-right">
            <h3>Order History</h3>
            {orders.length === 0 ? <p>No orders yet.</p> : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <span>#{order._id.substring(0,8)}</span>
                                <span className={`status ${order.status}`}>{order.status}</span>
                            </div>
                            <p className="date">{new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="total">Total: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                            {order.paymentDetails?.telegramUsername && (
                              <p>Telegram: {order.paymentDetails.telegramUsername}</p>
                            )}
                            <ul className="order-items">
                                {order.items.map((item, i) => {
                                  let expiry = null;
                                  if (item.durationMonths && order.createdAt) {
                                    const d = new Date(order.createdAt);
                                    d.setMonth(d.getMonth() + item.durationMonths);
                                    expiry = d.toLocaleDateString();
                                  }
                                  return (
                                    <li key={i}>
                                      {item.quantity}x {item.name}
                                      {expiry && <span style={{ marginLeft: 8, opacity: 0.8 }}>(Expiry: {expiry})</span>}
                                    </li>
                                  );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
