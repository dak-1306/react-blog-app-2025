// Cấu hình ứng dụng
export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  // Pagination
  POSTS_PER_PAGE: 12,
  COMMENTS_PER_PAGE: 10,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],

  // App Info
  APP_NAME: "Blog App 2025",
  APP_VERSION: "1.0.0",

  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "user",
    THEME: "theme",
  },

  // Routes
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    BLOGS: "/blogs",
    BLOG_CREATE: "/blogs/create",
    BLOG_EDIT: "/blogs/edit",
    BLOG_DETAIL: "/blogs/:id",
  },

  // Validation
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    TITLE_MAX_LENGTH: 200,
    EXCERPT_MAX_LENGTH: 300,
  },
};
