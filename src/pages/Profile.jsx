import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyBlogs } from "../api/blog";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
} from "../api/profile";
import { config } from "../config";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // User's blogs state
  const [userBlogs, setUserBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        const userData = response.user || response;
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          location: userData.location || "",
          website: userData.website || "",
          avatar: userData.avatar || "",
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Không thể tải thông tin profile");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Load user's blogs when blogs tab is active
  useEffect(() => {
    const loadUserBlogs = async () => {
      if (activeTab === "blogs" && isAuthenticated) {
        try {
          setBlogsLoading(true);
          console.log("🔍 Loading user blogs...");
          const response = await getMyBlogs();
          console.log("📊 API Response:", response);

          // Handle different response formats
          const blogsData = response.blogs || response.data?.blogs || [];
          console.log("📝 Blogs data:", blogsData);

          setUserBlogs(blogsData);
        } catch (err) {
          console.error("❌ Error loading user blogs:", err);
          setError("Không thể tải danh sách bài viết");
        } finally {
          setBlogsLoading(false);
        }
      }
    };

    loadUserBlogs();
  }, [activeTab, isAuthenticated]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await updateUserProfile(profile);
      setSuccess("Cập nhật profile thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật profile thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Đổi mật khẩu thành công!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File ảnh không được vượt quá 2MB");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await uploadAvatar(file);
      setProfile((prev) => ({
        ...prev,
        avatar: response.avatarUrl || response.avatar,
      }));

      setSuccess("Cập nhật avatar thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Upload avatar thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Vui lòng nhập mật khẩu để xác nhận");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await deleteAccount(deletePassword);

      setSuccess("Tài khoản đã được xóa thành công");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Xóa tài khoản thất bại");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletePassword("");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading && !profile.name) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img
                src={
                  profile.avatar
                    ? profile.avatar.startsWith("http")
                      ? profile.avatar
                      : `${config.SERVER_URL}${profile.avatar}`
                    : "/default-avatar.png"
                }
                alt={profile.name}
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                <i className="fas fa-camera"></i>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="profile-info">
              <h1>{profile.name || "Người dùng"}</h1>
              <p className="profile-email">{profile.email}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <i className="fas fa-user"></i>
          Thông tin cá nhân
        </button>
        <button
          className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          <i className="fas fa-lock"></i>
          Đổi mật khẩu
        </button>
        <button
          className={`tab-btn ${activeTab === "blogs" ? "active" : ""}`}
          onClick={() => setActiveTab("blogs")}
        >
          <i className="fas fa-edit"></i>
          Bài viết của tôi
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <i className="fas fa-cog"></i>
          Cài đặt
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Info Tab */}
        {activeTab === "info" && (
          <div className="tab-content">
            <h2>Thông tin cá nhân</h2>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên hiển thị *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Giới thiệu bản thân</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Viết vài dòng về bản thân..."
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Password Change Tab */}
        {activeTab === "password" && (
          <div className="tab-content">
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  minLength="6"
                />
                <small>Mật khẩu phải có ít nhất 6 ký tự</small>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang đổi mật khẩu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key"></i>
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* User Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="tab-content">
            <div className="blogs-header">
              <h2>Bài viết của tôi</h2>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/blogs/create")}
              >
                <i className="fas fa-plus"></i>
                Viết bài mới
              </button>
            </div>

            {blogsLoading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Đang tải bài viết...</p>
              </div>
            ) : userBlogs.length > 0 ? (
              <div className="user-blogs-list">
                {userBlogs.map((blog) => (
                  <div key={blog.id} className="blog-item">
                    <div className="blog-info">
                      <h3
                        onClick={() => navigate(`/blogs/${blog.id}`)}
                        className="blog-title"
                      >
                        {blog.title}
                      </h3>
                      <p className="blog-excerpt">{blog.excerpt}</p>
                      <div className="blog-meta">
                        <span className="blog-date">
                          <i className="fas fa-calendar"></i>
                          {formatDate(blog.created_at)}
                        </span>
                        <span className={`blog-status status-${blog.status}`}>
                          {blog.status === "published" && "Đã xuất bản"}
                          {blog.status === "draft" && "Bản nháp"}
                          {blog.status === "private" && "Riêng tư"}
                        </span>
                      </div>
                    </div>
                    <div className="blog-actions">
                      <button
                        onClick={() => navigate(`/blogs/${blog.id}`)}
                        className="btn btn-sm btn-outline"
                      >
                        <i className="fas fa-eye"></i>
                        Xem
                      </button>
                      <button
                        onClick={() => navigate(`/blogs/${blog.id}/edit`)}
                        className="btn btn-sm btn-outline"
                      >
                        <i className="fas fa-edit"></i>
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-blogs">
                <i className="fas fa-edit"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy viết bài đầu tiên của bạn!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/blogs/create")}
                >
                  <i className="fas fa-plus"></i>
                  Viết bài mới
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="tab-content">
            <h2>Cài đặt tài khoản</h2>

            <div className="settings-section">
              <div className="danger-zone">
                <h3>Vùng nguy hiểm</h3>
                <p>
                  Các hành động này không thể hoàn tác. Hãy cân nhắc kỹ trước
                  khi thực hiện.
                </p>

                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fas fa-trash"></i>
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Xác nhận xóa tài khoản</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Cảnh báo:</strong> Hành động này sẽ xóa vĩnh viễn tài
                khoản của bạn và tất cả dữ liệu liên quan. Điều này không thể
                hoàn tác.
              </p>
              <div className="form-group">
                <label>Nhập mật khẩu để xác nhận:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Mật khẩu của bạn"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loading || !deletePassword}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Xóa tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
