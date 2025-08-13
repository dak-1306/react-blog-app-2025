# File Upload System Migration

## Tổng quan

Hệ thống đã được chuyển từ lưu trữ base64 trong database sang file upload system để cải thiện hiệu suất và khả năng mở rộng.

## Thay đổi chính

### 1. Backend Changes

#### Server Setup

- ✅ Cài đặt `multer`, `uuid`, `path` dependencies
- ✅ Tạo thư mục `server/uploads/blogs/` để lưu trữ files
- ✅ Cấu hình Express serve static files từ `/uploads/`
- ✅ Cập nhật routes với upload middleware

#### API Endpoints Mới

- `POST /api/upload/images` - Upload nhiều hình ảnh (max 10 files, 5MB each)
- `DELETE /api/upload/image/:filename` - Xóa hình ảnh đã upload
- `GET /uploads/blogs/:filename` - Serve static image files

#### File Validation

- Chỉ chấp nhận: `jpeg`, `jpg`, `png`, `gif`, `webp`
- Kích thước tối đa: 5MB per file
- Tên file được generate bằng UUID để tránh conflict

### 2. Frontend Changes

#### BlogCreate.jsx

- ✅ Import `uploadImages`, `deleteUploadedImage` từ API
- ✅ Cập nhật `handleImageUpload()` để upload files lên server
- ✅ Cập nhật `removeImage()` để xóa files từ server
- ✅ Hiển thị images từ server URLs

#### BlogList.jsx

- ✅ Cập nhật `isValidImageUrl()` để accept server URLs
- ✅ Hiển thị images từ server với fallback cho base64 cũ

#### BlogDetail.jsx

- ✅ Handle cả old format (base64) và new format (server URLs)
- ✅ Tự động convert relative URLs thành absolute URLs

#### API Functions

- ✅ Thêm `uploadImages()` và `deleteUploadedImage()` functions
- ✅ Sử dụng FormData để upload files

### 3. Configuration

- ✅ Thêm `SERVER_URL` config để build absolute URLs
- ✅ Cập nhật `isValidImageUrl()` logic

## Migration Strategy

### Backward Compatibility

- ✅ Hệ thống vẫn support hiển thị base64 images cũ
- ✅ Tự động detect image format (base64 vs server URL)
- ✅ Không cần migrate data ngay lập tức

### File Structure

```
server/
├── uploads/
│   └── blogs/
│       ├── {uuid}.jpg
│       ├── {uuid}.png
│       └── ...
├── imageUtils.js      # Helper functions
└── blogController.js  # Upload logic
```

## Lợi ích

### Performance

- ✅ Giảm size database drastically (không còn base64)
- ✅ Faster page load (serve static files vs base64 parsing)
- ✅ Better caching (browser cache cho static files)

### Scalability

- ✅ Không giới hạn kích thước file (5MB vs 13KB trước đây)
- ✅ Support nhiều định dạng image
- ✅ Easy to implement CDN trong tương lai

### User Experience

- ✅ Upload multiple files cùng lúc
- ✅ Real-time upload feedback
- ✅ Better error handling
- ✅ Không còn placeholder messages cho oversized images

## Testing

### 1. Test Upload

1. Vào `/blogs/create`
2. Upload multiple images (< 5MB each)
3. Verify images display correctly
4. Submit blog post
5. Check images in `/blogs` list

### 2. Test Backward Compatibility

1. Verify old base64 images still display
2. Check old blog posts load correctly

### 3. Test File Management

1. Upload images and delete them before submitting
2. Verify files are removed from server
3. Check for file cleanup

## Future Improvements

### Planned Features

- [ ] Image compression/optimization
- [ ] CDN integration
- [ ] Image thumbnail generation
- [ ] Bulk file cleanup utility
- [ ] Image resize on upload

### Performance Optimizations

- [ ] Implement cleanup job for unused files
- [ ] Add image caching headers
- [ ] Optimize image serving middleware

## Notes

- File cleanup hiện tại manual, có thể implement automatic cleanup job
- UUID filename prevents naming conflicts
- Static file serving được optimize bởi Express
- Multer handle file validation và error handling automatically

## Commands để test

```bash
# Start server
cd server && node index.js

# Start client
npm run dev

# Visit http://localhost:5174/blogs/create to test upload
```
