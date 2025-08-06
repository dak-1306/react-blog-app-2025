import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createBlog, getCategories, uploadImages, deleteUploadedImage } from "../../api/blog";
import { config } from "../../config";
import "../../styles/BlogCreate.css";

function CreateBlogPost() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("1"); // Default category
  const [privacy, setPrivacy] = useState("published");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // Changed to array for multiple images
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

    // Validation cơ bản
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết!");
      return;
    }

    if (!content.trim() && images.length === 0) {
      setError("Vui lòng nhập nội dung hoặc chọn ảnh để đăng bài!");
      return;
    }

    // Kiểm tra độ dài tiêu đề
    if (title.trim().length > 200) {
      setError("Tiêu đề không được vượt quá 200 ký tự!");
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
        featured_image: images.length > 0 ? images[0].url : null,
        images: images.map((img, index) => ({
          url: img.url,
          caption: img.caption || "",
          alt: img.alt || title.trim() || "Blog image",
          order: index,
        })),
      };

      const response = await createBlog(blogData);
      console.log("Blog created successfully:", response);

      // Kiểm tra response và thông báo thành công
      if (response) {
        alert("✅ Đăng bài thành công!");
        navigate("/blogs");
      } else {
        throw new Error("Không nhận được phản hồi từ server");
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng bài!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];

    // Validate files first
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} không phải là hình ảnh.`);
        continue;
      }

      // Kiểm tra kích thước file (max 5MB để phù hợp với server)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    // Upload files to server
    try {
      setLoading(true);
      const response = await uploadImages(validFiles);
      
      if (response && response.files) {
        const newImages = response.files.map((fileData, index) => ({
          id: Date.now() + index,
          filename: fileData.filename,
          originalName: fileData.originalName,
          url: fileData.url, // This will be the server URL like /uploads/blogs/filename.jpg
          caption: "",
          alt: fileData.originalName,
          size: fileData.size,
          type: fileData.mimetype,
          isUploaded: true, // Flag to indicate this is uploaded to server
        }));

        setImages((prev) => [...prev, ...newImages]);
        console.log("Images uploaded successfully:", newImages);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Có lỗi xảy ra khi upload hình ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = async (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    
    // If this is an uploaded image, delete it from server
    if (imageToRemove && imageToRemove.isUploaded && imageToRemove.filename) {
      try {
        await deleteUploadedImage(imageToRemove.filename);
        console.log("Image deleted from server:", imageToRemove.filename);
      } catch (error) {
        console.error("Error deleting image from server:", error);
        // Continue with local removal even if server deletion fails
      }
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const updateImageCaption = (imageId, caption) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, caption } : img))
    );
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
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
            <div
              className="image-upload-section"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {images.length === 0 ? (
                <label
                  htmlFor="image-upload"
                  className={`image-upload-label ${
                    dragActive ? "drag-active" : ""
                  }`}
                >
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <p className="upload-hint">Hỗ trợ nhiều ảnh</p>
                  </div>
                </label>
              ) : (
                <div className="images-container">
                  <div className="images-grid">
                    {images.map((image, index) => (
                      <div key={image.id} className="image-item">
                        <div className="image-preview-container">
                          <img
                            src={image.url.startsWith('http') ? image.url : `${config.SERVER_URL}${image.url}`}
                            alt={image.alt}
                            className="image-preview"
                          />
                          <div className="image-overlay">
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(image.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                            {index === 0 && (
                              <span className="featured-badge">
                                <i className="fas fa-star"></i> Ảnh đại diện
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Mô tả ảnh (tùy chọn)"
                          value={image.caption}
                          onChange={(e) =>
                            updateImageCaption(image.id, e.target.value)
                          }
                          className="image-caption-input"
                        />
                      </div>
                    ))}
                  </div>

                  <label htmlFor="image-upload" className="add-more-images-btn">
                    <i className="fas fa-plus"></i>
                    Thêm ảnh
                  </label>
                </div>
              )}

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="image-input"
              />
            </div>
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
                disabled={loading || (!content.trim() && images.length === 0)}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    loading || (!content.trim() && images.length === 0)
                      ? "#9ca3af"
                      : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  width: "100%",
                  cursor:
                    loading || (!content.trim() && images.length === 0)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span style={{ marginLeft: "8px" }}>Đang đăng...</span>
                  </>
                ) : (
                  "Đăng bài"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateBlogPost;
