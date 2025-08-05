import axiosInstance from "./axiosInstance";

// API đăng nhập
export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", credentials);
  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

// API đăng ký
export const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  if (response.token) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

// API đăng xuất
export const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    // Vẫn xóa token local dù API lỗi
    console.warn("Logout API failed, but clearing local storage:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return true;
};

// API lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response;
};

// API đổi mật khẩu
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/auth/change-password",
    passwordData
  );
  return response;
};
