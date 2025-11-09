import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles/global.scss"; // SCSS theme + global style
import Login from "./page/Anonymous/Login";
import Register from "./page/Anonymous/Register";
import Profile from "./page/User/Profile";
import ChangePassword from "./page/User/ChangePassword";
import StudentHome from "./page/User/StudentHome";
import AdminHome from "./page/Admin/AdminHome";
import EventList from "./page/Anonymous/Event";
import AdminRoute from "./routes/adminRouter";
import ProtectedRoute from "./routes/protectRouter";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event" element={<EventList />} />
        {/* Protected Routes */}
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
          path="/admin"
          element={
            <AdminRoute>
              <AdminHome />
            </AdminRoute>
          }
        />
        <Route
          path="/"
          element={(() => {
            const userInfoStr = localStorage.getItem("userInfo");
            if (!userInfoStr) {
              return <Navigate to="/event" />;
            }
            try {
              const userInfo = JSON.parse(userInfoStr);
              if (userInfo?.user?.role === "admin") {
                return <Navigate to="/admin" />;
              } else {
                return <Navigate to="/student" />;
              }
            } catch (e) {
              localStorage.removeItem("userInfo");
              return <Navigate to="/login" />;
            }
          })()}
        />
      </Routes>
    </Router>
  );
}

export default App;
