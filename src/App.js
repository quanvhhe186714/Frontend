// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./styles/global.scss";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/layout/Mainlayout";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <Router>
      <NotificationProvider>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
      </NotificationProvider>
    </Router>
  );
}

export default App;
