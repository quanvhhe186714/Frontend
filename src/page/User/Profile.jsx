import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../services/user";
import orderService from "../../services/order";
import walletService from "../../services/wallet";
import "./profile.scss";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("mb");
  const [topupInstructions, setTopupInstructions] = useState(null);
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setUser(data);
        setFormData({
          name: data.name,
        });
        
        // Fetch Orders
        const ordersData = await orderService.getMyOrders();
        setOrders(ordersData);

        await fetchWalletInfo();
      } catch (err) {
        setMessage("Please login.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      const { data } = await walletService.getWallet();
      setWallet(data.wallet);
      setTransactions(data.recentTransactions || []);
    } catch (error) {
      console.error("Failed to load wallet", error);
    }
  };

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
      const { data } = await updateMyProfile(formData.name, "");
      setUser(data);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        userInfo.user.name = data.name;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      setMessage("Updated successfully!");
    } catch (err) {
      setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  };


  const handleAvatarError = (e) => {
    e.target.style.display = 'none';
    // Show placeholder sẽ được xử lý bởi CSS
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || Number(topupAmount) <= 0) {
      setMessage("Số tiền nạp không hợp lệ");
      return;
    }
    try {
      setTopupLoading(true);
      const { data } = await walletService.createTopupRequest(Number(topupAmount), "bank_transfer", selectedBank);
      setTopupInstructions(data.instructions);
      setTransactions((prev) => [data.transaction, ...prev].slice(0, 10));
      setTopupAmount("");
      setMessage("Tạo yêu cầu nạp tiền thành công. Vui lòng chuyển khoản theo hướng dẫn.");
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể tạo yêu cầu nạp tiền";
      setMessage(msg);
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">{message}</div>;

  const qrUrl = topupInstructions
    ? `https://img.vietqr.io/image/${encodeURIComponent(
        topupInstructions.bin
      )}-${encodeURIComponent(
        topupInstructions.accountNumber
      )}-compact2.png?amount=${topupInstructions.amount}&addInfo=${
        topupInstructions.transferContent
      }&accountName=${encodeURIComponent(topupInstructions.accountName)}`
    : null;

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
              <div className="avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
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
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

          </div>

          <div className="profile-right">
            <div className="wallet-card">
              <div className="wallet-balance">
                <div>
                  <p>Số dư ví</p>
                  <h2>
                    {wallet
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(wallet.balance)
                      : "--"}
                  </h2>
                </div>
                <button onClick={fetchWalletInfo} className="outline-btn small">
                  Làm mới
                </button>
              </div>

              <form className="topup-form" onSubmit={handleTopup}>
                <div className="form-group">
                  <label>Số tiền muốn nạp (VND)</label>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Nhập số tiền"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ngân hàng</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="mb">MB Bank</option>
                    <option value="cake">CAKE Bank</option>
                  </select>
                </div>
                <button className="primary-btn" type="submit" disabled={topupLoading}>
                  {topupLoading ? "Đang tạo QR..." : "Tạo yêu cầu nạp tiền"}
                </button>
              </form>

              {topupInstructions && (
                <div className="topup-instructions">
                  <h4>Hướng dẫn chuyển khoản</h4>
                  <ul>
                    <li>
                      Ngân hàng: <strong>{topupInstructions.bank}</strong>
                    </li>
                    <li>
                      Chủ tài khoản: <strong>{topupInstructions.accountName}</strong>
                    </li>
                    <li>
                      Số tài khoản: <strong>{topupInstructions.accountNumber}</strong>
                    </li>
                    <li>
                      Số tiền:{" "}
                      <strong>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(topupInstructions.amount)}
                      </strong>
                    </li>
                    <li>
                      Nội dung: <strong>{topupInstructions.transferContent}</strong>
                    </li>
                  </ul>
                  {qrUrl && (
                    <div className="qr-preview">
                      <img src={qrUrl} alt="QR Code" />
                      <p>Quét QR để nạp tiền nhanh chóng</p>
                    </div>
                  )}
                </div>
              )}
            </div>

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

            <div className="wallet-history">
              <h3>Lịch sử nạp tiền</h3>
              {transactions.length === 0 ? (
                <p>Chưa có giao dịch nạp tiền.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>Số tiền</th>
                      <th>Phương thức</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>{tx.referenceCode}</td>
                        <td>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(tx.amount)}
                        </td>
                        <td>{tx.bank?.toUpperCase()}</td>
                        <td>
                          <span className={`status ${tx.status}`}>{tx.status}</span>
                        </td>
                        <td>{new Date(tx.createdAt).toLocaleString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
