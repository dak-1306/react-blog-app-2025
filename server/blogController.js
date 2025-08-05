import { executeQuery } from "./database.js";

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
             (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as likes_count,
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

    // Increment view count
    await executeQuery("UPDATE blogs SET views = views + 1 WHERE id = ?", [id]);

    res.json(blogs[0]);
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

    const result = await executeQuery(
      `
      INSERT INTO blogs (title, slug, content, excerpt, author_id, category_id, featured_image, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        title,
        slug,
        content,
        excerpt,
        author_id,
        category_id,
        featured_image,
        status,
      ]
    );

    res.status(201).json({
      message: "Tạo blog thành công",
      blog: {
        id: result.insertId,
        title,
        slug,
        content,
        excerpt,
        author_id,
        category_id,
        featured_image,
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
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const author_id = req.user.id;

    const blogs = await executeQuery(
      `
      SELECT b.*, c.name as category_name,
             (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comments_count
      FROM blogs b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.author_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [author_id, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await executeQuery(
      "SELECT COUNT(*) as total FROM blogs WHERE author_id = ?",
      [author_id]
    );
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
    console.error("Get my blogs error:", error);
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
      "SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?",
      [id, user_id]
    );

    if (existingLike.length > 0) {
      // Unlike
      await executeQuery(
        "DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?",
        [id, user_id]
      );
      res.json({ message: "Đã bỏ thích", liked: false });
    } else {
      // Like
      await executeQuery(
        "INSERT INTO blog_likes (blog_id, user_id, created_at) VALUES (?, ?, NOW())",
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

// POST /api/upload/image - Upload image (placeholder)
export const uploadImage = async (req, res) => {
  try {
    // This is a placeholder - you'll need to implement actual file upload
    // using multer or similar library for handling multipart/form-data

    res.status(501).json({
      error:
        "Upload image chưa được implement. Vui lòng sử dụng URL trực tiếp.",
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({
      error: "Upload hình ảnh thất bại",
    });
  }
};
