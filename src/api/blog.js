import axiosInstance from "./axiosInstance";

// API lấy danh sách blog với phân trang và tìm kiếm
export const getBlogs = async (params = {}) => {
  const { page = 1, limit = 10, search = "", category = "" } = params;
  const response = await axiosInstance.get("/blogs", {
    params: { page, limit, search, category },
  });
  return response;
};

// API lấy chi tiết blog
export const getBlogById = async (id) => {
  const response = await axiosInstance.get(`/blogs/${id}`);
  return response;
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

// API upload hình ảnh
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axiosInstance.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};

// API lấy blog của user hiện tại
export const getMyBlogs = async (params = {}) => {
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
