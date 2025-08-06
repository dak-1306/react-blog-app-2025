import axiosInstance from "./axiosInstance";

// API lấy thông tin profile user
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// API cập nhật thông tin profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put("/auth/profile", profileData);
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
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
    console.error("Error changing password:", error);
    throw error;
  }
};

// API upload avatar
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post("/auth/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

// API xóa tài khoản
export const deleteAccount = async (password) => {
  try {
    const response = await axiosInstance.delete("/auth/delete-account", {
      data: { password },
    });
    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
