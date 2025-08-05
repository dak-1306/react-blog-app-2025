# Hướng Dẫn Setup Database

## 1. Chuẩn bị phpMyAdmin

### Bước 1: Import Database Schema
1. Mở phpMyAdmin: `http://localhost/phpmyadmin`
2. Tạo database mới tên `blog_app`
3. Import file `database/blog_app.sql` vào database này

### Bước 2: Kiểm tra Connection Settings
Cập nhật thông tin database trong `src/server/database.js`:

```javascript
const dbConfig = {
  host: 'localhost',     // Server MySQL của bạn
  user: 'root',          // Username MySQL
  password: '',          // Password MySQL (thường để trống với XAMPP)
  database: 'blog_app',  // Tên database vừa tạo
  port: 3306            // Port MySQL (mặc định 3306)
};
```

## 2. Cài đặt packages

### Bước 1: Install backend dependencies
```bash
npm install
```

Nếu có lỗi, cài từng package:
```bash
npm install bcryptjs cors express jsonwebtoken mysql2 concurrently
```

## 3. Chạy ứng dụng

### Phương án 1: Chạy tách biệt
```bash
# Terminal 1: Chạy backend server
npm run server

# Terminal 2: Chạy frontend 
npm run dev
```

### Phương án 2: Chạy cùng lúc (khuyến nghị)
```bash
npm run dev:all
```

## 4. Kiểm tra kết nối

### Test endpoints:
- Backend health: http://localhost:3000/api/health
- Database test: http://localhost:3000/api/test-db
- Frontend: http://localhost:5173

### Nếu có lỗi database:
1. Kiểm tra XAMPP/WAMP có đang chạy MySQL không
2. Kiểm tra thông tin database trong `src/server/database.js`
3. Đảm bảo đã import đúng file `database/blog_app.sql`

## 5. Test Authentication

Sau khi setup xong, bạn có thể:
1. Truy cập http://localhost:5173/register để đăng ký
2. Đăng nhập với tài khoản vừa tạo
3. Kiểm tra dữ liệu trong phpMyAdmin table `users`

## 6. API Endpoints có sẵn

```
POST /api/auth/register  - Đăng ký tài khoản mới
POST /api/auth/login     - Đăng nhập
GET  /api/auth/me        - Lấy thông tin user hiện tại
GET  /api/health         - Kiểm tra server
GET  /api/test-db        - Test kết nối database
```

## Troubleshooting

### Error: "connect ECONNREFUSED"
- Kiểm tra MySQL có đang chạy không
- Đảm bảo port 3306 không bị block

### Error: "ER_BAD_DB_ERROR"
- Database `blog_app` chưa được tạo
- Import lại file `database/blog_app.sql`

### Error: "Access denied"
- Username/password MySQL không đúng
- Cập nhật lại thông tin trong `src/server/database.js`
