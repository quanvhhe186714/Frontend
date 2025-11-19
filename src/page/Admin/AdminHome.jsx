import React, { useState } from "react";
import "./admin.scss";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminUserList from "./AdminUserList";
import AdminCoupons from "./AdminCoupons";

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="admin-page container">
      <h1 className="admin-title">Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>Products</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Orders</button>
        <button className={activeTab === "coupons" ? "active" : ""} onClick={() => setActiveTab("coupons")}>Coupons</button>
      </div>

      <div className="tab-content">
        {activeTab === "users" && <AdminUserList />} 
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "coupons" && <AdminCoupons />}
      </div>
    </div>
  );
};

export default AdminHome;
