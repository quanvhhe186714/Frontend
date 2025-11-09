import React from "react";
import "../layoutcss/_footer.scss";
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>© {new Date().getFullYear()} FPT Club Management System</p>
        <p>Developed by SDN302 Group 302</p>
      </div>
    </footer>
  );
};

export default Footer;
