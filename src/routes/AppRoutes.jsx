import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../page/Anonymous/Login";
import Register from "../page/Anonymous/Register";
import Profile from "../page/User/Profile";
import ChangePassword from "../page/User/ChangePassword";
import AdminHome from "../page/Admin/AdminHome";

import Home from "../page/Shop/Home";
import ProductList from "../page/Shop/ProductList";
import Cart from "../page/Shop/Cart";
import ProductDetail from "../page/Shop/ProductDetail";
import Checkout from "../page/Shop/Checkout";
import Payment from "../page/Shop/Payment";
import PublicQRDisplay from "../page/Shop/PublicQRDisplay";
import TransactionHistory from "../page/Shop/TransactionHistory";
import PaymentHistory from "../page/Shop/PaymentHistory";

// Portal pages (market-like)
import SanPham from "../page/Portal/SanPham";
import DichVu from "../page/Portal/DichVu";
import FacebookServiceDetail from "../page/Portal/FacebookServiceDetail";
import HoTro from "../page/Portal/HoTro";
import ChiaSe from "../page/Portal/ChiaSe";
import Faqs from "../page/Portal/Faqs";
import TaiKhoanMang from "../page/Portal/TaiKhoanMang";
import AiTools from "../page/Portal/AiTools";
import VpnVps from "../page/Portal/VpnVps";
import QRPayment from "../page/Portal/QRPayment";

import AdminRoute from "./adminRouter";
import ProtectedRoute from "./protectRouter";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public Shop Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        }
      />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment-qr" element={<PublicQRDisplay />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment-history" element={<PaymentHistory />} />

      {/* Portal style pages */}
      <Route path="/san-pham" element={<SanPham />} />
      <Route path="/dich-vu" element={<DichVu />} />
      <Route
        path="/dich-vu/facebook/:id"
        element={
          <ProtectedRoute>
            <FacebookServiceDetail />
          </ProtectedRoute>
        }
      />
      <Route path="/ho-tro" element={<HoTro />} />
      <Route path="/tai-khoan-mang" element={<TaiKhoanMang />} />
      <Route path="/ai-tools" element={<AiTools />} />
      <Route path="/vpn-vps" element={<VpnVps />} />
      <Route path="/chia-se" element={<ChiaSe />} />
      <Route path="/faqs" element={<Faqs />} />

      {/* 👤 Protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaction-history"
        element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-payment"
        element={
          <ProtectedRoute>
            <QRPayment />
          </ProtectedRoute>
        }
      />

      {/* 👑 Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
