import React, { useState, useEffect } from "react";
import { getCommentsByBlogId, getBlogs } from "../../api/blog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toggleLikeBlog, createComment } from "../../api/blog";
import { config } from "../../config";
import "../../styles/BlogList.css";
export default function BlogList() {
  const [activeCommentBlogId, setActiveCommentBlogId] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Hàm lấy avatar hoặc ký tự đầu
  const getUserAvatarOrInitial = (userObj, size = 32) => {
    const avatarUrl = userObj?.author_avatar || userObj?.avatar;
    if (avatarUrl) {
      const src = avatarUrl.startsWith("http")
        ? avatarUrl
        : `${config.SERVER_URL}${avatarUrl}`;
      return (
        <img
          src={src}
          alt="avatar"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-avatar.png";
          }}
        />
      );
    }
    if (userObj && userObj.name && userObj.name.length > 0)
      return userObj.name.charAt(0).toUpperCase();
    if (userObj && userObj.email && userObj.email.length > 0)
      return userObj.email.charAt(0).toUpperCase();
    return "U";
  };

  // Hàm format ngày kiểu Facebook
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay === 0) {
      if (diffHour > 0) return `${diffHour} giờ trước`;
      if (diffMin > 0) return `${diffMin} phút trước`;
      return "Vừa xong";
    }
    if (diffDay === 1) return "Hôm qua";
    if (d.getFullYear() === now.getFullYear()) {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const res = await getBlogs();
        setBlogs(res.blogs || []);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);
  const handleCommentClick = async (blogId) => {
    if (activeCommentBlogId === blogId) {
      setActiveCommentBlogId(null);
      setLoadingComments(true);
      try {
        const res = await getCommentsByBlogId(blogId);
        setComments((prev) => ({ ...prev, [blogId]: res.comments || [] }));
        setActiveCommentBlogId(blogId);
      } catch (err) {
        setComments((prev) => ({ ...prev, [blogId]: [] }));
        setActiveCommentBlogId(blogId);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Thêm renderImages cho BlogList
  const renderImages = (blog) => {
    if (!blog?.images || blog.images.length === 0) return null;
    // Hỗ trợ cả kiểu string và object, fix đường dẫn tuyệt đối
    const images = blog.images.map((image) => {
      let url = "";
      if (typeof image === "string") {
        url = image;
      } else {
        url = image.image_url || image.url || image;
      }
      // Nếu url bắt đầu bằng /uploads hoặc không phải http, nối với SERVER_URL
      if (url && !url.startsWith("http")) {
        url = `${config.SERVER_URL.replace(/\/$/, "")}/${url.replace(
          /^\//,
          ""
        )}`;
      }
      return url;
    });
    if (images.length === 1) {
      return (
        <div className="post-image">
          <img
            src={images[0]}
            alt="Blog image"
            style={{ width: "100%", borderRadius: 8 }}
          />
        </div>
      );
    }
    return (
      <div className="post-images-gallery">
        {images.map((imageUrl, idx) => (
          <div key={idx} className="gallery-image">
            <img
              src={imageUrl}
              alt={`Blog image ${idx + 1}`}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </div>
        ))}
      </div>
    );
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
              <div className="blog-post" key={blog.id}>
                {/* Post Header */}
                <div className="post-header">
                  <div className="author-avatar">
                    {getUserAvatarOrInitial(blog, 36)}
                  </div>
                  <div className="author-info" style={{ marginLeft: 12 }}>
                    <div className="author-name" style={{ fontWeight: 600 }}>
                      {blog.author_name || blog.author_email}
                    </div>
                    <div
                      className="post-meta"
                      style={{ fontSize: 13, color: "#888" }}
                    >
                      <span>{formatDate(blog.created_at)}</span>
                      <span className="privacy-dot" style={{ margin: "0 4px" }}>
                        •
                      </span>
                      <span>{blog.status || "Published"}</span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content">
                  <div className="post-text">
                    <h1>{blog.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </div>
                  {renderImages(blog)}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="post-tags">
                      {blog.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reaction Summary */}
                <div className="reaction-summary">
                  <div className="like-reactions">
                    <span className="reaction-icon">👍</span>
                    <span>{blog.likes_count || 0}</span>
                  </div>
                  <div className="comment-share-count">
                    <span>{blog.comment_count || 0} bình luận</span>
                    <span>0 chia sẻ</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button
                    className={`action-btn ${
                      blog.liked_by_user ? "liked" : ""
                    }`}
                    onClick={async () => {
                      if (!isAuthenticated) {
                        alert("Bạn cần đăng nhập để thích bài viết");
                        return;
                      }
                      try {
                        await toggleLikeBlog(blog.id);
                        const res = await getBlogs();
                        setBlogs(res.blogs || []);
                      } catch {
                        alert("Có lỗi khi thích bài viết");
                      }
                    }}
                  >
                    <i class="fa-solid fa-thumbs-up"></i>
                    Thích
                    <span style={{ marginLeft: 6 }}></span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleCommentClick(blog.id)}
                  >
                    <i class="fa-solid fa-comment"></i>
                    Bình luận
                    <span style={{ marginLeft: 6 }}></span>
                  </button>
                  <button className="action-btn">
                    <i class="fa-solid fa-share"></i>
                    Chia sẻ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
