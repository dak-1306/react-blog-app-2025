import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBlogById,
  toggleLikeBlog,
  getCommentsByBlogId,
  createComment,
} from "../../api/blog";
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
    const fetchBlogAndComments = async () => {
      try {
        setLoading(true);
        const response = await getBlogById(id);
        setBlog(response);
        setLikeCount(response.likes_count || 0);
        setLiked(!!response.liked_by_user); // đồng bộ trạng thái like
        // Fetch comments from API
        const commentsRes = await getCommentsByBlogId(id);
        setComments(commentsRes || []);
      } catch (error) {
        console.error("Error fetching blog or comments:", error);
        setError(
          "Không thể tải bài viết hoặc bình luận. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchBlogAndComments();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để thích bài viết");
      return;
    }
    try {
      await toggleLikeBlog(id);
      // Sau khi like/unlike, fetch lại blog để đồng bộ likeCount và liked
      const response = await getBlogById(id);
      setLikeCount(response.likes_count || 0);
      setLiked(!!response.liked_by_user);
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Có lỗi xảy ra khi thích bài viết");
    }
  };

  const handleComment = async () => {
    if (comment.trim() && user) {
      try {
        const newComment = await createComment(id, { content: comment.trim() });
        setComments([...comments, newComment]);
        setComment("");
      } catch (error) {
        alert("Không thể gửi bình luận. Vui lòng thử lại.");
      }
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
        const url = image.image_url || image.url || image;
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

  // Hàm tái sử dụng: trả về <img> nếu có avatar, nếu không trả về ký tự đầu tên/email
  const getUserAvatarOrInitial = (userObj, size = 32) => {
    // Ưu tiên author_avatar (dùng cho comment), sau đó đến avatar (user)
    let avatarUrl = userObj?.author_avatar || userObj?.avatar;
    if (!avatarUrl || avatarUrl.trim() === "") {
      avatarUrl = "/default-avatar.png";
    } else if (!avatarUrl.startsWith("http") && !avatarUrl.startsWith("/")) {
      avatarUrl = `${config.SERVER_URL}${avatarUrl}`;
    }
    return (
      <img
        src={avatarUrl}
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
  };

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
            <div className="author-avatar">
              {blog.author_avatar ? (
                <img
                  src={
                    blog.author_avatar.startsWith("http")
                      ? blog.author_avatar
                      : `${config.SERVER_URL}${blog.author_avatar}`
                  }
                  alt={blog.author_name || "avatar"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "./default-avatar.png";
                  }}
                />
              ) : (
                <img
                  src="/default-avatar.png"
                  alt="default avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
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
              <div className="  ">{getUserAvatarOrInitial(user, 32)}</div>
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
                      {getUserAvatarOrInitial(commentItem, 32)}
                    </div>
                    <div className="comment-bubble">
                      <div className="comment-header">
                        <span className="comment-author">
                          {commentItem.author_name || "Ẩn danh"}
                        </span>
                      </div>
                      <p className="comment-text">{commentItem.content}</p>
                    </div>
                  </div>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <span className="action-text">Thích</span>
                    </button>
                    <button className="comment-action">
                      <span className="action-text">Phản hồi</span>
                    </button>
                    <span className="comment-time">
                      {formatDate(commentItem.created_at)}
                    </span>
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
