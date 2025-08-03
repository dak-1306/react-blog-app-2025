import React from "react";
import "./AuthLayout.css";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__header">
          <h1 className="auth-layout__title">Blog App 2025</h1>
          {title && <h2 className="auth-layout__page-title">{title}</h2>}
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}
        </div>

        <div className="auth-layout__content">{children}</div>

        <div className="auth-layout__footer">
          <p>&copy; 2025 Blog App. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
