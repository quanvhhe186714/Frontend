import React, { useEffect, useState } from "react";
import "./admin.scss";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminUserList from "./AdminUserList";
import AdminCoupons from "./AdminCoupons";
import AdminTransactions from "./AdminTransactions";
import AdminCustomQR from "./AdminCustomQR";
import AdminBankQR from "./AdminBankQR";
import AdminFakeMessages from "./AdminFakeMessages";
import AdminFakeReviews from "./AdminFakeReviews";
import orderService from "../../services/order";

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await orderService.getDashboardStats();
        setStats(s);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="admin-page container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card"><span>Revenue</span><strong>${stats.totalRevenue?.toFixed?.(2) || 0}</strong></div>
          <div className="stat-card"><span>Orders</span><strong>{stats.totalOrders}</strong></div>
          <div className="stat-card"><span>Products</span><strong>{stats.totalProducts}</strong></div>
          <div className="stat-card"><span>Users</span><strong>{stats.totalUsers}</strong></div>
        </div>
      )}
      
      <div className="admin-tabs">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>Products</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Orders</button>
        <button className={activeTab === "transactions" ? "active" : ""} onClick={() => setActiveTab("transactions")}>Transactions</button>
        <button className={activeTab === "coupons" ? "active" : ""} onClick={() => setActiveTab("coupons")}>Coupons</button>
        <button className={activeTab === "custom-qr" ? "active" : ""} onClick={() => setActiveTab("custom-qr")}>Custom QR</button>
        <button className={activeTab === "bank-qr" ? "active" : ""} onClick={() => setActiveTab("bank-qr")}>Bank QR</button>
        <button className={activeTab === "fake-messages" ? "active" : ""} onClick={() => setActiveTab("fake-messages")}>Fake Messages</button>
        <button className={activeTab === "fake-reviews" ? "active" : ""} onClick={() => setActiveTab("fake-reviews")}>Fake Reviews</button>
      </div>

      <div className="tab-content">
        {activeTab === "users" && <AdminUserList />} 
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "transactions" && <AdminTransactions />}
        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "custom-qr" && <AdminCustomQR />}
        {activeTab === "bank-qr" && <AdminBankQR />}
        {activeTab === "fake-messages" && <AdminFakeMessages />}
        {activeTab === "fake-reviews" && <AdminFakeReviews />}
      </div>
    </div>
  );
};

export default AdminHome;
