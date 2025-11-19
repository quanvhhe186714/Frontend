import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product";
import "./shop.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
        productId: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    // simple toast-like inline feedback
    const el = document.createElement('div');
    el.className = 'simple-toast';
    el.innerText = 'Đã thêm vào giỏ hàng';
    document.body.appendChild(el);
    setTimeout(() => document.body.removeChild(el), 1500);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <h2>Our Packages</h2>
        <div className="product-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="product-card skeleton">
              <div className="card-header"><div className="skl-title" /><div className="skl-price" /></div>
              <div className="desc skl-line" />
              <div className="features">
                <div className="skl-line" />
                <div className="skl-line" />
                <div className="skl-line" />
              </div>
              <div className="skl-btn" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <h2>Our Packages</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <div className="card-header">
                <h3>{p.name}</h3>
                <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
            </div>
            <p className="desc">{p.description}</p>
            <ul className="features">
                {p.features && p.features.map((f, index) => <li key={index}>{f}</li>)}
            </ul>
            <div style={{ display: 'grid', gap: 10 }}>
              <button onClick={() => addToCart(p)}>Mua ngay</button>
              <button onClick={() => navigate(`/products/${p._id}`)} style={{ background: '#333' }}>Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

