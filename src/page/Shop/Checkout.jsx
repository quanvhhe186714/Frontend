import React, { useEffect, useMemo, useState } from "react";
import orderService from "../../services/order";
import "./shop.scss";
import { useNavigate } from "react-router-dom";
import { PopoverHeader } from "react-bootstrap";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    telegramUsername: "",
    paymentMethod: "wallet", // Thanh toán từ ví (tiền đã được trừ tự động)
    couponCode: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(c);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.user?.name) {
      setForm(s => ({ ...s, name: userInfo.user.name, email: userInfo.user.email || "" }));
    }
  }, []);

  const subTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const total = useMemo(() => Math.max(0, subTotal - discount), [subTotal, discount]);

  const applyCoupon = async () => {
    if (!form.couponCode.trim()) return;
    try {
      const res = await orderService.validateCoupon(form.couponCode, subTotal);
      setDiscount(res.discountAmount || 0);
      setAppliedCoupon(form.couponCode);
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = `Áp dụng mã thành công: -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(res.discountAmount)}`;
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
    } catch (e) {
      setDiscount(0);
      setAppliedCoupon(null);
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
      // Tạo đơn hàng (tiền đã được trừ từ ví tự động)
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

      // Thông báo thành công và chuyển về profile
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = `Đặt hàng thành công! Đơn hàng #${created._id.substring(0, 8)} đã được tạo. Tiền đã được trừ từ ví của bạn.`;
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 3000);
      
      // Xóa giỏ hàng và chuyển về profile
      localStorage.removeItem("cart");
      setCart([]);
      setTimeout(() => navigate("/profile"), 2000);
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

          <div className="form-group row">
            <input 
              placeholder="Mã giảm giá" 
              value={form.couponCode} 
              onChange={(e) => {
                setForm({ ...form, couponCode: e.target.value });
                if (!e.target.value.trim()) {
                  setDiscount(0);
                  setAppliedCoupon(null);
                }
              }}
              disabled={!!appliedCoupon}
            />
            {appliedCoupon ? (
              <button type="button" onClick={() => {
                setForm({ ...form, couponCode: "" });
                setDiscount(0);
                setAppliedCoupon(null);
              }}>Hủy</button>
            ) : (
              <button type="button" onClick={applyCoupon}>Áp dụng</button>
            )}
          </div>
          {appliedCoupon && discount > 0 && (
            <div className="coupon-applied">
              <span>✓ Mã {appliedCoupon} đã áp dụng: -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
            </div>
          )}

          <button type="submit" className="checkout-btn" disabled={submitting || cart.length === 0}>
            {submitting ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </form>

        <div className="order-summary">
          <h3>Đơn hàng</h3>
          {cart.length === 0 ? (
            <p>Chưa có sản phẩm</p>
          ) : (
            <ul className="order-items-list">
              {cart.map((i) => (
                <li key={i.productId} className="order-item">
                  <div className="order-item-main">
                    <span className="item-name">{i.name}</span>
                    {i.type === "service" && i.serviceQuantity && (
                      <div className="service-details">
                        <span className="service-quantity">
                          Số lượng: {new Intl.NumberFormat('vi-VN').format(i.serviceQuantity)} {i.serviceUnitLabel || 'lượt'}
                        </span>
                        {i.serviceUnit && (
                          <span className="service-unit-price">
                            Đơn giá: {new Intl.NumberFormat('vi-VN').format(Math.ceil(i.price / (i.serviceQuantity / parseInt(i.serviceUnit || 1000))))}₫ / {i.serviceUnit} {i.serviceUnitLabel || 'lượt'}
                          </span>
                        )}
                      </div>
                    )}
                    {i.type !== "service" && (
                      <span className="item-quantity">× {i.quantity}</span>
                    )}
                  </div>
                  <span className="item-price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * (i.quantity || 1))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="summary-total">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Giảm giá</span>
                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Tổng cộng</span>
              <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

