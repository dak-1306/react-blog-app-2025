// GET /api/blogs/:id/comments - Lấy danh sách comment cho blog
export const getCommentsByBlogId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[getCommentsByBlogId] id:", id);
    const comments = await executeQuery(
      `SELECT c.id, c.content, c.created_at, u.name as author_name, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.blog_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );
    console.log("[getCommentsByBlogId] comments:", comments);
    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res
      .status(500)
      .json({
        error: "Lấy danh sách bình luận thất bại",
        message: error.message,
      });
  }
};

// POST /api/blogs/:id/comments - Tạo comment mới cho blog
export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ error: "Nội dung bình luận không được để trống" });
    }
    const result = await executeQuery(
      `INSERT INTO comments (blog_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())`,
      [id, user_id, content.trim()]
    );
    // Lấy thông tin comment vừa tạo
    const [comment] = await executeQuery(
      `SELECT c.id, c.content, c.created_at, u.name as author_name, u.avatar as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Tạo bình luận thất bại" });
  }
};
import { executeQuery } from "./database.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { validateImageFile, cleanupUnusedImages } from "./imageUtils.js";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { toSafeFilename } from "./toSafeFilename.js"; // Import toSafeFilename for ES module

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "blogs");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize original filename
    const safeOriginal = toSafeFilename(file.originalname);
    // Generate unique filename: uuid + sanitized extension
    const uniqueName = `${uuidv4()}${path.extname(safeOriginal)}`;
    cb(null, uniqueName);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Export multer middleware for use in routes
export const uploadMiddleware = upload.array("images", 10); // Allow up to 10 images

// Avatar upload middleware
const avatarStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads", "avatars");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
  fileFilter: fileFilter,
});

export const avatarUploadMiddleware = avatarUpload.single("avatar");

// GET /api/blogs - Lấy danh sách blog với phân trang và tìm kiếm
export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.name as author_name, u.avatar as author_avatar,
             c.name as category_name,
             0 as likes_count,
             0 as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'published'
    `;

    const params = [];

    if (search) {
      query += ` AND (b.title LIKE ? OR b.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const blogs = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM blogs b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'published'
    `;
    const countParams = [];

    if (search) {
      countQuery += ` AND (b.title LIKE ? OR b.content LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      countQuery += ` AND c.slug = ?`;
      countParams.push(category);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      blogs,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({
      error: "Lấy danh sách blog thất bại",
    });
  }
};

// GET /api/blogs/:id - Lấy chi tiết blog
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blogs = await executeQuery(
      `
      SELECT b.*, u.name as author_name, u.avatar as author_avatar,
             c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.status = 'published'
    `,
      [id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({
        error: "Blog không tồn tại",
      });
    }

    // Get blog images
    const blogImages = await executeQuery(
      `SELECT id, image_url, image_order, caption, alt_text, is_featured 
       FROM blog_images 
       WHERE blog_id = ? 
       ORDER BY image_order ASC`,
      [id]
    );

    // Increment view count
    await executeQuery(
      "UPDATE blogs SET view_count = view_count + 1 WHERE id = ?",
      [id]
    );

    const blog = blogs[0];
    blog.images = blogImages;

    res.json(blog);
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({
      error: "Lấy thông tin blog thất bại",
    });
  }
};

// POST /api/blogs - Tạo blog mới
export const createBlog = async (req, res) => {
  console.log("🚀 CREATE BLOG ENDPOINT HIT!!! 🚀");
  console.log("Request body:", req.body);
  console.log("Request user:", req.user);

  try {
    const {
      title,
      content,
      excerpt = null,
      category_id = 1,
      featured_image = null,
      images = [], // Array of images
      status = "draft",
    } = req.body;
    const author_id = req.user.id;

    // Debug logging
    console.log("🔍 Blog creation parameters:", {
      title,
      content: content ? content.substring(0, 50) + "..." : content,
      excerpt,
      category_id,
      featured_image,
      images: images.length,
      status,
      author_id,
    });

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        error: "Tiêu đề và nội dung là bắt buộc",
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // Insert blog
    const result = await executeQuery(
      `
      INSERT INTO blogs (title, slug, content, excerpt, author_id, category_id, featured_image, images_count, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        title,
        slug,
        content,
        excerpt,
        author_id,
        category_id,
        featured_image,
        images.length,
        status,
      ]
    );

    const blogId = result.insertId;

    // Insert multiple images if provided
    if (images && images.length > 0) {
      const imageInsertPromises = images.map((image, index) => {
        return executeQuery(
          `INSERT INTO blog_images (blog_id, image_url, image_order, caption, alt_text, is_featured, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            blogId,
            image.url,
            index,
            image.caption || null,
            image.alt || title,
            index === 0 ? 1 : 0, // First image is featured
          ]
        );
      });

      await Promise.all(imageInsertPromises);
    }

    res.status(201).json({
      message: "Tạo blog thành công",
      blog: {
        id: blogId,
        title,
        slug,
        content,
        excerpt,
        author_id,
        category_id,
        featured_image,
        images_count: images.length,
        status,
      },
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({
      error: "Tạo blog thất bại",
    });
  }
};

// PUT /api/blogs/:id - Cập nhật blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, category_id, featured_image, status } =
      req.body;
    const author_id = req.user.id;

    // Check if blog exists and belongs to user
    const blogs = await executeQuery(
      "SELECT * FROM blogs WHERE id = ? AND author_id = ?",
      [id, author_id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({
        error: "Blog không tồn tại hoặc bạn không có quyền chỉnh sửa",
      });
    }

    await executeQuery(
      `
      UPDATE blogs 
      SET title = ?, content = ?, excerpt = ?, category_id = ?, featured_image = ?, status = ?, updated_at = NOW()
      WHERE id = ? AND author_id = ?
    `,
      [
        title,
        content,
        excerpt,
        category_id,
        featured_image,
        status,
        id,
        author_id,
      ]
    );

    res.json({
      message: "Cập nhật blog thành công",
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({
      error: "Cập nhật blog thất bại",
    });
  }
};

// DELETE /api/blogs/:id - Xóa blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const author_id = req.user.id;

    // Check if blog exists and belongs to user
    const blogs = await executeQuery(
      "SELECT * FROM blogs WHERE id = ? AND author_id = ?",
      [id, author_id]
    );

    if (blogs.length === 0) {
      return res.status(404).json({
        error: "Blog không tồn tại hoặc bạn không có quyền xóa",
      });
    }

    await executeQuery("DELETE FROM blogs WHERE id = ? AND author_id = ?", [
      id,
      author_id,
    ]);

    res.json({
      message: "Xóa blog thành công",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({
      error: "Xóa blog thất bại",
    });
  }
};

// GET /api/blogs/my-blogs - Lấy blog của user hiện tại
export const getMyBlogs = async (req, res) => {
  try {
    console.log("🚀 getMyBlogs endpoint hit!");
    console.log("📋 Query params:", req.query);
    console.log("👤 User from request:", req.user);

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const author_id = req.user.id;

    console.log("🔍 getMyBlogs called for user ID:", author_id);
    console.log("📊 Pagination:", { page, limit, offset });

    console.log("🔍 Executing blogs query...");
    const blogs = await executeQuery(
      `
      SELECT b.*, c.name as category_name,
             (SELECT COUNT(*) FROM likes WHERE blog_id = b.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.author_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [author_id, parseInt(limit), parseInt(offset)]
    );

    console.log("📝 Found blogs:", blogs.length);
    console.log("📄 Blogs data:", blogs);

    // Get total count
    console.log("🔢 Executing count query...");
    const countResult = await executeQuery(
      "SELECT COUNT(*) as total FROM blogs WHERE author_id = ?",
      [author_id]
    );
    const total = countResult[0].total;

    console.log("📊 Total blogs for user:", total);

    const responseData = {
      blogs,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };

    console.log("✅ Sending response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("❌ Get my blogs error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      error: "Lấy danh sách blog của bạn thất bại",
    });
  }
};

// POST /api/blogs/:id/toggle-like - Like/Unlike blog
export const toggleLikeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if already liked
    const existingLike = await executeQuery(
      "SELECT id FROM likes WHERE blog_id = ? AND user_id = ?",
      [id, user_id]
    );

    if (existingLike.length > 0) {
      // Unlike
      await executeQuery(
        "DELETE FROM likes WHERE blog_id = ? AND user_id = ?",
        [id, user_id]
      );
      res.json({ message: "Đã bỏ thích", liked: false });
    } else {
      // Like
      await executeQuery(
        "INSERT INTO likes (blog_id, user_id, created_at) VALUES (?, ?, NOW())",
        [id, user_id]
      );
      res.json({ message: "Đã thích", liked: true });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      error: "Thao tác thích/bỏ thích thất bại",
    });
  }
};

// GET /api/categories - Lấy danh sách category
export const getCategories = async (req, res) => {
  try {
    const categories = await executeQuery(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM blogs WHERE category_id = c.id AND status = 'published') as blog_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.name ASC
    `);

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      error: "Lấy danh sách danh mục thất bại",
    });
  }
};

// POST /api/upload/images - Upload multiple images
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "Không có file nào được upload",
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/blogs/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({
      message: "Upload thành công",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload images error:", error);
    res.status(500).json({
      error: "Upload hình ảnh thất bại",
      message: error.message,
    });
  }
};

// DELETE /api/upload/image/:filename - Delete uploaded image
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "uploads", "blogs", filename);

    try {
      await fs.unlink(filePath);
      res.json({
        message: "Xóa file thành công",
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          error: "File không tồn tại",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      error: "Xóa hình ảnh thất bại",
      message: error.message,
    });
  }
};
