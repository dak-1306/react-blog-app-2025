import React, { useState } from "react";

export default function Settings({ onShowDeleteModal, onExportData }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
  };

  return (
    <div className="tab-content">
      <h2>Cài đặt tài khoản</h2>

      <div className="settings-section">
        {/* Account Settings */}
        <div className="account-settings">
          <h3>Cài đặt tài khoản</h3>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-title">Hiển thị email công khai</div>
              <div className="setting-description">
                Cho phép người khác xem địa chỉ email của bạn
              </div>
            </div>
            <div className="setting-control">
              <div
                className={`toggle-switch ${
                  settings.showEmail ? "active" : ""
                }`}
                onClick={() =>
                  handleSettingChange("showEmail", !settings.showEmail)
                }
              ></div>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-title">Hiển thị số điện thoại</div>
              <div className="setting-description">
                Cho phép người khác xem số điện thoại của bạn
              </div>
            </div>
            <div className="setting-control">
              <div
                className={`toggle-switch ${
                  settings.showPhone ? "active" : ""
                }`}
                onClick={() =>
                  handleSettingChange("showPhone", !settings.showPhone)
                }
              ></div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="privacy-settings">
          <h3>Quyền riêng tư</h3>

          <div className="privacy-option">
            <label>
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={settings.profileVisibility === "public"}
                onChange={(e) =>
                  handleSettingChange("profileVisibility", e.target.value)
                }
              />
              <div className="privacy-option-content">
                <div className="privacy-option-title">Công khai</div>
                <div className="privacy-option-desc">
                  Mọi người có thể xem profile và bài viết của bạn
                </div>
              </div>
            </label>
          </div>

          <div className="privacy-option">
            <label>
              <input
                type="radio"
                name="profileVisibility"
                value="friends"
                checked={settings.profileVisibility === "friends"}
                onChange={(e) =>
                  handleSettingChange("profileVisibility", e.target.value)
                }
              />
              <div className="privacy-option-content">
                <div className="privacy-option-title">Bạn bè</div>
                <div className="privacy-option-desc">
                  Chỉ bạn bè mới có thể xem profile của bạn
                </div>
              </div>
            </label>
          </div>

          <div className="privacy-option">
            <label>
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={settings.profileVisibility === "private"}
                onChange={(e) =>
                  handleSettingChange("profileVisibility", e.target.value)
                }
              />
              <div className="privacy-option-content">
                <div className="privacy-option-title">Riêng tư</div>
                <div className="privacy-option-desc">
                  Chỉ bạn mới có thể xem profile của mình
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="notification-settings">
          <h3>Thông báo</h3>

          <div className="notification-category">
            <h4>
              <i className="fas fa-envelope"></i>
              Email
            </h4>

            <div className="notification-option">
              <span className="notification-label">Thông báo bài viết mới</span>
              <div
                className={`toggle-switch ${
                  settings.emailNotifications ? "active" : ""
                }`}
                onClick={() =>
                  handleSettingChange(
                    "emailNotifications",
                    !settings.emailNotifications
                  )
                }
              ></div>
            </div>

            <div className="notification-option">
              <span className="notification-label">Email marketing</span>
              <div
                className={`toggle-switch ${
                  settings.marketingEmails ? "active" : ""
                }`}
                onClick={() =>
                  handleSettingChange(
                    "marketingEmails",
                    !settings.marketingEmails
                  )
                }
              ></div>
            </div>
          </div>

          <div className="notification-category">
            <h4>
              <i className="fas fa-mobile-alt"></i>
              Push Notifications
            </h4>

            <div className="notification-option">
              <span className="notification-label">
                Thông báo trên thiết bị
              </span>
              <div
                className={`toggle-switch ${
                  settings.pushNotifications ? "active" : ""
                }`}
                onClick={() =>
                  handleSettingChange(
                    "pushNotifications",
                    !settings.pushNotifications
                  )
                }
              ></div>
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="export-section">
          <h3>Xuất dữ liệu</h3>

          <div className="export-info">
            <h4>Tải xuống dữ liệu của bạn</h4>
            <p>
              Bạn có thể tải xuống tất cả dữ liệu tài khoản của mình, bao gồm:
            </p>
            <ul>
              <li>Thông tin profile</li>
              <li>Tất cả bài viết đã viết</li>
              <li>Bình luận và tương tác</li>
              <li>Lịch sử hoạt động</li>
            </ul>
          </div>

          <button className="export-btn" onClick={onExportData}>
            <i className="fas fa-download"></i>
            Tải xuống dữ liệu
          </button>
        </div>

        {/* Settings Actions */}
        <div className="settings-actions">
          <button
            className="btn btn-outline"
            onClick={() => {
              // Reset to default settings
              setSettings({
                emailNotifications: true,
                pushNotifications: false,
                marketingEmails: false,
                profileVisibility: "public",
                showEmail: false,
                showPhone: false,
              });
            }}
          >
            Đặt lại mặc định
          </button>

          <button className="btn btn-primary" onClick={handleSaveSettings}>
            <i className="fas fa-save"></i>
            Lưu cài đặt
          </button>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <h3>
            <i className="fas fa-exclamation-triangle"></i>
            Vùng nguy hiểm
          </h3>
          <p>
            Các hành động này không thể hoàn tác. Hãy cân nhắc kỹ trước khi thực
            hiện.
          </p>

          <div className="danger-actions">
            <button
              className="danger-btn danger-btn-warning"
              onClick={() => {
                if (
                  window.confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản?")
                ) {
                  console.log("Deactivate account");
                }
              }}
            >
              <i className="fas fa-user-slash"></i>
              Vô hiệu hóa tài khoản
            </button>

            <button
              className="danger-btn danger-btn-delete"
              onClick={onShowDeleteModal}
            >
              <i className="fas fa-trash"></i>
              Xóa tài khoản vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
