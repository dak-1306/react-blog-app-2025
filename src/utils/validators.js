// Validation rules cho form
export const required =
  (message = "Trường này là bắt buộc") =>
  (value) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return message;
    }
    return "";
  };

export const email =
  (message = "Email không hợp lệ") =>
  (value) => {
    if (!value) return "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return "";
  };

export const minLength = (min, message) => (value) => {
  if (!value) return "";

  if (value.length < min) {
    return message || `Tối thiểu ${min} ký tự`;
  }
  return "";
};

export const maxLength = (max, message) => (value) => {
  if (!value) return "";

  if (value.length > max) {
    return message || `Tối đa ${max} ký tự`;
  }
  return "";
};

export const pattern =
  (regex, message = "Định dạng không hợp lệ") =>
  (value) => {
    if (!value) return "";

    if (!regex.test(value)) {
      return message;
    }
    return "";
  };

export const confirmPassword =
  (message = "Mật khẩu xác nhận không khớp") =>
  (value, values) => {
    if (!value) return "";

    if (value !== values.password) {
      return message;
    }
    return "";
  };

export const fileSize = (maxSize, message) => (file) => {
  if (!file) return "";

  if (file.size > maxSize) {
    return (
      message || `Kích thước file tối đa ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }
  return "";
};

export const fileType = (allowedTypes, message) => (file) => {
  if (!file) return "";

  if (!allowedTypes.includes(file.type)) {
    return message || `Chỉ chấp nhận file: ${allowedTypes.join(", ")}`;
  }
  return "";
};

// Combine multiple validators
export const combine =
  (...validators) =>
  (value, values) => {
    for (const validator of validators) {
      const error = validator(value, values);
      if (error) return error;
    }
    return "";
  };
