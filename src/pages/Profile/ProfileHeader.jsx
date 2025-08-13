import React, { useRef, useState } from "react";
import { config } from "../../config";

export default function ProfileHeader({ userInfo, onAvatarUpload, loading }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      setPreview(null);
      return;
    }
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File ảnh không được vượt quá 2MB");
      setPreview(null);
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    onAvatarUpload(file);
  };

  // Reset preview when userInfo.avatar changes (upload thành công)
  React.useEffect(() => {
    setPreview(null);
  }, [userInfo.avatar]);

  // Early return if userInfo is not available
  if (!userInfo) {
    return (
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <img src="/default-avatar.png" alt="Loading..." />
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
                preview
                  ? preview
                  : userInfo.avatar
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
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
            >
              <i
                className={loading ? "fas fa-spinner fa-spin" : "fas fa-camera"}
              ></i>
            </label>
            <input
              id="avatar-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              disabled={loading}
            />
            {error && <div className="avatar-error">{error}</div>}
            {preview && !loading && (
              <button
                className="avatar-cancel-btn"
                type="button"
                onClick={() => {
                  setPreview(null);
                  setError("");
                  fileInputRef.current.value = "";
                }}
              >
                Hủy chọn
              </button>
            )}
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
