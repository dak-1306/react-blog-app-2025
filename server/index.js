import express from "express";
import cors from "cors";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { testDatabaseConnection } from "./database.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import auth controller
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  authenticateToken,
  updateProfile,
  uploadAvatar,
  deleteAccount,
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
  uploadImages,
  deleteImage,
  uploadMiddleware,
  avatarUploadMiddleware,
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

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(
    "📋 Headers auth:",
    req.headers.authorization ? "Present" : "Missing"
  );
  if (Object.keys(req.query).length > 0) console.log("📋 Query:", req.query);
  if (Object.keys(req.body || {}).length > 0)
    console.log("📋 Body keys:", Object.keys(req.body));
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.put("/api/auth/profile", authenticateToken, updateProfile);
app.post(
  "/api/auth/upload-avatar",
  authenticateToken,
  avatarUploadMiddleware,
  uploadAvatar
);
app.delete("/api/auth/delete-account", authenticateToken, deleteAccount);

// Blog endpoints (match với src/api/blog.js)
app.get("/api/blogs", getBlogs);
// Test endpoint for debugging
app.get("/api/blogs/test", authenticateToken, (req, res) => {
  console.log("🧪 Test endpoint hit - user:", req.user);
  res.json({ message: "Test endpoint works!", user: req.user });
});
// Specific routes MUST come before parameterized routes
app.get("/api/blogs/my-blogs", authenticateToken, getMyBlogs);
app.get("/api/blogs/:id", getBlogById);
app.post("/api/blogs", authenticateToken, createBlog);
app.put("/api/blogs/:id", authenticateToken, updateBlog);
app.delete("/api/blogs/:id", authenticateToken, deleteBlog);
app.post("/api/blogs/:id/toggle-like", authenticateToken, toggleLikeBlog);

// Category endpoints
app.get("/api/categories", getCategories);

// Upload endpoints
app.post(
  "/api/upload/images",
  authenticateToken,
  uploadMiddleware,
  uploadImages
);
app.delete("/api/upload/image/:filename", authenticateToken, deleteImage);

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
      console.log("   PUT  /api/auth/profile         - Cập nhật profile");
      console.log("   POST /api/auth/upload-avatar   - Upload avatar");
      console.log("   DELETE /api/auth/delete-account - Xóa tài khoản");

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
      console.log("   POST /api/upload/images        - Upload nhiều hình ảnh");
      console.log("   DELETE /api/upload/image/:filename - Xóa hình ảnh");
      console.log("   GET  /uploads/*                - Serve static files");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
