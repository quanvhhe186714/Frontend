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
      <div className="page-header">
        <h2>Sản phẩm</h2>
        <p className="page-subtitle">Khám phá các gói dịch vụ và sản phẩm của chúng tôi</p>
      </div>

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
              <section key={cat.code} className="category-section">
                <h3 className="category-title">{cat.name}</h3>
                <div className="product-grid">
                  {groups[cat.code].map((p) => {
                    const ratingSummary = ratingSummaries[p._id] || { averageRating: 0, totalReviews: 0 };
                    return (
                      <div key={p._id} className="product-card">
                        <div className="product-image-wrapper">
                          <img 
                            src={p.image || "/placeholder-fashion.jpg"} 
                            alt={p.name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23f0f0f0' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3E👗%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <div className="product-overlay">
                            <button className="quick-view-btn" onClick={() => navigate(`/products/${p._id}`)}>
                              Xem nhanh
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <h3 className="product-name">{p.name}</h3>
                          {ratingSummary.totalReviews > 0 ? (
                            <div className="product-rating">
                              <span className="stars">⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                              <span className="review-count">({ratingSummary.totalUsers || ratingSummary.totalReviews} đánh giá)</span>
                            </div>
                          ) : (
                            <div className="product-rating no-rating">
                              <span>Chưa có đánh giá</span>
                            </div>
                          )}
                          <p className="product-desc">{p.description}</p>
                          <div className="product-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                          <div className="product-actions">
                            <button className="btn-add-cart" onClick={() => addToCart(p)}>Thêm vào giỏ</button>
                            <button className="btn-view-detail" onClick={() => navigate(`/products/${p._id}`)}>Chi tiết</button>
                          </div>
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
            <section className="category-section">
              <h3 className="category-title">Sản phẩm khác</h3>
              <div className="product-grid">
                {groups.OTHER.map((p) => {
                  const ratingSummary = ratingSummaries[p._id] || { averageRating: 0, totalReviews: 0 };
                  return (
                    <div key={p._id} className="product-card">
                      <div className="product-image-wrapper">
                        <img 
                          src={p.image || "/placeholder-fashion.jpg"} 
                          alt={p.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23f0f0f0' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3E👗%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="product-overlay">
                          <button className="quick-view-btn" onClick={() => navigate(`/products/${p._id}`)}>
                            Xem nhanh
                          </button>
                        </div>
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{p.name}</h3>
                        {ratingSummary.totalReviews > 0 ? (
                          <div className="product-rating">
                            <span className="stars">⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                            <span className="review-count">({ratingSummary.totalReviews} đánh giá)</span>
                          </div>
                        ) : (
                          <div className="product-rating no-rating">
                            <span>Chưa có đánh giá</span>
                          </div>
                        )}
                        <p className="product-desc">{p.description}</p>
                        <div className="product-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                        <div className="product-actions">
                          <button className="btn-add-cart" onClick={() => addToCart(p)}>Thêm vào giỏ</button>
                          <button className="btn-view-detail" onClick={() => navigate(`/products/${p._id}`)}>Chi tiết</button>
                        </div>
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
                <div className="product-image-wrapper">
                  <img 
                    src={p.image || "/placeholder-fashion.jpg"} 
                    alt={p.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect fill='%23f0f0f0' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3E👗%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="product-overlay">
                    <button className="quick-view-btn" onClick={() => navigate(`/products/${p._id}`)}>
                      Xem nhanh
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.name}</h3>
                  {ratingSummary.totalReviews > 0 ? (
                    <div className="product-rating">
                      <span className="stars">⭐ {ratingSummary.averageRating.toFixed(1)}</span>
                      <span className="review-count">({ratingSummary.totalReviews} đánh giá)</span>
                    </div>
                  ) : (
                    <div className="product-rating no-rating">
                      <span>Chưa có đánh giá</span>
                    </div>
                  )}
                  <p className="product-desc">{p.description}</p>
                  <div className="product-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</div>
                  <div className="product-actions">
                    <button className="btn-add-cart" onClick={() => addToCart(p)}>Thêm vào giỏ</button>
                    <button className="btn-view-detail" onClick={() => navigate(`/products/${p._id}`)}>Chi tiết</button>
                  </div>
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

