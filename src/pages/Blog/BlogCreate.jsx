import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as blogAPI from "../../api/blog";
import "../../styles/BlogCreate.css";

function CreateBlogPost() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("1"); // Default category
  const [privacy, setPrivacy] = useState("published");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [error, setError] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".privacy-section")) {
        setShowPrivacyDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra có ít nhất nội dung hoặc ảnh
    if (!content.trim() && !imagePreview) {
      setError("Vui lòng nhập nội dung hoặc chọn ảnh để đăng bài!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blogData = {
        title: title.trim() || "Bài viết không tiêu đề",
        content: content.trim(),
        category_id: parseInt(category),
        status: privacy,
        excerpt: content.trim().substring(0, 150) + "...",
        featured_image: imagePreview || null,
      };

      const response = await blogAPI.createBlog(blogData);
      console.log("Blog created successfully:", response);

      // Thông báo thành công và chuyển hướng
      alert("Đăng bài thành công!");
      navigate("/blogs");
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng bài!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="blog-create-container">
      <div className="blog-create-header">
        <h1>Tạo bài viết mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="blog-form">
        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "#e53e3e",
              backgroundColor: "#fee",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #fca5a5",
            }}
          >
            {error}
          </div>
        )}

        <div className="form-layout">
          <div className="form-left-column">
            <div className="image-upload-section">
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <div className="image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Chọn ảnh để tải lên</p>
                  </div>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="image-input"
              />
            </div>

            {imagePreview && (
              <div className="image-actions">
                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                >
                  <i className="fas fa-sync-alt"></i>
                  Đổi ảnh
                </button>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Xóa ảnh
                </button>
              </div>
            )}
          </div>

          <div className="form-right-column">
            <div className="title-section" style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết (tùy chọn)"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              />
            </div>

            <div className="content-section">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="main-content-textarea"
              />
              <div className="char-counter">{content.length}/2000</div>
            </div>

            <div className="category-section" style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Danh mục:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="1">Công nghệ</option>
                <option value="2">Du lịch</option>
                <option value="3">Ẩm thực</option>
                <option value="4">Thể thao</option>
                <option value="5">Giải trí</option>
              </select>
            </div>

            <div className="privacy-section">
              <label className="privacy-label">Quyền riêng tư:</label>
              <div className="custom-select">
                <div
                  className="privacy-toggle"
                  onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                >
                  <span className="privacy-icon">
                    {privacy === "published" && (
                      <i className="fas fa-globe"></i>
                    )}
                    {privacy === "draft" && <i className="fas fa-edit"></i>}
                    {privacy === "private" && <i className="fas fa-lock"></i>}
                  </span>
                  <span className="privacy-text">
                    {privacy === "published" && "Công khai"}
                    {privacy === "draft" && "Bản nháp"}
                    {privacy === "private" && "Riêng tư"}
                  </span>
                  <span className="dropdown-arrow">
                    <i className="fas fa-chevron-down"></i>
                  </span>
                </div>

                {showPrivacyDropdown && (
                  <div className="privacy-options">
                    <div
                      className={`privacy-option ${
                        privacy === "published" ? "active" : ""
                      }`}
                      onClick={() => {
                        setPrivacy("published");
                        setShowPrivacyDropdown(false);
                      }}
                    >
                      <span className="option-icon">
                        <i className="fas fa-globe"></i>
                      </span>
                      <div className="option-content">
                        <span className="option-title">Công khai</span>
                        <span className="option-desc">
                          Bất kỳ ai cũng có thể xem
                        </span>
                      </div>
                    </div>

                    <div
                      className={`privacy-option ${
                        privacy === "draft" ? "active" : ""
                      }`}
                      onClick={() => {
                        setPrivacy("draft");
                        setShowPrivacyDropdown(false);
                      }}
                    >
                      <span className="option-icon">
                        <i className="fas fa-edit"></i>
                      </span>
                      <div className="option-content">
                        <span className="option-title">Bản nháp</span>
                        <span className="option-desc">
                          Lưu để chỉnh sửa sau
                        </span>
                      </div>
                    </div>

                    <div
                      className={`privacy-option ${
                        privacy === "private" ? "active" : ""
                      }`}
                      onClick={() => {
                        setPrivacy("private");
                        setShowPrivacyDropdown(false);
                      }}
                    >
                      <span className="option-icon">
                        <i className="fas fa-lock"></i>
                      </span>
                      <div className="option-content">
                        <span className="option-title">Riêng tư</span>
                        <span className="option-desc">Chỉ bạn có thể xem</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="post-button"
                disabled={loading || (!content.trim() && !imagePreview)}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    loading || (!content.trim() && !imagePreview)
                      ? "#9ca3af"
                      : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  width: "100%",
                  cursor:
                    loading || (!content.trim() && !imagePreview)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateBlogPost;
