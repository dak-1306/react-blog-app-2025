import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../../api/blog";
import { useAuth } from "../../hooks/useAuth";
import { config } from "../../config";
import "../../styles/BlogDetail.css";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await getBlogById(id);
        setBlog(response.data);
        setLikeCount(response.data.likes || 0);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = () => {
    if (comment.trim() && user) {
      const newComment = {
        id: Date.now(),
        author: user.name || user.email,
        text: comment.trim(),
        time: "Vừa xong",
        avatar:
          user.name?.charAt(0).toUpperCase() ||
          user.email?.charAt(0).toUpperCase(),
      };
      setComments([...comments, newComment]);
      setComment("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleComment();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không rõ thời gian";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      if (diffInDays < 7) return `${diffInDays} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Không rõ thời gian";
    }
  };

  const renderImages = () => {
    if (!blog?.images || blog.images.length === 0) return null;

    // Handle both old format (array of strings) and new format (array of objects)
    const images = blog.images.map((image) => {
      if (typeof image === "string") {
        // Old format: just URL string
        return image.startsWith("http")
          ? image
          : `${config.SERVER_URL}${image}`;
      } else {
        // New format: object with url property
        const url = image.url || image;
        return url.startsWith("http") ? url : `${config.SERVER_URL}${url}`;
      }
    });

    const displayImages = showAllImages ? images : images.slice(0, 4);
    const remainingCount = images.length - 4;

    if (images.length === 1) {
      return (
        <div className="post-image">
          <img src={images[0]} alt="Blog image" />
        </div>
      );
    }

    return (
      <div className="post-images-gallery">
        {displayImages.map((imageUrl, index) => (
          <div key={index} className="gallery-image">
            <img src={imageUrl} alt={`Blog image ${index + 1}`} />
            {!showAllImages && index === 3 && remainingCount > 0 && (
              <div
                className="more-images-overlay"
                onClick={() => setShowAllImages(true)}
              >
                <span>+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
        {showAllImages && images.length > 4 && (
          <button
            className="show-less-btn"
            onClick={() => setShowAllImages(false)}
          >
            <i className="fas fa-chevron-up"></i>
            Ẩn bớt
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-loading">
            <div className="spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-error">
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
            <button className="back-btn" onClick={handleBack}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-error">
            <h3>Không tìm thấy bài viết</h3>
            <p>Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <button className="back-btn" onClick={handleBack}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const authorInitial = blog.author_name
    ? blog.author_name.charAt(0).toUpperCase()
    : blog.author_email?.charAt(0).toUpperCase() || "?";

  const userInitial = user
    ? user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Header */}
        <div className="blog-detail-header">
          <button className="back-button" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2>Bài viết</h2>
          <button className="more-btn">
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>

        {/* Blog Post */}
        <div className="blog-post">
          {/* Post Header */}
          <div className="post-header">
            <div className="author-avatar">{authorInitial}</div>
            <div className="author-info">
              <h3 className="author-name">
                {blog.author_name || blog.author_email}
              </h3>
              <div className="post-meta">
                <span>{formatDate(blog.created_at)}</span>
                <span className="privacy-dot">•</span>
                <i className="fas fa-globe-americas"></i>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="post-content">
            <div className="post-text">
              <h1>{blog.title}</h1>
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Images */}
            {renderImages()}

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
              <span>{likeCount}</span>
            </div>
            <div className="comment-share-count">
              <span>{comments.length} bình luận</span>
              <span>0 chia sẻ</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className={`action-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <i className={`far ${liked ? "fas" : "far"} fa-thumbs-up`}></i>
              Thích
            </button>
            <button className="action-btn">
              <i className="far fa-comment"></i>
              Bình luận
            </button>
            <button className="action-btn">
              <i className="far fa-share"></i>
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          {/* Write Comment */}
          {user && (
            <div className="write-comment">
              <div className="comment-avatar">{userInitial}</div>
              <div className="comment-input-container">
                <textarea
                  className="comment-input"
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                {comment.trim() && (
                  <button className="send-btn" onClick={handleComment}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((commentItem, index) => (
                <div key={commentItem.id || index} className="comment-item">
                  <div className="comment-main">
                    <div className="comment-avatar">
                      {commentItem.avatar ||
                        commentItem.author?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                    <div className="comment-bubble">
                      <div className="comment-header">
                        <span className="comment-author">
                          {commentItem.author}
                        </span>
                      </div>
                      <p className="comment-text">{commentItem.text}</p>
                    </div>
                  </div>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <span className="action-text">Thích</span>
                    </button>
                    <button className="comment-action">
                      <span className="action-text">Phản hồi</span>
                    </button>
                    <span className="comment-time">{commentItem.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
