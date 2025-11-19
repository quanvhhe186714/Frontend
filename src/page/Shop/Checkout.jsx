import React, { useEffect, useMemo, useState } from "react";
import orderService from "../../services/order";
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
      await orderService.createOrder({
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
      localStorage.removeItem("cart");
      setCart([]);
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Đặt hàng thành công!';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
      navigate("/profile");
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
    </div>
  );
};

export default Checkout;


