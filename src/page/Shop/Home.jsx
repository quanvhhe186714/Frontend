import React from "react";
import { useNavigate } from "react-router-dom";
import "./shop.scss";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="shop-home">
      <section className="hero">
        <div className="hero-content">
          <h1>Telegram Premium</h1>
          <p>Unlock the full potential of Telegram with exclusive features.</p>
          <button className="cta-btn" onClick={() => navigate('/products')}>View Packages</button>
        </div>
      </section>
      
      <section className="features">
        <h2>Premium Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🚀 Double Limits</h3>
            <p>Up to 1000 channels, 20 folders, 10 pins, 20 public links, and more.</p>
          </div>
          <div className="feature-card">
            <h3>📂 4 GB Uploads</h3>
            <p>Upload media and files up to 4 GB each.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Faster Downloads</h3>
            <p>Download media and documents at maximum speed.</p>
          </div>
          <div className="feature-card">
            <h3>💬 Voice-to-Text</h3>
            <p>Read the transcript of any voice message.</p>
          </div>
          <div className="feature-card">
            <h3>🚫 No Ads</h3>
            <p>No more sponsored messages in public channels.</p>
          </div>
           <div className="feature-card">
            <h3>✨ Unique Reactions</h3>
            <p>React with more emojis including animated ones.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
