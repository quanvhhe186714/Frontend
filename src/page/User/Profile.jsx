import React, { useState, useEffect, useMemo } from "react";
import { getMyProfile, updateMyProfile, changePassword } from "../../services/user";
import orderService from "../../services/order";
import messageService from "../../services/message";
import { BASE_URL } from "../../services/apiService";
import walletService from "../../services/wallet";
import QRCodeModal from "../../components/QRCodeModal/QRCodeModal";
import "./profile.scss";

const sections = [
  { key: "account", label: "Thông tin tài khoản" },
  { key: "pending", label: "Đơn hàng chờ thanh toán" },
  { key: "completed", label: "Đơn hàng đã mua" },
  { key: "payments", label: "Lịch sử thanh toán" },
  { key: "password", label: "Đổi mật khẩu" },
];

const Profile = () => {
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
  const [activeSection, setActiveSection] = useState("account");
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", text: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [orderFiles, setOrderFiles] = useState({}); // { orderId: [files] }
  const [selectedQRModal, setSelectedQRModal] = useState(null); // { orderId: qrData }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setUser(data);
        setFormData({ name: data.name });

        const ordersData = await orderService.getMyOrders();
        // #region agent log
        console.log('[DEBUG] Profile - ordersData received:', { isArray: Array.isArray(ordersData), type: typeof ordersData, ordersData });
        fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:51',message:'Profile - ordersData received',data:{isArray:Array.isArray(ordersData),type:typeof ordersData,value:ordersData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // Ensure ordersData is always an array
        const ordersArray = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersArray);

        await fetchWalletInfo();
      } catch (err) {
        setMessage("Vui lòng đăng nhập để xem thông tin.");
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
      setMessage("Cập nhật thông tin thành công!");
    } catch (err) {
      setMessage("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    if (!topupAmount || Number(topupAmount) <= 0) {
      setMessage("Số tiền nạp không hợp lệ");
      return;
    }
    try {
      setTopupLoading(true);
      const { data } = await walletService.createTopupRequest(
        Number(topupAmount),
        "bank_transfer",
        selectedBank
      );
      setTopupInstructions(data.instructions);
      setTransactions((prev) => [data.transaction, ...prev].slice(0, 10));
      setTopupAmount("");
      setMessage("Tạo yêu cầu nạp tiền thành công. Vui lòng chuyển khoản theo hướng dẫn.");
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể tạo yêu cầu nạp tiền";
      setMessage(msg);
    } finally {
      setTopupLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending"),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["paid", "completed", "delivered"].includes(order.status)
      ),
    [orders]
  );

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", text: "Mật khẩu mới không khớp" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        text: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordStatus({
        type: "success",
        text: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      setPasswordStatus({
        type: "error",
        text: error?.response?.data?.message || "Không thể đổi mật khẩu",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Load files from messages for each order
  useEffect(() => {
    const loadOrderFiles = async () => {
      const completedOrders = orders.filter((order) =>
        ["paid", "completed", "delivered"].includes(order.status)
      );
      
      const filesMap = {};
      await Promise.all(
        completedOrders.map(async (order) => {
          try {
            const messages = await messageService.getMessagesByOrderId(order._id);
            // Collect all files from messages sent by admin
            const files = [];
            messages.forEach((msg) => {
              if (msg.isFromAdmin && msg.attachments && msg.attachments.length > 0) {
                msg.attachments.forEach((file) => {
                  files.push({
                    ...file,
                    messageId: msg._id,
                    sentAt: msg.createdAt
                  });
                });
              }
            });
            if (files.length > 0) {
              filesMap[order._id] = files;
            }
          } catch (error) {
            console.error(`Failed to load files for order ${order._id}:`, error);
          }
        })
      );
      setOrderFiles(filesMap);
    };

    if (orders.length > 0) {
      loadOrderFiles();
    }
  }, [orders]);

  if (loading) return <div className="loading">Đang tải...</div>;
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

  const renderOrders = (orderList, emptyLabel) => {
    // #region agent log
    console.log('[DEBUG] renderOrders - orderList:', { isArray: Array.isArray(orderList), type: typeof orderList, orderList });
    fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:235',message:'renderOrders - orderList check',data:{isArray:Array.isArray(orderList),type:typeof orderList,value:orderList,length:orderList?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Ensure orderList is always an array
    const safeOrderList = Array.isArray(orderList) ? orderList : [];
    if (safeOrderList.length === 0) {
      return <p className="empty-state">{emptyLabel}</p>;
    }

    const getFileUrl = (fileUrl, filename = null) => {
      // Dùng endpoint download để đảm bảo extension được thêm vào
      if (fileUrl.startsWith("http")) {
        // Cloudinary hoặc external URL
        const downloadUrl = `${BASE_URL}/files/download?fileUrl=${encodeURIComponent(fileUrl)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
        return downloadUrl;
      }
      // Local file
      const downloadUrl = `${BASE_URL}/files/download?fileUrl=${encodeURIComponent(fileUrl)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
      return downloadUrl;
    };

    return (
      <div className="orders-list">
        {safeOrderList.map((order) => {
          // #region agent log
          console.log('[DEBUG] renderOrders - order.items:', { orderId: order?._id, itemsIsArray: Array.isArray(order?.items), items: order?.items });
          fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:254',message:'renderOrders - order.items check',data:{orderId:order?._id,itemsIsArray:Array.isArray(order?.items),itemsType:typeof order?.items,items:order?.items},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          const orderFilesList = orderFiles[order._id] || [];
          const hasInvoice = order.invoicePath;
          const hasFiles = orderFilesList.length > 0;
          
          return (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">#{order._id.substring(0, 8)}</div>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
              <p className="date">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p className="total">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
              </p>
              {order.paymentDetails?.telegramUsername && (
                <p className="meta">
                  Telegram: <strong>{order.paymentDetails.telegramUsername}</strong>
                </p>
              )}
              <ul className="order-items">
                {Array.isArray(order.items) ? order.items.map((item, i) => {
                  // #region agent log
                  console.log('[DEBUG] order.items.map - item:', { orderId: order?._id, itemIndex: i, item });
                  fetch('http://127.0.0.1:7243/ingest/184732e4-e99b-4d9a-b389-4ce4ab8b11ff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:280',message:'order.items.map - item data',data:{orderId:order?._id,itemIndex:i,item:item},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                  // #endregion
                  let expiry = null;
                  if (item.durationMonths && order.createdAt) {
                    const d = new Date(order.createdAt);
                    d.setMonth(d.getMonth() + item.durationMonths);
                    expiry = d.toLocaleDateString("vi-VN");
                  }
                  return (
                    <li key={`${order._id}-${i}`}>
                      {item.quantity} × {item.name}
                      {expiry && <span>(HSD: {expiry})</span>}
                    </li>
                  );
                }) : (
                  <li>No items in this order</li>
                )}
              </ul>
              {order.customQRCode && (
                <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                  <p className="meta" style={{ marginBottom: '8px' }}>
                    <strong>QR Code thanh toán:</strong>
                  </p>
                  <div
                    onClick={() => setSelectedQRModal({ orderId: order._id, qrData: order.customQRCode })}
                    style={{
                      cursor: 'pointer',
                      display: 'inline-block',
                      border: '2px solid #007bff',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <img
                      src={order.customQRCode.imageUrl}
                      alt="QR Code"
                      style={{
                        maxWidth: '150px',
                        maxHeight: '150px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                    <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Click để xem thông tin giao dịch
                    </p>
                  </div>
                </div>
              )}
              {["paid","completed","delivered"].includes(order.status) && (
                <div className="order-files-section">
                  {hasInvoice && (
                    <p className="meta">
                      <button
                        onClick={async () => {
                          try {
                            await orderService.downloadInvoice(order._id);
                          } catch (error) {
                            setMessage(error.response?.data?.message || 'Lỗi khi tải invoice');
                            setTimeout(() => setMessage(""), 3000);
                          }
                        }}
                        style={{ 
                          display: "inline-block", 
                          marginRight: "10px",
                          padding: "5px 10px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px"
                        }}
                      >
                        📄 Tải hóa đơn (PDF)
                      </button>
                    </p>
                  )}
                  {hasFiles && (
                    <div className="order-files">
                      <p className="meta" style={{ marginTop: hasInvoice ? "8px" : "0" }}>
                        <strong>Files từ người bán:</strong>
                      </p>
                      {orderFilesList.map((file, idx) => (
                        <p key={`${order._id}-file-${idx}`} className="meta">
                          <a
                            href={getFileUrl(file.url, file.originalName)}
                            download={file.originalName}
                            style={{ display: "inline-block", marginLeft: "10px" }}
                          >
                            📎 {file.originalName}
                          </a>
                          <span style={{ fontSize: "0.85em", color: "#999", marginLeft: "8px" }}>
                            ({new Date(file.sentAt).toLocaleString("vi-VN")})
                          </span>
                        </p>
                      ))}
                    </div>
                  )}
                  {!hasInvoice && !hasFiles && (
                    <p className="meta">
                      <span style={{ color: "#666", fontStyle: "italic" }}>
                        Chờ người bán gửi file
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <>
            <section className="section-card">
              <div className="section-header">
                <div>
                  <h2>Thông tin tài khoản</h2>
                  <p>Cập nhật tên hiển thị và theo dõi số dư ví</p>
                </div>
                <button onClick={fetchWalletInfo} className="outline-btn small">
                  Làm mới ví
                </button>
              </div>

              {message && (
                <div className={`alert ${message.includes("thành công") ? "success" : ""}`}>
                  {message}
                </div>
              )}

              <div className="account-grid">
                <div className="account-card">
                  <h4>Thông tin cá nhân</h4>
                  <form onSubmit={handleSubmit}>
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
                      <label>Email</label>
                      <input type="email" value={user.email} disabled />
                    </div>
                    <button type="submit" className="primary-btn" disabled={saving}>
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </form>
                </div>

                <div className="account-card">
                  <h4>Số dư ví</h4>
                  <div className="wallet-balance">
                    <strong>
                      {wallet
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(wallet.balance)
                        : "--"}
                    </strong>
                    <p>Ví tự động cập nhật khi giao dịch thành công</p>
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
                          Chủ TK: <strong>{topupInstructions.accountName}</strong>
                        </li>
                        <li>
                          Số tài khoản:{" "}
                          <strong>{topupInstructions.accountNumber}</strong>
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
                          Nội dung:{" "}
                          <strong>{topupInstructions.transferContent}</strong>
                        </li>
                      </ul>
                      {qrUrl && (
                        <div className="qr-preview">
                          <img src={qrUrl} alt="QR Code" />
                          <p>Quét QR để nạp nhanh</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        );
      case "pending":
        return (
          <section className="section-card">
            <div className="section-header">
              <div>
                <h2>Đơn hàng chờ thanh toán</h2>
                <p>Theo dõi các đơn đang ở trạng thái pending</p>
              </div>
            </div>
            {renderOrders(pendingOrders, "Bạn chưa có đơn hàng chờ thanh toán.")}
          </section>
        );
      case "completed":
        return (
          <section className="section-card">
            <div className="section-header">
              <div>
                <h2>Đơn hàng đã mua</h2>
                <p>Lịch sử các đơn đã thanh toán / hoàn tất</p>
              </div>
            </div>
            {renderOrders(completedOrders, "Bạn chưa có đơn hàng đã hoàn tất.")}
          </section>
        );
      case "payments":
        return (
          <section className="section-card">
            <div className="section-header">
              <div>
                <h2>Lịch sử thanh toán</h2>
                <p>Gồm các giao dịch nạp ví gần đây nhất</p>
              </div>
              <button onClick={fetchWalletInfo} className="outline-btn small">
                Làm mới
              </button>
            </div>
            {transactions.length === 0 ? (
              <p className="empty-state">Chưa có giao dịch nào.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>Số tiền</th>
                      <th>Ngân hàng</th>
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
              </div>
            )}
          </section>
        );
      case "password":
        return (
          <section className="section-card">
            <div className="section-header">
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Đảm bảo tài khoản của bạn luôn an toàn</p>
              </div>
            </div>

            {passwordStatus.text && (
              <div className={`alert ${passwordStatus.type === "success" ? "success" : ""}`}>
                {passwordStatus.text}
              </div>
            )}

            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <button type="submit" className="primary-btn" disabled={passwordLoading}>
                {passwordLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-dashboard">
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <div className="avatar-placeholder">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <strong>{user.name}</strong>
              <p>{user.email}</p>
              <span className="role-chip">{user.role}</span>
            </div>
          </div>
          <ul className="profile-menu">
            {sections.map((section) => (
              <li
                key={section.key}
                className={section.key === activeSection ? "active" : ""}
                onClick={() => setActiveSection(section.key)}
              >
                {section.label}
              </li>
            ))}
          </ul>
        </aside>
        <main className="profile-content">{renderContent()}</main>
      </div>
      {selectedQRModal && (
        <QRCodeModal
          qrData={selectedQRModal.qrData}
          onClose={() => setSelectedQRModal(null)}
        />
      )}
    </div>
  );
};

export default Profile;
