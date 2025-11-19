// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./styles/global.scss";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/layout/Mainlayout";

function App() {
  return (
    <Router>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </Router>
  );
}

export default App;
