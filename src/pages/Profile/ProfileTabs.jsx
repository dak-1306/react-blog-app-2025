import React from "react";

const tabsConfig = [
  {
    id: "info",
    label: "Thông tin cá nhân",
    icon: "fas fa-user",
  },
  {
    id: "password",
    label: "Đổi mật khẩu",
    icon: "fas fa-lock",
  },
  {
    id: "blogs",
    label: "Bài viết của tôi",
    icon: "fas fa-edit",
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: "fas fa-cog",
  },
];

export default function ProfileTabs({ activeTab, onTabChange }) {
  return (
    <div className="profile-tabs">
      {tabsConfig.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={tab.icon}></i>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
