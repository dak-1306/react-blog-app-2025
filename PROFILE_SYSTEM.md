# Profile System Documentation

## Tổng quan

Hệ thống Profile hoàn chỉnh với các tính năng:

- ✅ Quản lý thông tin cá nhân
- ✅ Upload và thay đổi avatar
- ✅ Đổi mật khẩu an toàn
- ✅ Quản lý bài viết của user
- ✅ Xóa tài khoản

## Tính năng chính

### 1. Profile Management

- **Thông tin cá nhân:** Tên, email, phone, địa chỉ, website, bio
- **Avatar upload:** Hỗ trợ ảnh 2MB, auto resize
- **Real-time validation:** Form validation với error/success messages

### 2. Security Features

- **Change Password:** Verification mật khẩu cũ trước khi đổi
- **Account Deletion:** Xác nhận mật khẩu trước khi xóa tài khoản
- **JWT Protection:** Tất cả endpoints được bảo vệ bởi authentication

### 3. User Content Management

- **My Blogs:** Hiển thị tất cả bài viết của user
- **Blog Status:** Published, Draft, Private với color coding
- **Quick Actions:** View, Edit buttons cho mỗi bài viết

## API Endpoints

### Profile APIs

```
PUT  /api/auth/profile         - Cập nhật thông tin profile
POST /api/auth/upload-avatar   - Upload avatar (multipart/form-data)
DELETE /api/auth/delete-account - Xóa tài khoản (cần password)
```

### Database Schema

```sql
ALTER TABLE users ADD (
  phone VARCHAR(20),
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  avatar VARCHAR(255)
);
```

## Frontend Components

### Profile Tabs

1. **Thông tin cá nhân** - Edit profile form
2. **Đổi mật khẩu** - Secure password change
3. **Bài viết của tôi** - User's blog management
4. **Cài đặt** - Account settings & danger zone

### UI Features

- **Responsive Design:** Mobile-first approach với breakpoints
- **Loading States:** Spinners cho tất cả async operations
- **Error Handling:** User-friendly error messages
- **Success Feedback:** Confirmation messages với auto-hide

## File Structure

```
src/
├── pages/
│   └── Profile.jsx           # Main profile component
├── api/
│   └── profile.js           # Profile API functions
└── styles/
    └── Profile.css          # Complete profile styling

server/
├── authController.js        # Profile endpoints
├── uploads/
│   └── avatars/            # Avatar storage
└── profile_migration.sql   # Database updates
```

## Usage

### 1. Navigation

- Truy cập `/profile` khi đã login
- Auto redirect về `/login` nếu chưa authenticate

### 2. Profile Update

```javascript
// Update profile info
const profileData = {
  name: "New Name",
  phone: "0123456789",
  bio: "About me...",
  location: "Ho Chi Minh City",
  website: "https://example.com",
};
await updateUserProfile(profileData);
```

### 3. Avatar Upload

```javascript
// Upload avatar file
const file = event.target.files[0];
await uploadAvatar(file);
```

### 4. Password Change

```javascript
// Change password
const passwordData = {
  currentPassword: "old_password",
  newPassword: "new_password",
};
await changePassword(passwordData);
```

## Security Considerations

### Backend Validation

- ✅ File type validation (images only)
- ✅ File size limits (2MB for avatars)
- ✅ Password strength requirements
- ✅ SQL injection protection với prepared statements

### Frontend Security

- ✅ Input sanitization
- ✅ Password confirmation matching
- ✅ File validation before upload
- ✅ Secure deletion confirmation

## Styling Features

### Modern UI/UX

- **Gradient Headers:** Beautiful profile header với gradient background
- **Tab Navigation:** Smooth tab switching với active states
- **Card Design:** Clean white cards với subtle shadows
- **Button States:** Hover effects và loading states

### Responsive Design

- **Mobile-first:** Optimized cho mobile devices
- **Breakpoints:** 768px và 480px breakpoints
- **Flexible Layout:** Grid và flexbox layout
- **Touch-friendly:** Larger touch targets cho mobile

## Testing

### Manual Testing Checklist

- [ ] Profile info update
- [ ] Avatar upload/change
- [ ] Password change with validation
- [ ] Blog list display
- [ ] Account deletion flow
- [ ] Responsive behavior
- [ ] Error handling
- [ ] Success messages

### Error Scenarios

- [ ] Invalid file types
- [ ] File size exceeded
- [ ] Wrong current password
- [ ] Network errors
- [ ] Server errors

## Performance Optimizations

### Frontend

- ✅ Lazy loading cho user blogs
- ✅ Debounced input validation
- ✅ Optimized re-renders với proper state management
- ✅ Image optimization với error fallbacks

### Backend

- ✅ Efficient database queries
- ✅ File upload validation
- ✅ Proper error handling
- ✅ Memory management cho file uploads

## Future Enhancements

### Planned Features

- [ ] Social media links
- [ ] Profile privacy settings
- [ ] Two-factor authentication
- [ ] Profile activity timeline
- [ ] Bulk blog operations

### UX Improvements

- [ ] Profile completeness indicator
- [ ] Auto-save drafts
- [ ] Drag & drop avatar upload
- [ ] Profile preview mode
- [ ] Advanced blog filtering

## Notes

- Avatar files lưu trong `server/uploads/avatars/`
- Default avatar fallback khi user chưa upload
- Database migration cần chạy để add profile fields
- Profile hoàn toàn responsive và accessible
- All endpoints require authentication token
