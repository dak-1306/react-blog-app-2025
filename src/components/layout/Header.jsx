import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import { config } from "../../config";
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
              <Link to="/profile" className="header__user-avatar" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {(() => {
                  let avatarSrc = "/default-avatar.png";
                  if (user.avatar && typeof user.avatar === "string" && user.avatar.trim() !== "") {
                    if (user.avatar.startsWith("http")) {
                      avatarSrc = user.avatar;
                    } else if (user.avatar.startsWith("/")) {
                      avatarSrc = `${config.SERVER_URL}${user.avatar}`;
                    } else if (user.avatar.startsWith("data:image/")) {
                      avatarSrc = user.avatar;
                    } else if (/^[A-Za-z0-9+/=\s]+$/.test(user.avatar) && user.avatar.length > 100) {
                      // Nếu là chuỗi base64 không có prefix, tự động ghép prefix
                      avatarSrc = `data:image/jpeg;base64,${user.avatar.replace(/\s/g,"")}`;
                    }
                  }
                  if (!avatarSrc || avatarSrc === "") return null;
                  return (
                    <img
                      src={avatarSrc}
                      alt={user.name || "avatar"}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => { e.target.src = "/default-avatar.png"; }}
                    />
                  );
                })()}
                <span style={{ fontWeight: 500 }}>Xin chào, {user.name}</span>
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
