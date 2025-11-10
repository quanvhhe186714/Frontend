// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../page/Anonymous/Login";
import Register from "../page/Anonymous/Register";
import Profile from "../page/User/Profile";
import ChangePassword from "../page/User/ChangePassword";
import StudentHome from "../page/User/StudentHome";
import AdminHome from "../page/Admin/AdminHome";
import EventList from "../page/Anonymous/Event";
import ClubList from "../page/Anonymous/Club";
import ClubDetail from "../page/Anonymous/ClubDetail";
import EventDetail from "../page/Anonymous/EventDetail";

import AdminRoute from "./adminRouter";
import ProtectedRoute from "./protectRouter";
import ManagerRoute from "./managerRouter";
import ManagerRequests from "../page/Manager/ManagerRequests";
import Messages from "../page/User/Messages";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🌐 Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/event" element={<EventList />} />
      <Route path="/club" element={<ClubList />} />
      <Route path="/club/:id" element={<ClubDetail />} />
      <Route path="/club/:id" element={<ClubDetail />} />
      <Route path="/event/:id" element={<EventDetail />} />
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
        path="/student"
        element={
          <ProtectedRoute>
            <StudentHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
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

      {/* 📋 Manager routes */}
      <Route
        path="/manager/requests"
        element={
          <ManagerRoute>
            <ManagerRequests />
          </ManagerRoute>
        }
      />

      {/* 🏠 Default redirect */}
      <Route
        path="/"
        element={(() => {
          const userInfoStr = localStorage.getItem("userInfo");
          if (!userInfoStr) return <Navigate to="/event" />;
          try {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo?.user?.role === "admin") {
              return <Navigate to="/admin" />;
            } else if (userInfo?.user?.role === "manager") {
              return <Navigate to="/manager/requests" />;
            } else {
              return <Navigate to="/student" />;
            }
          } catch {
            localStorage.removeItem("userInfo");
            return <Navigate to="/login" />;
          }
        })()}
      />
    </Routes>
  );
};

export default AppRoutes;
