import React from "react";
import "../layoutcss/_footer.scss";
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>© {new Date().getFullYear()} MMOS - Digital Services Platform</p>
        <p>Chuyên cung cấp VIA, PROXY và Dịch vụ Mạng Xã Hội</p>
      </div>
    </footer>
  );
};

export default Footer;
