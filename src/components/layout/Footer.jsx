import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h3>Blog App 2025</h3>
            <p>Nền tảng chia sẻ kiến thức và trải nghiệm</p>
          </div>

          <div className="footer__section">
            <h4>Liên kết</h4>
            <ul className="footer__links">
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/blogs">Blog</a>
              </li>
              <li>
                <a href="/about">Về chúng tôi</a>
              </li>
              <li>
                <a href="/contact">Liên hệ</a>
              </li>
            </ul>
          </div>

          <div className="footer__section">
            <h4>Hỗ trợ</h4>
            <ul className="footer__links">
              <li>
                <a href="/help">Trợ giúp</a>
              </li>
              <li>
                <a href="/privacy">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="/terms">Điều khoản sử dụng</a>
              </li>
            </ul>
          </div>

          <div className="footer__section">
            <h4>Kết nối</h4>
            <div className="footer__social">
              <a href="#" className="footer__social-link">
                Facebook
              </a>
              <a href="#" className="footer__social-link">
                Twitter
              </a>
              <a href="#" className="footer__social-link">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} Blog App 2025. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
