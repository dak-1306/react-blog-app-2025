// API lấy danh sách comment cho blog
export const getCommentsByBlogId = async (blogId) => {
  try {
    const response = await axiosInstance.get(`/blogs/${blogId}/comments`);
    return response;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// API tạo comment mới cho blog
export const createComment = async (blogId, commentData) => {
  try {
    const response = await axiosInstance.post(
      `/blogs/${blogId}/comments`,
      commentData
    );
    return response;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
import axiosInstance from "./axiosInstance";

// API lấy danh sách blog với phân trang và tìm kiếm
export const getBlogs = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = params;
    const response = await axiosInstance.get("/blogs", {
      params: { page, limit, search, category },
    });
    // axiosInstance đã return response.data rồi, nên return trực tiếp
    return response;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

// API lấy chi tiết blog
export const getBlogById = async (id) => {
  try {
    const response = await axiosInstance.get(`/blogs/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    throw error;
  }
};

// API tạo blog mới
export const createBlog = async (blogData) => {
  const response = await axiosInstance.post("/blogs", blogData);
  return response;
};

// API cập nhật blog
export const updateBlog = async (id, blogData) => {
  const response = await axiosInstance.put(`/blogs/${id}`, blogData);
  return response;
};

// API xóa blog
export const deleteBlog = async (id) => {
  const response = await axiosInstance.delete(`/blogs/${id}`);
  return response;
};
// API upload nhiều hình ảnh
export const uploadImages = async (files) => {
  try {
    const formData = new FormData();

    // Add multiple files to FormData
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    const response = await axiosInstance.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

// API xóa hình ảnh đã upload
export const deleteUploadedImage = async (filename) => {
  try {
    const response = await axiosInstance.delete(`/upload/image/${filename}`);
    return response;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// API lấy blog của user hiện tại
export const getMyBlogs = async (params = {}) => {
  console.log("🔍 getMyBlogs called with params:", params);

  // Check if token exists
  const token = localStorage.getItem("token");
  console.log("🎫 Token exists:", !!token);
  if (token) {
    console.log("🎫 Token preview:", token.substring(0, 20) + "...");
  }

  const { page = 1, limit = 10 } = params;
  const response = await axiosInstance.get("/blogs/my-blogs", {
    params: { page, limit },
  });
  return response;
};

// API like/unlike blog
export const toggleLikeBlog = async (id) => {
  const response = await axiosInstance.post(`/blogs/${id}/toggle-like`);
  return response;
};

// API lấy danh sách category
export const getCategories = async () => {
  const response = await axiosInstance.get("/categories");
  return response;
};
