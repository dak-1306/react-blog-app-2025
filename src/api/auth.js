import axiosInstance from "./axiosInstance";

// API đăng nhập
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

// API đăng ký
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// API đăng xuất
export const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return true;
  } catch (error) {
    // Vẫn xóa token local dù API lỗi
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw error;
  }
};

// API lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response;
  } catch (error) {
    throw error;
  }
};

// API đổi mật khẩu
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put(
      "/auth/change-password",
      passwordData
    );
    return response;
  } catch (error) {
    throw error;
  }
};
