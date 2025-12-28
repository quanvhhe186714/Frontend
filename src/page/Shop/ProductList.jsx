import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product";
import categoryService from "../../services/category";
import { getProductRatingSummary } from "../../services/review";
import "./shop.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingSummaries, setRatingSummaries] = useState({});
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
      
      // Load rating summaries for all products
      const summaryPromises = data.map(async (product) => {
        try {
          const summary = await getProductRatingSummary(product._id);
          return { productId: product._id, summary };
        } catch (error) {
          console.error(`Failed to load rating for product ${product._id}`, error);
          return { productId: product._id, summary: { averageRating: 0, totalReviews: 0 } };
        }
      });
      
      const summaries = await Promise.all(summaryPromises);
      const summaryMap = {};
      summaries.forEach(({ productId, summary }) => {
        summaryMap[productId] = summary;
      });
      setRatingSummaries(summaryMap);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
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
    const categoryCodes = categories.map(c => c.code);
    const grouped = {};
    
    // Group products by category
    categories.forEach(cat => {
      grouped[cat.code] = products.filter(p => p.category === cat.code);
    });
    
    // Group products without category or with unknown category as OTHER
    grouped.OTHER = products.filter(p => !p.category || !categoryCodes.includes(p.category));
    
    return grouped;
  }, [products, categories]);

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
        <button
          onClick={() => setActiveTab("ALL")}
          className={activeTab === "ALL" ? "tab active" : "tab"}
        >
          Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat.code}
            onClick={() => setActiveTab(cat.code)}
            className={activeTab === cat.code ? "tab active" : "tab"}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {activeTab === "ALL" ? (
        <>
          {categories.map(cat => (
            groups[cat.code] && groups[cat.code].length > 0 && (
              <section key={cat.code} style={{ marginBottom: 24 }}>
                <h3>{cat.name}</h3>
                <div className="product-grid">
                  {groups[cat.code].map((p) => {
                    const ratingSummary = ratingSummaries[p._id] || { averageRating: 0, totalReviews: 0 };
                    return (
                      <div key={p._id} className="product-card">
                        <div className="card-header">
                            <h3>{p.name}</h3>
                            <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                        </div>
                        {ratingSummary.totalReviews > 0 ? (
                          <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                            <span>⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                            <span style={{ marginLeft: '8px' }}>({ratingSummary.totalUsers || ratingSummary.totalReviews} người đánh giá)</span>
                          </div>
                        ) : (
                          <div style={{ marginBottom: '8px', fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                            Chưa có đánh giá
                          </div>
                        )}
                        <p className="desc">{p.description}</p>
                        <ul className="features">
                            {p.features && p.features.map((f, index) => <li key={index}>{f}</li>)}
                        </ul>
                        <div style={{ display: 'grid', gap: 10 }}>
                          <button onClick={() => addToCart(p)}>Mua ngay</button>
                          <button onClick={() => navigate(`/products/${p._id}`)} style={{ background: '#333' }}>Xem chi tiết</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )
          ))}

          {/* Khác */}
          {groups.OTHER && groups.OTHER.length > 0 && (
            <section>
              <h3>Gói khác</h3>
              <div className="product-grid">
                {groups.OTHER.map((p) => {
                  const ratingSummary = ratingSummaries[p._id] || { averageRating: 0, totalReviews: 0 };
                  return (
                    <div key={p._id} className="product-card">
                      <div className="card-header">
                          <h3>{p.name}</h3>
                          <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                      </div>
                      {ratingSummary.totalReviews > 0 ? (
                        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                          <span>⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                          <span style={{ marginLeft: '8px' }}>({ratingSummary.totalReviews} đánh giá)</span>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                          Chưa có đánh giá
                        </div>
                      )}
                      <p className="desc">{p.description}</p>
                      <ul className="features">
                          {p.features && p.features.map((f, index) => <li key={index}>{f}</li>)}
                      </ul>
                      <div style={{ display: 'grid', gap: 10 }}>
                        <button onClick={() => addToCart(p)}>Mua ngay</button>
                        <button onClick={() => navigate(`/products/${p._id}`)} style={{ background: '#333' }}>Xem chi tiết</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="product-grid">
          {(groups[activeTab] || []).map((p) => {
            const ratingSummary = ratingSummaries[p._id] || { averageRating: 0, totalReviews: 0 };
            return (
              <div key={p._id} className="product-card">
                <div className="card-header">
                    <h3>{p.name}</h3>
                    <span className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</span>
                </div>
                {ratingSummary.totalReviews > 0 ? (
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                    <span>⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                    <span style={{ marginLeft: '8px' }}>({ratingSummary.totalReviews} đánh giá)</span>
                  </div>
                ) : (
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                    Chưa có đánh giá
                  </div>
                )}
                <p className="desc">{p.description}</p>
                <ul className="features">
                    {p.features && p.features.map((f, index) => <li key={index}>{f}</li>)}
                </ul>
                <div style={{ display: 'grid', gap: 10 }}>
                  <button onClick={() => addToCart(p)}>Mua ngay</button>
                  <button onClick={() => navigate(`/products/${p._id}`)} style={{ background: '#333' }}>Xem chi tiết</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;

