import { BrowserRouter as Router, Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  try {
    const userInfoStr = localStorage.getItem("userInfo");
    if (!userInfoStr) {
      return <Navigate to="/login" />;
    }
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo?.token) {
      localStorage.removeItem("userInfo");
      return <Navigate to="/login" />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem("userInfo");
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
