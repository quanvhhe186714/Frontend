import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product";
import "./shop.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | VIA | PROXY | DICH_VU_MXH

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
    // Chuyển đến trang giỏ hàng
    navigate("/cart");
  };

  const groups = useMemo(() => {
    const toGroup = (cat) => products.filter(p => p.category === cat);
    return {
      VIA: toGroup("VIA"),
      PROXY: toGroup("PROXY"),
      DICH_VU_MXH: toGroup("DICH_VU_MXH"),
      OTHER: products.filter(p => !["VIA","PROXY","DICH_VU_MXH"].includes(p.category))
    };
  }, [products]);

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
      <h2>Sản phẩm</h2>

      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {["ALL","VIA","PROXY","DICH_VU_MXH"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "tab active" : "tab"}
          >
            {tab === "ALL" ? "Tất cả" : tab === "DICH_VU_MXH" ? "Dịch vụ MXH hoàn chỉnh" : tab}
          </button>
        ))}
      </div>

      {activeTab === "ALL" ? (
        <>
          {/* VIA */}
          {groups.VIA.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3>VIA</h3>
              <div className="product-grid">
                {groups.VIA.map((p) => (
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
            </section>
          )}

          {/* PROXY */}
          {groups.PROXY.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3>PROXY</h3>
              <div className="product-grid">
                {groups.PROXY.map((p) => (
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
            </section>
          )}

          {/* Dịch vụ MXH */}
          {groups.DICH_VU_MXH.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3>Dịch vụ MXH hoàn chỉnh</h3>
              <div className="product-grid">
                {groups.DICH_VU_MXH.map((p) => (
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
            </section>
          )}

          {/* Khác */}
          {groups.OTHER.length > 0 && (
            <section>
              <h3>Gói khác</h3>
              <div className="product-grid">
                {groups.OTHER.map((p) => (
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
            </section>
          )}
        </>
      ) : (
        <div className="product-grid">
          {(activeTab === "VIA" ? groups.VIA
            : activeTab === "PROXY" ? groups.PROXY
            : groups.DICH_VU_MXH).map((p) => (
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
      )}
    </div>
  );
};

export default ProductList;

