import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${
        loading ? "btn--loading" : ""
      } ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className="btn__spinner"></span>}
      <span className={`btn__content ${loading ? "btn__content--hidden" : ""}`}>
        {children}
      </span>
    </button>
  );
};

export default Button;
