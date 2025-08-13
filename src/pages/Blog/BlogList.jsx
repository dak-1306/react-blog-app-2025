import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getBlogs, deleteBlog } from "../../api/blog";
import { config } from "../../config";
import "../../styles/BlogList.css";

export default function BlogList() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await deleteBlog(blogId);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      alert("Xóa bài viết thất bại!");
    }
    setOpenMenuId(null);
  };
  // Fetch blogs từ API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBlogs();
        const blogsData = response?.blogs || [];
        setBlogs(blogsData);
      } catch (err) {
        console.error("❌ Error fetching blogs:", err);
        setError(err.message || "Không thể tải danh sách blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleViewDetail = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hôm qua";
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const isValidImageUrl = (imageUrl) => {
    if (!imageUrl) return false;

    // Nếu là server URL (bắt đầu bằng /uploads/), luôn hợp lệ
    if (imageUrl.startsWith("/uploads/")) {
      return true;
    }

    // Nếu là HTTP/HTTPS URL, luôn hợp lệ
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return true;
    }

    // Nếu là base64, kiểm tra độ dài (backward compatibility)
    if (imageUrl.startsWith("data:image/")) {
      // Chỉ cho phép base64 nhỏ hơn 10KB (khoảng 13,000 ký tự)
      if (imageUrl.length > 13000) {
        console.warn(
          "Image base64 too long, skipping render. Length:",
          imageUrl.length
        );
        return false;
      }
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="blog-list-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách blog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list-error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="blog-list-page">
      <div className="blog-feed">
        <div className="feed-header">
          <h2>Danh sách Blog</h2>
          {isAuthenticated && (
            <button
              className="create-post-btn"
              onClick={() => navigate("/blogs/create")}
            >
              <i className="fas fa-plus"></i>
              Tạo bài viết mới
            </button>
          )}
        </div>

        <div className="posts-container">
          {blogs.length === 0 ? (
            <div className="no-blogs">
              <p>
                Chưa có blog nào.{" "}
                {isAuthenticated
                  ? "Hãy tạo blog đầu tiên!"
                  : "Đăng nhập để tạo blog!"}
              </p>
              {isAuthenticated ? (
                <button
                  className="create-first-blog-btn"
                  onClick={() => navigate("/blogs/create")}
                >
                  Tạo blog đầu tiên
                </button>
              ) : (
                <button
                  className="create-first-blog-btn"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập ngay
                </button>
              )}
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="post-card">
                {/* Post Header */}
                <div className="post-header">
                  <div className="author-avatar">
                    <img
                      src={
                        blog.author_avatar
                          ? blog.author_avatar.startsWith("http")
                            ? blog.author_avatar
                            : `${config.SERVER_URL}${blog.author_avatar}`
                          : "./default-avatar.png"
                      }
                      alt={blog.author_name || "avatar"}
                      onError={(e) => {
                        e.target.src = "./default-avatar.png";
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="author-info">
                    <div className="author-name">
                      {blog.author_name || "Unknown"}
                    </div>
                    <div className="post-meta">
                      <span className="post-time">
                        {formatDate(blog.created_at)}
                      </span>
                      <span className="privacy-dot">•</span>
                      <span className="status">{blog.status}</span>
                    </div>
                  </div>
                  <div
                    className="more-btn-wrapper"
                    style={{ position: "relative" }}
                  >
                    <button
                      className="more-btn"
                      onClick={() =>
                        setOpenMenuId(openMenuId === blog.id ? null : blog.id)
                      }
                    >
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                    {openMenuId === blog.id && (
                      <div
                        className="more-menu"
                        style={{
                          position: "absolute",
                          top: 36,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                          zIndex: 10,
                          minWidth: 120,
                        }}
                      >
                        {user && blog.author_id === user.id ? (
                          <>
                            <button
                              className="menu-item"
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/blogs/${blog.id}/edit`);
                              }}
                              style={{
                                width: "100%",
                                padding: 8,
                                border: "none",
                                background: "none",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <i className="fas fa-edit"></i> Chỉnh sửa
                            </button>
                            <button
                              className="menu-item"
                              onClick={() => handleDeleteBlog(blog.id)}
                              style={{
                                width: "100%",
                                padding: 8,
                                border: "none",
                                background: "none",
                                textAlign: "left",
                                color: "red",
                                cursor: "pointer",
                              }}
                            >
                              <i className="fas fa-trash"></i> Xóa
                            </button>
                          </>
                        ) : (
                          <div style={{ padding: 8, color: "#888" }}>
                            Không có thao tác
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content">
                  <h3 className="post-title">{blog.title}</h3>

                  {blog.excerpt && (
                    <div className="post-text">
                      <p>{blog.excerpt}</p>
                    </div>
                  )}

                  {blog.featured_image &&
                  isValidImageUrl(blog.featured_image) ? (
                    <div className="post-image">
                      <img
                        src={
                          blog.featured_image.startsWith("http")
                            ? blog.featured_image
                            : `${config.SERVER_URL}${blog.featured_image}`
                        }
                        alt={blog.title}
                        onClick={() => handleViewDetail(blog.id)}
                        style={{ cursor: "pointer" }}
                        onError={(e) => {
                          console.log("Image load error for blog:", blog.id);
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : blog.featured_image ? (
                    <div className="post-image-placeholder">
                      <div className="placeholder-content">
                        <i className="fas fa-image"></i>
                        <p>Ảnh chất lượng cao</p>
                        <small>Click xem chi tiết để xem ảnh đầy đủ</small>
                        <button
                          className="view-image-btn"
                          onClick={() => handleViewDetail(blog.id)}
                        >
                          <i className="fas fa-eye"></i> Xem ảnh
                        </button>
                        f
                      </div>
                    </div>
                  ) : null}

                  {/* Tags */}
                  {blog.category_name && (
                    <div className="post-tags">
                      <span className="tag">{blog.category_name}</span>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleViewDetail(blog.id)}
                  >
                    <i className="fas fa-eye"></i>
                    Xem chi tiết
                  </button>

                  <div className="post-stats">
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
