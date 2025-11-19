import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../services/product";
import "./shop.scss";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (e) {
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find(i => i.productId === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    const el = document.createElement('div');
    el.className = 'simple-toast';
    el.innerText = 'Đã thêm vào giỏ hàng';
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 1500);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return null;

  return (
    <div className="product-detail-page">
      <div className="detail-card">
        <div className="detail-left">
          <img src={product.image || "/telepremium.png"} alt={product.name} className="detail-image" />
        </div>
        <div className="detail-right">
          <h2>{product.name}</h2>
          <p className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</p>
          <p className="desc">{product.description}</p>
          {Array.isArray(product.features) && product.features.length > 0 && (
            <>
              <h4>Premium includes:</h4>
              <ul className="features">
                {product.features.map((f, idx) => <li key={idx}>{f}</li>)}
              </ul>
            </>
          )}
          <div className="guide">
            <h4>Hướng dẫn kích hoạt</h4>
            <ol>
              <li>Mua gói Telegram Premium phù hợp</li>
              <li>Điền Username Telegram chính xác ở bước thanh toán</li>
              <li>Admin kích hoạt trong 5-15 phút sau khi thanh toán</li>
              <li>Kiểm tra badge Premium trong Telegram</li>
            </ol>
          </div>
          <div className="actions">
            <button onClick={addToCart}>Thêm vào giỏ</button>
            <button onClick={() => navigate("/cart")} style={{ background: "#333" }}>Xem giỏ hàng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;


