import React, { useEffect, useState } from "react";
import productService from "../../services/product";
import "./shop.scss";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    alert("Added to cart!");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="product-list-page">
      <h2>Our Packages</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <div className="card-header">
                <h3>{p.name}</h3>
                <span className="price">${p.price}</span>
            </div>
            <p className="desc">{p.description}</p>
            <ul className="features">
                {p.features && p.features.map((f, index) => <li key={index}>{f}</li>)}
            </ul>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

