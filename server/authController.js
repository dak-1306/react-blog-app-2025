import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "./database.js";

const JWT_SECRET = "your-secret-key-change-in-production";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Tên, email và mật khẩu là bắt buộc",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Check if user exists
    const existingUsers = await executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "Email đã được sử dụng",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const result = await executeQuery(
      `INSERT INTO users (name, email, password, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, email, hashedPassword]
    );

    // Generate token for auto login after register
    const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        avatar: null,
        bio: null,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Đăng ký thất bại, vui lòng thử lại",
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email và mật khẩu là bắt buộc",
      });
    }

    // Find user by email
    const users = await executeQuery(
      "SELECT id, name, email, password, avatar, bio, role, is_active FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Đăng nhập thất bại, vui lòng thử lại",
    });
  }
};

// POST /api/auth/logout (frontend chỉ cần xóa token)
export const logout = async (req, res) => {
  res.json({
    message: "Đăng xuất thành công",
  });
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await executeQuery(
      `SELECT id, name, email, avatar, bio, role, created_at,
              (SELECT COUNT(*) FROM blogs WHERE author_id = ? AND status = 'published') as blog_count
       FROM users WHERE id = ?`,
      [userId, userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Người dùng không tồn tại",
      });
    }

    res.json({
      user: users[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Lấy thông tin người dùng thất bại",
    });
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Get current user password
    const users = await executeQuery(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Người dùng không tồn tại",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      users[0].password
    );
    if (!isValidPassword) {
      return res.status(400).json({
        error: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await executeQuery(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedNewPassword, userId]
    );

    res.json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      error: "Đổi mật khẩu thất bại, vui lòng thử lại",
    });
  }
};

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    console.log("🔐 Authentication middleware hit for:", req.method, req.path);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    console.log("🎫 Token present:", !!token);

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        error: "Access token is required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.userId);

    // Get user from database
    const users = await executeQuery(
      "SELECT id, name, email, avatar, bio, role FROM users WHERE id = ? AND is_active = 1",
      [decoded.userId]
    );
    console.log("👤 User found in DB:", users.length > 0);

    if (users.length === 0) {
      console.log("❌ User not found or inactive");
      return res.status(401).json({
        error: "Invalid token - user not found",
      });
    }

    req.user = users[0];
    console.log("🎯 User set in request:", req.user.id, req.user.name);
    next();
  } catch (error) {
    console.error("🔒 Authentication middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    return res.status(500).json({
      error: "Authentication failed",
    });
  }
};

// PUT /api/auth/profile - Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, location, website } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: "Tên không được để trống",
      });
    }

    // Update user profile
    await executeQuery(
      `UPDATE users SET 
       name = ?, 
       phone = ?, 
       bio = ?, 
       location = ?, 
       website = ?, 
       updated_at = NOW() 
       WHERE id = ?`,
      [
        name.trim(),
        phone || null,
        bio || null,
        location || null,
        website || null,
        userId,
      ]
    );

    // Get updated user data
    const users = await executeQuery(
      "SELECT id, name, email, phone, bio, location, website, avatar, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      message: "Cập nhật profile thành công",
      user: users[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      error: "Cập nhật profile thất bại",
    });
  }
};

// POST /api/auth/upload-avatar - Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        error: "Không có file được upload",
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    await executeQuery(
      "UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?",
      [avatarUrl, userId]
    );

    res.json({
      message: "Upload avatar thành công",
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      error: "Upload avatar thất bại",
    });
  }
};

// DELETE /api/auth/delete-account - Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        error: "Mật khẩu là bắt buộc",
      });
    }

    // Get user password
    const users = await executeQuery(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Người dùng không tồn tại",
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, users[0].password);
    if (!validPassword) {
      return res.status(400).json({
        error: "Mật khẩu không chính xác",
      });
    }

    // Delete user data (cascade delete should handle related data)
    await executeQuery("DELETE FROM users WHERE id = ?", [userId]);

    res.json({
      message: "Tài khoản đã được xóa thành công",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      error: "Xóa tài khoản thất bại",
    });
  }
};
