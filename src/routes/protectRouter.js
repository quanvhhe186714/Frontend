import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  try {
    const userInfoStr = localStorage.getItem("userInfo");
    if (!userInfoStr) {
      return <Navigate to="/login" state={{ from }} replace />;
    }
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo?.token) {
      localStorage.removeItem("userInfo");
      return <Navigate to="/login" state={{ from }} replace />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem("userInfo");
    return <Navigate to="/login" state={{ from }} replace />;
  }
};

export default ProtectedRoute;
