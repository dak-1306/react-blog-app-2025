import axios from "axios";

// Tạo instance axios với cấu hình base
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds) for multiple image uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔗 Axios request to:", config.url);
    console.log("🎫 Token in localStorage:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
    } else {
      console.log("❌ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    console.error("🔴 Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và error
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response received for:", response.config.url);
    console.log("📊 Response status:", response.status);
    // Trả về data trực tiếp thay vì response object
    return response.data;
  },
  (error) => {
    console.error("🔴 Response error for:", error.config?.url);
    console.error("🔴 Error details:", error.response?.data || error.message);

    // Xử lý lỗi HTTP
    if (error.response) {
      // Server trả về response với status code lỗi
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        "Có lỗi xảy ra";

      console.error("🔴 Server error message:", errorMessage);

      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log("🔒 Unauthorized - clearing token and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Request được gửi nhưng không có response
      return Promise.reject(new Error("Không thể kết nối đến server"));
    } else {
      // Lỗi khác
      return Promise.reject(new Error(error.message));
    }
  }
);

export default axiosInstance;
