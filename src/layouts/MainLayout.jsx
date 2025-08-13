import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-layout__content">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
