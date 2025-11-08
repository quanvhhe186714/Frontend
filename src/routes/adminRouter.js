import { BrowserRouter as Router, Navigate } from "react-router-dom";
const AdminRoute = ({ children }) => {
  try {
    const userInfoStr = localStorage.getItem("userInfo");
    if (!userInfoStr) {
      return <Navigate to="/login" />;
    }
    const userInfo = JSON.parse(userInfoStr);
    if (
      !userInfo?.token ||
      !userInfo?.user?.role ||
      userInfo.user.role !== "admin"
    ) {
      return <Navigate to="/student" />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem("userInfo");
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
