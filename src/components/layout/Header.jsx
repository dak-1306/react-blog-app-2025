import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <h1>Blog App 2025</h1>
        </Link>

        <nav className="header__nav">
          <Link to="/" className="header__nav-link">
            Trang chủ
          </Link>
          <Link to="/blogs" className="header__nav-link">
            Blog
          </Link>
          {user && (
            <Link to="/blogs/create" className="header__nav-link">
              Viết bài
            </Link>
          )}
        </nav>

        <div className="header__actions">
          {user ? (
            <div className="header__user">
              <Link to="/profile" className="header__user-name">
                Xin chào, {user.name}
              </Link>
              <Button variant="outline" size="small" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="header__auth">
              <Link to="/login">
                <Button variant="outline" size="small">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="small">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
