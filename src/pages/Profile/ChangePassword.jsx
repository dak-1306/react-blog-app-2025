import React, { useState } from "react";

export default function ChangePassword({
  onPasswordChange,
  loading,
}) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPasswordChange(passwordData);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;
    let text = "";

    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength <= 2) {
      text = "Yếu";
    } else if (strength <= 4) {
      text = "Trung bình";
    } else {
      text = "Mạnh";
    }

    return { strength, text };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className="tab-content">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label>
            <i className="fas fa-lock"></i>
            Mật khẩu hiện tại *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) =>
                handleInputChange("currentPassword", e.target.value)
              }
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("current")}
            >
              <i
                className={`fas ${
                  showPasswords.current ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>
            <i className="fas fa-key"></i>
            Mật khẩu mới *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              required
              minLength="6"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("new")}
            >
              <i
                className={`fas ${
                  showPasswords.new ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <div
              className={`password-strength strength-${passwordStrength.text.toLowerCase()}`}
            >
              <div className="password-strength-bar">
                <div className="password-strength-fill"></div>
              </div>
              <div className="password-strength-text">
                Độ mạnh: {passwordStrength.text}
              </div>
            </div>
          )}

          {/* Password Requirements */}
          <div className="password-requirements">
            <h4>Yêu cầu mật khẩu:</h4>
            <ul>
              <li
                className={
                  passwordData.newPassword.length >= 6 ? "valid" : "invalid"
                }
              >
                Ít nhất 6 ký tự
              </li>
              <li
                className={
                  /[A-Z]/.test(passwordData.newPassword) ? "valid" : "invalid"
                }
              >
                Có ít nhất 1 chữ hoa
              </li>
              <li
                className={
                  /[a-z]/.test(passwordData.newPassword) ? "valid" : "invalid"
                }
              >
                Có ít nhất 1 chữ thường
              </li>
              <li
                className={
                  /[0-9]/.test(passwordData.newPassword) ? "valid" : "invalid"
                }
              >
                Có ít nhất 1 số
              </li>
              <li
                className={
                  /[^A-Za-z0-9]/.test(passwordData.newPassword)
                    ? "valid"
                    : "invalid"
                }
              >
                Có ít nhất 1 ký tự đặc biệt
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label>
            <i className="fas fa-shield-alt"></i>
            Xác nhận mật khẩu mới *
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              <i
                className={`fas ${
                  showPasswords.confirm ? "fa-eye-slash" : "fa-eye"
                }`}
              ></i>
            </button>
          </div>
          {passwordData.confirmPassword &&
            passwordData.newPassword !== passwordData.confirmPassword && (
              <small style={{ color: "#dc3545" }}>
                Mật khẩu xác nhận không khớp
              </small>
            )}
        </div>

        <button
          type="submit"
          className="btn btn-primary change-password-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Đang đổi mật khẩu...
            </>
          ) : (
            <>
              <i className="fas fa-key"></i>
              Đổi mật khẩu
            </>
          )}
        </button>

        {/* Security Tips */}
        <div className="security-tips">
          <h4>
            <i className="fas fa-shield-alt"></i>
            Mẹo bảo mật
          </h4>
          <ul>
            <li>Sử dụng mật khẩu dài và phức tạp</li>
            <li>Không sử dụng thông tin cá nhân trong mật khẩu</li>
            <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
            <li>Thay đổi mật khẩu định kỳ</li>
            <li>Sử dụng trình quản lý mật khẩu</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
