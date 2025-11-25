import React, { useEffect, useState } from "react";
import orderService from "../../services/order";
import { useNavigate } from "react-router-dom";
import "./shop.scss";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
    
    const handleCartUpdate = () => {
         const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
         setCart(updatedCart);
         setDiscount(0); // Reset discount on cart change
         setAppliedCoupon(null);
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const updateQuantity = (productId, delta) => {
    const newCart = cart.map(item => {
        if (item.productId === productId) {
            // Nếu là dịch vụ, không cho phép thay đổi quantity (phải xóa và thêm lại)
            if (item.type === "service") {
              return item; // Giữ nguyên
            }
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;
      try {
          const res = await orderService.validateCoupon(couponCode, subTotal);
          if (res.success) {
              setDiscount(res.discountAmount);
              setAppliedCoupon(res.code);
              const el = document.createElement('div');
              el.className = 'simple-toast';
              el.innerText = res.message;
              document.body.appendChild(el);
              setTimeout(() => document.body.removeChild(el), 1500);
          }
      } catch (error) {
          const el = document.createElement('div');
          el.className = 'simple-toast';
          el.innerText = error.response?.data?.message || "Invalid Coupon";
          document.body.appendChild(el);
          setTimeout(() => document.body.removeChild(el), 1500);
          setDiscount(0);
          setAppliedCoupon(null);
      }
  };

  const handleCheckout = () => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      const el = document.createElement('div');
      el.className = 'simple-toast';
      el.innerText = 'Please login to checkout';
      document.body.appendChild(el);
      setTimeout(() => document.body.removeChild(el), 1500);
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const total = Math.max(0, subTotal - discount);

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.productId}>
                  <td>
                    <div>
                      <strong>{item.name}</strong>
                      {item.type === "service" && item.serviceQuantity && (
                        <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                          Số lượng: {item.serviceQuantity} {item.serviceUnitLabel}
                          {item.server && ` - ${item.server.name}`}
                          {item.emotion && ` - ${item.emotion}`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                  <td>
                    {item.type === "service" ? (
                      <span>1</span>
                    ) : (
                      <>
                        <button onClick={() => updateQuantity(item.productId, -1)}>-</button>
                        {item.quantity}
                        <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                      </>
                    )}
                  </td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
                  <td><button className="remove-btn" onClick={() => removeItem(item.productId)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="cart-summary">
            <div className="coupon-section">
                <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={handleApplyCoupon}>Apply</button>
            </div>
            
            <div className="totals">
                <p>Subtotal: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}</p>
                {discount > 0 && <p className="discount">Discount: -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</p>}
                <h3>Total: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</h3>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
