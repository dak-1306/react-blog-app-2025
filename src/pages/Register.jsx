import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("isAuthenticated changed:", isAuthenticated);
    if (isAuthenticated) {
      console.log("Redirecting to home...");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError?.();
    };
  }, [clearError]); // Now clearError is memoized with useCallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear global error
    if (error) {
      clearError?.();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Registration successful
      console.log("Registration successful:", response);

      // User will be redirected by useEffect when isAuthenticated becomes true
    } catch (err) {
      // Error is handled by AuthContext and will be displayed
      console.error("Registration failed:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Global Error */}
        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "16px",
              padding: "8px",
              backgroundColor: "#fee",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        {/* Name Field */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Họ và tên *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${errors.name ? "#e53e3e" : "#d1d5db"}`,
              borderRadius: "4px",
              fontSize: "16px",
            }}
            placeholder="Nhập họ và tên của bạn"
            disabled={loading}
          />
          {errors.name && (
            <span
              style={{
                color: "#e53e3e",
                fontSize: "14px",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.name}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${errors.email ? "#e53e3e" : "#d1d5db"}`,
              borderRadius: "4px",
              fontSize: "16px",
            }}
            placeholder="Nhập địa chỉ email"
            disabled={loading}
          />
          {errors.email && (
            <span
              style={{
                color: "#e53e3e",
                fontSize: "14px",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.email}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Mật khẩu *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                paddingRight: "40px",
                border: `1px solid ${errors.password ? "#e53e3e" : "#d1d5db"}`,
                borderRadius: "4px",
                fontSize: "16px",
              }}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {errors.password && (
            <span
              style={{
                color: "#e53e3e",
                fontSize: "14px",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Xác nhận mật khẩu *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                paddingRight: "40px",
                border: `1px solid ${
                  errors.confirmPassword ? "#e53e3e" : "#d1d5db"
                }`,
                borderRadius: "4px",
                fontSize: "16px",
              }}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span
              style={{
                color: "#e53e3e",
                fontSize: "14px",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <Button
          type="submit"
          style={{ width: "100%", marginBottom: "16px" }}
          disabled={loading}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <p style={{ textAlign: "center" }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </p>
    </div>
  );
}
