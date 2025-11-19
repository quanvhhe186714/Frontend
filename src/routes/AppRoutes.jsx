import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../page/Anonymous/Login";
import Register from "../page/Anonymous/Register";
import Profile from "../page/User/Profile";
import ChangePassword from "../page/User/ChangePassword";
import AdminHome from "../page/Admin/AdminHome";

import Home from "../page/Shop/Home";
import ProductList from "../page/Shop/ProductList";
import Cart from "../page/Shop/Cart";

import AdminRoute from "./adminRouter";
import ProtectedRoute from "./protectRouter";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public Shop Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
