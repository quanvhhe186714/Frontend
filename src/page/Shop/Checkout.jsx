import React, { useEffect, useMemo, useState } from "react";
import orderService from "../../services/order";
import api from "../../services/apiService";
import "./shop.scss";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    telegramUsername: "",
    paymentMethod: "momo",
    couponCode: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [qrModal, setQrModal] = useState({ 
    open: false, 
    imageUrl: "", 
    content: "", 
    amount: 0,
    accountName: "",
    accountNo: "",
    phone: ""
  });

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(c);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.user?.name) {
      setForm(s => ({ ...s, name: userInfo.user.name, email: userInfo.user.email || "" }));
    }
  }, []);

  const subTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const applyCoupon = async () => {
    if (!form.couponCode.trim()) return;
    try {
      const res = await orderService.validateCoupon(form.couponCode, subTotal);
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = `Áp dụng mã thành công: -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.discountAmount)}`;
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
    } catch (e) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = e.response?.data?.message || "Mã không hợp lệ";
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      return;
    }
    setSubmitting(true);
    try {
      // Tạo đơn hàng
      const created = await orderService.createOrder({
        items: cart,
        paymentMethod: form.paymentMethod,
        couponCode: form.couponCode || undefined,
        // Lưu thông tin khách hàng trong paymentDetails
        paymentDetails: {
          name: form.name,
          email: form.email,
          telegramUsername: form.telegramUsername
        }
      });

      // Luôn hiển thị QR code với số tiền cần thanh toán
      const content = `MMOS-${created._id}`;
      try {
        const res = await api.get("/payments/qr", {
          params: { 
            amount: created.totalAmount, 
            content,
            bank: "mb" // Mặc định dùng MB Bank
          },
        });
        
        // Hiển thị modal QR với số tiền cần thanh toán
        setQrModal({ 
          open: true, 
          imageUrl: res.data.imageUrl, 
          content, 
          amount: created.totalAmount,
          accountName: res.data.accountName || "",
          accountNo: res.data.accountNo || "",
          phone: res.data.phone || ""
        });
      } catch (e) {
        // Nếu không tạo được QR, vẫn hiển thị thông tin thanh toán
        const el = document.createElement('div');
        el.className = 'simple-toast';
        el.innerText = "Không tạo được QR code. Vui lòng chuyển khoản thủ công với số tiền: " + 
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(created.totalAmount);
        document.body.appendChild(el);
        setTimeout(() => document.body.removeChild(el), 4000);
        
        // Vẫn xóa giỏ hàng và chuyển về profile
        localStorage.removeItem("cart");
        setCart([]);
        setTimeout(() => navigate("/profile"), 2000);
      }
    } catch (error) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = error.response?.data?.message || "Thanh toán thất bại";
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Thanh toán</h2>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Username Telegram</label>
            <input placeholder="@yourhandle" value={form.telegramUsername} onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="momo">MOMO</option>
              <option value="bank_transfer">Banking</option>
              <option value="vnpay">VNPay</option>
              <option value="fake">Giả lập</option>
            </select>
          </div>

          <div className="form-group row">
            <input placeholder="Mã giảm giá" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} />
            <button type="button" onClick={applyCoupon}>Áp dụng</button>
          </div>

          <button type="submit" className="checkout-btn" disabled={submitting || cart.length === 0}>
            {submitting ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </form>

        <div className="order-summary">
          <h3>Đơn hàng</h3>
          {cart.length === 0 ? (
            <p>Chưa có sản phẩm</p>
          ) : (
            <ul>
              {cart.map((i) => (
                <li key={i.productId}>
                  <span>{i.name} × {i.quantity}</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="summary-total">
            <span>Tạm tính</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}</span>
          </div>
        </div>
      </div>

      {qrModal.open && (
        <div className="qr-modal-overlay" onClick={() => {}}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qr-modal-header">
              <button className="qr-modal-close" onClick={() => {
                localStorage.removeItem("cart");
                setCart([]);
                setQrModal(s => ({ ...s, open: false }));
                navigate("/profile");
              }}>×</button>
              <h3>QR thanh toán</h3>
              <div className="qr-modal-actions">
                <button className="qr-share-btn" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Thanh toán đơn hàng',
                      text: `Số tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrModal.amount)}`,
                      url: qrModal.imageUrl
                    });
                  }
                }}>📤</button>
              </div>
            </div>
            
            <div className="qr-payment-amount">
              <p className="qr-payment-label">Số tiền cần thanh toán:</p>
              <p className="qr-payment-value">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrModal.amount)}
              </p>
            </div>
            
            <div className="qr-card-container">
              <div className="qr-card">
                {qrModal.accountName && (
                  <div className="qr-recipient-header">
                    <div className="qr-recipient-icon">⭐</div>
                    <div className="qr-recipient-info">
                      <div className="qr-recipient-name">{qrModal.accountName.toUpperCase()}</div>
                      {qrModal.phone && <div className="qr-recipient-phone">{qrModal.phone}</div>}
                    </div>
                    <div className="qr-recipient-dropdown">⌄</div>
                  </div>
                )}
                
                <div className="qr-code-wrapper">
                  <img src={qrModal.imageUrl} alt="VietQR" className="qr-code-image" />
                </div>
                
                <div className="qr-logos">
                  <span className="qr-logo-vietqr">VIETQR</span>
                  <span className="qr-logo-napas">napas 247</span>
                </div>
              </div>
              
              <div className="qr-info-section">
                <p className="qr-content-text">
                  <strong>Nội dung:</strong> {qrModal.content}
                </p>
                <p className="qr-note">Quét mã QR bằng app ngân hàng để thanh toán</p>
              </div>
            </div>
            
            <div className="qr-modal-footer">
              <button className="qr-complete-btn" onClick={() => {
                localStorage.removeItem("cart");
                setCart([]);
                setQrModal(s => ({ ...s, open: false }));
                navigate("/profile");
              }}>Đã thanh toán xong</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;


