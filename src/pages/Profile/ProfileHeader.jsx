import React from "react";
import { config } from "../../config";

export default function ProfileHeader({ userInfo, onAvatarUpload, loading }) {
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAvatarUpload(file);
    }
  };

  // Early return if userInfo is not available
  if (!userInfo) {
    return (
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img
                src="/default-avatar.png"
                alt="Loading..."
              />
            </div>
            <div className="profile-info">
              <h1>Đang tải...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-header">
      <div className="profile-cover">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img
              src={
                userInfo.avatar
                  ? userInfo.avatar.startsWith("http")
                    ? userInfo.avatar
                    : `${config.SERVER_URL}${userInfo.avatar}`
                  : "/default-avatar.png"
              }
              alt={userInfo.name}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <label
              htmlFor="avatar-upload"
              className={`avatar-upload-btn ${loading ? "disabled" : ""}`}
            >
              <i
                className={loading ? "fas fa-spinner fa-spin" : "fas fa-camera"}
              ></i>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              disabled={loading}
            />
          </div>
          <div className="profile-info">
            <h1>{userInfo.name || "Người dùng"}</h1>
            <p className="profile-email">{userInfo.email}</p>
            {userInfo.bio && <p className="profile-bio">{userInfo.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
