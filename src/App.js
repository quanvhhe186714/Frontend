import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';
import StudentHome from './components/StudentHome';
import AdminHome from './components/AdminHome';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5'
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    }
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
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      return <Navigate to="/login" />;
    }
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo?.token) {
      localStorage.removeItem('userInfo');
      return <Navigate to="/login" />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem('userInfo');
    return <Navigate to="/login" />;
  }
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) {
      return <Navigate to="/login" />;
    }
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo?.token || !userInfo?.user?.role || userInfo.user.role !== 'admin') {
      return <Navigate to="/student" />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem('userInfo');
    return <Navigate to="/login" />;
  }
};

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

          {/* Default Route - Redirect based on role */}
          <Route
            path="/"
            element={
              (() => {
                const userInfoStr = localStorage.getItem('userInfo');
                if (!userInfoStr) {
                  return <Navigate to="/login" />;
                }
                try {
                  const userInfo = JSON.parse(userInfoStr);
                  if (userInfo?.user?.role === 'admin') {
                    return <Navigate to="/admin" />;
                  } else {
                    return <Navigate to="/student" />;
                  }
                } catch (e) {
                  localStorage.removeItem('userInfo'); // Clear invalid data
                  return <Navigate to="/login" />;
                }
              })()
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
