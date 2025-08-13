import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError?.();
    };
  }, [clearError]);

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

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      // User will be redirected by useEffect when isAuthenticated becomes true
    } catch (err) {
      // Error is handled by AuthContext and will be displayed
      console.error("Login failed:", err);
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
            placeholder="Nhập email của bạn"
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
              placeholder="Nhập mật khẩu"
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

        <Button
          type="submit"
          style={{ width: "100%", marginBottom: "16px" }}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
      <p style={{ textAlign: "center" }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default Login;
