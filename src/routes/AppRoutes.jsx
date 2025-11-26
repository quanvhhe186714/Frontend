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

// Portal pages (market-like)
import SanPham from "../page/Portal/SanPham";
import DichVu from "../page/Portal/DichVu";
import FacebookServiceDetail from "../page/Portal/FacebookServiceDetail";
import HoTro from "../page/Portal/HoTro";
import ChiaSe from "../page/Portal/ChiaSe";
import Faqs from "../page/Portal/Faqs";

import AdminRoute from "./adminRouter";
import ProtectedRoute from "./protectRouter";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public Shop Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Portal style pages */}
      <Route path="/san-pham" element={<SanPham />} />
      <Route path="/dich-vu" element={<DichVu />} />
      <Route path="/dich-vu/facebook/:id" element={<FacebookServiceDetail />} />
      <Route path="/ho-tro" element={<HoTro />} />
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
