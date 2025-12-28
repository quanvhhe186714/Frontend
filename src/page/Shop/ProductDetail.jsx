import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../services/product";
import { getProductReviews } from "../../services/review";
import "./shop.scss";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        
        // Load reviews
        try {
          const reviewsData = await getProductReviews(id);
          setReviews(reviewsData);
        } catch (reviewError) {
          console.error("Failed to load reviews:", reviewError);
        }
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

      {/* Reviews Section */}
      <div className="reviews-section" style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Đánh giá sản phẩm</h3>
        {reviews.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Chưa có đánh giá nào cho sản phẩm này</p>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <p>
                <strong>Tổng đánh giá:</strong> {reviews.length} đánh giá
                {reviews.length > 0 && (
                  <span style={{ marginLeft: '15px' }}>
                    <strong>Đánh giá trung bình:</strong> {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}/5
                    {'⭐'.repeat(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                  </span>
                )}
              </p>
            </div>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  style={{
                    padding: '15px',
                    marginBottom: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#007bff',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <strong>{review.user?.name || 'Unknown'}</strong>
                        {review.isFake && (
                          <span
                            style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                            title="Đánh giá ảo"
                          >
                            ẢO
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    {'⭐'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)} ({review.rating}/5)
                  </div>
                  {review.comment && (
                    <p style={{ margin: 0, color: '#333' }}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;


