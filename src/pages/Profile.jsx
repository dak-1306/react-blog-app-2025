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
import "../styles/Profile.css";

// Import Profile components
import ProfileHeader from "./Profile/ProfileHeader";
import ProfileTabs from "./Profile/ProfileTabs";
import ProfileInfo from "./Profile/ProfileInfo";
import ChangePassword from "./Profile/ChangePassword";
import MyBlogs from "./Profile/MyBlogs";
import Settings from "./Profile/Settings";
import DeleteModal from "./Profile/DeleteModal";

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
    avatar: "./Blog/default-avatar.png", // mặc định là avatar default
  });

  // User's blogs state
  const [userBlogs, setUserBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

          avatar:
            userData.avatar && userData.avatar.trim() !== ""
              ? userData.avatar
              : "./Blog/default-avatar.png",
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
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      setLoading(true);
      setError(null);

      await updateUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setSuccess("Cập nhật profile thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật profile thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (passwordData) => {
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
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
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
  const handleDeleteAccount = async (deletePassword) => {
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
    }
  };

  // Handle export data
  const handleExportData = () => {
    // Implementation for exporting user data
    console.log("Exporting user data...");
    // This would typically generate a download link for user data
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
      <ProfileHeader
        userInfo={profile}
        onAvatarUpload={handleAvatarUpload}
        loading={loading}
      />

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
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "info" && (
          <ProfileInfo
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            loading={loading}
          />
        )}

        {activeTab === "password" && (
          <ChangePassword
            onPasswordChange={handlePasswordChange}
            loading={loading}
          />
        )}

        {activeTab === "blogs" && (
          <MyBlogs
            blogs={userBlogs}
            loading={blogsLoading}
            onNavigate={navigate}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            onShowDeleteModal={() => setShowDeleteModal(true)}
            onExportData={handleExportData}
          />
        )}
      </div>

      {/* Delete Account Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteAccount={handleDeleteAccount}
        userInfo={profile}
      />
    </div>
  );
}
