import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "../Chat/ChatWidget";
import { useEffect, useState } from "react";

const MainLayout = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo"));
      setUserInfo(info);
      setIsAdmin(info?.user?.role === "admin");
    } catch {
      setUserInfo(null);
      setIsAdmin(false);
    }
  }, []);

  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
      {userInfo && <ChatWidget isAdmin={isAdmin} />}
    </>
  );
};

export default MainLayout;
