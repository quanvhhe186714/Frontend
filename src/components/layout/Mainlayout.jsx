import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "../Chat/ChatWidget";
import SupportNudge from "../SupportNudge/SupportNudge";
import Snowfall from "../Snowfall/Snowfall";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  });

  const isAdmin = userInfo?.user?.role === "admin";
  const shouldShowChat = !!userInfo;

  useEffect(() => {
    try {
      setUserInfo(JSON.parse(localStorage.getItem("userInfo")));
    } catch {
      setUserInfo(null);
    }
  }, [location]);

  return (
    <>
      <Snowfall />
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
      {shouldShowChat && <ChatWidget isAdmin={isAdmin} />}
      <SupportNudge />
    </>
  );
};

export default MainLayout;
