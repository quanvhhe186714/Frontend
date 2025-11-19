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
              alert(res.message);
          }
      } catch (error) {
          alert(error.response?.data?.message || "Invalid Coupon");
          setDiscount(0);
          setAppliedCoupon(null);
      }
  };

  const handleCheckout = async () => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
        alert("Please login to checkout");
        navigate("/login");
        return;
    }
    
    try {
        await orderService.createOrder({
            items: cart,
            paymentMethod: "bank_transfer",
            couponCode: appliedCoupon
        });
        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        setCart([]);
        navigate("/profile"); 
    } catch (error) {
        console.error("Checkout failed", error);
        alert(error.response?.data?.message || "Checkout failed");
    }
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
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>
                    <button onClick={() => updateQuantity(item.productId, -1)}>-</button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                  </td>
                  <td>${item.price * item.quantity}</td>
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
                <p>Subtotal: ${subTotal}</p>
                {discount > 0 && <p className="discount">Discount: -${discount}</p>}
                <h3>Total: ${total}</h3>
            </div>
            
            <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
