import React from "react";
import { useNavigate } from "react-router-dom";
import "./product-category.scss";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

const ProductVisual = ({ product }) => {
  if (product.image) {
    return <img className="category-product-image" src={product.image} alt={product.name} loading="lazy" />;
  }

  return (
    <div
      className="category-product-visual"
      style={{ "--accent": product.accent }}
      role="img"
      aria-label={`Ảnh minh họa ${product.name}`}
    >
      <span className="category-product-visual__grid" aria-hidden="true" />
      <span className="category-product-visual__ribbon" aria-hidden="true" />
      <span className="category-product-visual__mark">
        <span className="category-product-visual__icon">{product.icon || product.mark || product.name.slice(0, 2)}</span>
      </span>
      <span className="category-product-visual__label">{product.visualLabel || product.name}</span>
      {Array.isArray(product.badges) && product.badges.length > 0 && (
        <span className="category-product-visual__badges">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </span>
      )}
    </div>
  );
};

const ProductCategoryLanding = ({ config }) => {
  const navigate = useNavigate();
  const products = config.products || [];

  return (
    <div className="category-landing">
      <section className="category-hero">
        <div>
          <span className="category-eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <button type="button" onClick={() => navigate("/ho-tro")}>
          Nhận tư vấn
        </button>
      </section>

      <section className="category-static-grid">
        {config.heroCards.map((item) => (
          <article className="category-static-card" key={item.name} style={{ "--accent": item.accent }}>
            <div className="category-card-mark">{item.mark || item.name.slice(0, 2)}</div>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="category-products">
        <div className="category-section-head">
          <h2>{config.productsTitle || "Gói tham khảo"}</h2>
          <p>{config.productsSubtitle || `${products.length} gói seed riêng, không lấy từ database`}</p>
        </div>

        {products.length > 0 ? (
          <div className="category-product-grid">
            {products.map((product) => (
              <article className="category-product-card" key={product.id || product.name}>
                <ProductVisual product={product} />
                <div className="category-product-body">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{product.priceLabel || formatPrice(product.price)}</strong>
                  <button type="button" onClick={() => navigate("/ho-tro")}>
                    Tư vấn gói này
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="category-empty">
            <p>Chưa có seed riêng cho nhóm này.</p>
            <button type="button" onClick={() => navigate("/ho-tro")}>
              Liên hệ tư vấn
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductCategoryLanding;
