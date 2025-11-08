import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Login from "./components/Anonymous/Login";
import Register from "./components/Anonymous/Register";
import Profile from "./components/User/Profile";
import ChangePassword from "./components/User/ChangePassword";
import StudentHome from "./components/User/StudentHome";
import AdminHome from "./components/Admin/AdminHome";
import AdminRoute from "./routes/adminRouter";
import ProtectedRoute from "./routes/protectRouter";
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentHome />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
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
                return <Navigate to="/login" />;
              }
              try {
                const userInfo = JSON.parse(userInfoStr);
                if (userInfo?.user?.role === "admin") {
                  return <Navigate to="/admin" />;
                } else {
                  return <Navigate to="/student" />;
                }
              } catch (e) {
                localStorage.removeItem("userInfo"); // Clear invalid data
                return <Navigate to="/login" />;
              }
            })()}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
