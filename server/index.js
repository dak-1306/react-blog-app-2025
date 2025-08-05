import express from "express";
import cors from "cors";
import process from "process";
import { testDatabaseConnection } from "./database.js";

// Import auth controller
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  authenticateToken,
} from "./authController.js";

// Import blog controller
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleLikeBlog,
  getCategories,
  uploadImage,
} from "./blogController.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
    ], // Vite dev server
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Blog API Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test database endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    await testDatabaseConnection();
    res.json({
      status: "success",
      message: "Database connection successful",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Authentication endpoints (match với src/api/auth.js)
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", authenticateToken, getCurrentUser);
app.put("/api/auth/change-password", authenticateToken, changePassword);

// Blog endpoints (match với src/api/blog.js)
app.get("/api/blogs", getBlogs);
app.get("/api/blogs/my-blogs", authenticateToken, getMyBlogs);
app.get("/api/blogs/:id", getBlogById);
app.post("/api/blogs", authenticateToken, createBlog);
app.put("/api/blogs/:id", authenticateToken, updateBlog);
app.delete("/api/blogs/:id", authenticateToken, deleteBlog);
app.post("/api/blogs/:id/toggle-like", authenticateToken, toggleLikeBlog);

// Category endpoints
app.get("/api/categories", getCategories);

// Upload endpoints
app.post("/api/upload/image", authenticateToken, uploadImage);

// Error handling middleware
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    await testDatabaseConnection();
    console.log("✅ Database connection successful");

    app.listen(PORT, () => {
      console.log(`\n🚀 Blog API Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
      console.log("\n📡 Authentication Endpoints:");
      console.log("   POST /api/auth/register        - Đăng ký tài khoản");
      console.log("   POST /api/auth/login           - Đăng nhập");
      console.log("   POST /api/auth/logout          - Đăng xuất");
      console.log("   GET  /api/auth/me              - Lấy thông tin user");
      console.log("   PUT  /api/auth/change-password - Đổi mật khẩu");

      console.log("\n📝 Blog Endpoints:");
      console.log("   GET    /api/blogs              - Lấy danh sách blog");
      console.log("   GET    /api/blogs/:id          - Lấy chi tiết blog");
      console.log("   POST   /api/blogs              - Tạo blog mới");
      console.log("   PUT    /api/blogs/:id          - Cập nhật blog");
      console.log("   DELETE /api/blogs/:id          - Xóa blog");
      console.log("   GET    /api/blogs/my-blogs     - Blog của user");
      console.log("   POST   /api/blogs/:id/toggle-like - Like/unlike");

      console.log("\n🗂️  Other Endpoints:");
      console.log("   GET  /api/categories           - Lấy danh sách category");
      console.log("   POST /api/upload/image         - Upload hình ảnh");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
