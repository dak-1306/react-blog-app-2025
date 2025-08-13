import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyBlogs({ blogs, loading, onNavigate }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "published":
        return "Đã xuất bản";
      case "draft":
        return "Bản nháp";
      case "archived":
        return "Đã lưu trữ";
      default:
        return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    return `blog-status status-${status}`;
  };

  const handleNavigation = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="blogs-header">
          <h2>Bài viết của tôi</h2>
        </div>
        <div className="blogs-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Đang tải bài viết...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="blogs-header">
        <h2>Bài viết của tôi</h2>
        <div className="blogs-header-actions">
          <button
            className="btn btn-primary create-blog-btn"
            onClick={() => handleNavigation("/blogs/create")}
          >
            <i className="fas fa-plus"></i>
            Viết bài mới
          </button>
        </div>
      </div>

      {/* Blog Filters */}
      <div className="blogs-filters">
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select className="filter-select" defaultValue="all">
            <option value="all">Tất cả</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select className="filter-select" defaultValue="newest">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Theo tiêu đề</option>
            <option value="views">Lượt xem</option>
          </select>
        </div>
      </div>

      {blogs && blogs.length > 0 ? (
        <div className="user-blogs-list">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-item">
              <div className="blog-info">
                <h3
                  onClick={() => handleNavigation(`/blogs/${blog.id}`)}
                  className="blog-title"
                >
                  {blog.title}
                </h3>

                {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}

                <div className="blog-meta">
                  <span className="blog-date">
                    <i className="fas fa-calendar"></i>
                    {formatDate(blog.created_at)}
                  </span>

                  <div className="blog-stats">
                    <span className="blog-stat">
                      <i className="fas fa-eye"></i>
                      {blog.view_count || 0} lượt xem
                    </span>

                    <span className="blog-stat">
                      <i className="fas fa-heart"></i>
                      {blog.likes_count || 0} thích
                    </span>

                    <span className="blog-stat">
                      <i className="fas fa-comment"></i>
                      {blog.comments_count || 0} bình luận
                    </span>
                  </div>

                  <span className={getStatusClass(blog.status)}>
                    {getStatusText(blog.status)}
                  </span>
                </div>

                {blog.category_name && (
                  <div className="blog-category">
                    <i className="fas fa-tag"></i>
                    {blog.category_name}
                  </div>
                )}
              </div>

              <div className="blog-actions">
                <button
                  onClick={() => handleNavigation(`/blogs/${blog.id}`)}
                  className="action-btn action-btn-view"
                  title="Xem bài viết"
                >
                  <i className="fas fa-eye"></i>
                  Xem
                </button>

                <button
                  onClick={() => handleNavigation(`/blogs/${blog.id}/edit`)}
                  className="action-btn action-btn-edit"
                  title="Chỉnh sửa bài viết"
                >
                  <i className="fas fa-edit"></i>
                  Sửa
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")
                    ) {
                      // Handle delete blog logic here
                      console.log("Delete blog:", blog.id);
                    }
                  }}
                  className="action-btn action-btn-delete"
                  title="Xóa bài viết"
                >
                  <i className="fas fa-trash"></i>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-blogs">
          <i className="fas fa-edit"></i>
          <h3>Chưa có bài viết nào</h3>
          <p>
            Hãy viết bài đầu tiên của bạn để chia sẻ những ý tưởng tuyệt vời!
          </p>
          <button
            className="btn btn-primary"
            onClick={() => handleNavigation("/blogs/create")}
          >
            <i className="fas fa-plus"></i>
            Viết bài mới
          </button>
        </div>
      )}

      {/* Pagination would go here if needed */}
      {blogs && blogs.length > 0 && (
        <div className="blog-pagination">
          <span className="pagination-info">
            Hiển thị {blogs.length} bài viết
          </span>
        </div>
      )}
    </div>
  );
}
