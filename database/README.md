# 🗄️ Database Documentation - Blog App 2025

## 📋 Tổng quan

Database cho ứng dụng Blog App 2025 được thiết kế để hỗ trợ đầy đủ các tính năng:

- Quản lý người dùng và xác thực
- Quản lý bài viết và danh mục
- Hệ thống bình luận và tương tác
- Theo dõi và thông báo
- Lưu trữ và tìm kiếm

## 🛠️ Yêu cầu hệ thống

### Database Engine

- **MySQL 8.0+** (Khuyến nghị)
- **MariaDB 10.3+** (Tương thích)
- **PostgreSQL 12+** (Có thể adapt)

### Cấu hình tối thiểu

- RAM: 512MB
- Storage: 2GB+ cho dữ liệu
- Charset: `utf8mb4` (hỗ trợ emoji và ký tự đặc biệt)
- Collation: `utf8mb4_unicode_ci`

## 📊 Schema Database

### Sơ đồ quan hệ các bảng

```
Users (1) -------- (N) Blogs
  |                   |
  |                   | (1)
  |                   |
  | (N)             (N) |
Followers          Comments
  |                   |
  | (N)             (N) |
  |                   |
Notifications      Likes
                     |
                   (N) |
                     |
                  Bookmarks

Categories (1) --- (N) Blogs (N) --- (N) Tags
                              |
                            Blog_Tags
```

### Danh sách các bảng

| Bảng              | Mô tả                | Số cột | Quan hệ                        |
| ----------------- | -------------------- | ------ | ------------------------------ |
| `users`           | Thông tin người dùng | 11     | 1-N với blogs, comments, likes |
| `categories`      | Danh mục bài viết    | 7      | 1-N với blogs                  |
| `blogs`           | Bài viết chính       | 15     | N-1 với users, categories      |
| `comments`        | Bình luận bài viết   | 8      | N-1 với users, blogs           |
| `likes`           | Lượt thích bài viết  | 4      | N-1 với users, blogs           |
| `tags`            | Thẻ gắn bài viết     | 5      | N-N với blogs                  |
| `blog_tags`       | Quan hệ blog-tags    | 4      | N-N relationship               |
| `followers`       | Theo dõi người dùng  | 4      | N-N relationship               |
| `bookmarks`       | Lưu bài viết         | 4      | N-1 với users, blogs           |
| `notifications`   | Thông báo hệ thống   | 8      | N-1 với users                  |
| `password_resets` | Reset mật khẩu       | 5      | Utility table                  |
| `sessions`        | Phiên đăng nhập      | 6      | N-1 với users                  |

## 🚀 Cài đặt Database

### Bước 1: Tạo Database

```sql
-- Tạo database mới
CREATE DATABASE blog_app_2025
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE blog_app_2025;
```

### Bước 2: Import Schema

```bash
# Import toàn bộ schema
mysql -u username -p blog_app_2025 < database/schema.sql

# Hoặc import từng migration
mysql -u username -p blog_app_2025 < database/migrations/001_create_users_table.sql
mysql -u username -p blog_app_2025 < database/migrations/002_create_categories_table.sql
# ... tiếp tục với các file migration khác
```

### Bước 3: Import Dữ liệu mẫu

```bash
# Import dữ liệu mẫu
mysql -u username -p blog_app_2025 < database/seeds/sample_data.sql
```

### Bước 4: Tạo User Database

```sql
-- Tạo user cho ứng dụng
CREATE USER 'blog_app_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Cấp quyền
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_app_2025.* TO 'blog_app_user'@'localhost';

-- Áp dụng thay đổi
FLUSH PRIVILEGES;
```

## ⚙️ Cấu hình Environment

### Backend Environment Variables

```env
# Database Configuration
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=blog_app_2025
DB_USERNAME=blog_app_user
DB_PASSWORD=your_secure_password

# Database Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_TIMEOUT=60000

# Charset & Timezone
DB_CHARSET=utf8mb4
DB_TIMEZONE=+07:00
```

### Connection String Examples

#### Node.js (mysql2)

```javascript
const mysql = require("mysql2/promise");

const connection = await mysql.createConnection({
  host: "localhost",
  user: "blog_app_user",
  password: "your_secure_password",
  database: "blog_app_2025",
  charset: "utf8mb4",
  timezone: "+07:00",
});
```

#### PHP (PDO)

```php
$dsn = "mysql:host=localhost;dbname=blog_app_2025;charset=utf8mb4";
$pdo = new PDO($dsn, 'blog_app_user', 'your_secure_password', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
```

## 📈 Indexes và Tối ưu hóa

### Indexes quan trọng

```sql
-- Tìm kiếm full-text
ALTER TABLE blogs ADD FULLTEXT(title, excerpt, content);

-- Composite indexes
CREATE INDEX idx_blogs_published ON blogs (status, published_at DESC);
CREATE INDEX idx_comments_blog_created ON comments (blog_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read, created_at DESC);

-- Foreign key indexes
CREATE INDEX idx_blogs_author_category ON blogs (author_id, category_id);
CREATE INDEX idx_likes_blog_user ON likes (blog_id, user_id);
```

### Query tối ưu hóa

```sql
-- Lấy bài viết phổ biến
SELECT b.*, COUNT(l.id) as like_count
FROM blogs b
LEFT JOIN likes l ON b.id = l.blog_id
WHERE b.status = 'published'
GROUP BY b.id
ORDER BY like_count DESC, b.created_at DESC;

-- Tìm kiếm full-text
SELECT *, MATCH(title, excerpt, content) AGAINST('keyword' IN NATURAL LANGUAGE MODE) as relevance
FROM blogs
WHERE MATCH(title, excerpt, content) AGAINST('keyword' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC;
```

## 🧹 Maintenance & Cleanup

### Script dọn dẹp tự động

```sql
-- Xóa password reset tokens hết hạn
CREATE EVENT cleanup_password_resets
ON SCHEDULE EVERY 1 HOUR
DO DELETE FROM password_resets WHERE expires_at < NOW();

-- Xóa sessions cũ (30 ngày)
CREATE EVENT cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Xóa notifications cũ (90 ngày)
CREATE EVENT cleanup_old_notifications
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### Backup & Restore

```bash
# Backup database
mysqldump -u username -p --single-transaction --routines --triggers blog_app_2025 > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
mysql -u username -p blog_app_2025 < backup_file.sql

# Backup chỉ data (không schema)
mysqldump -u username -p --no-create-info --complete-insert blog_app_2025 > data_backup.sql
```

## 📋 Migration Guidelines

### Quy tắc Migration

1. **Tên file**: `XXX_description.sql` (XXX = số thứ tự 3 chữ số)
2. **Rollback**: Mỗi migration phải có rollback script
3. **Test**: Test migration trên database copy trước khi apply production

### Template Migration

```sql
-- Migration: 004_add_featured_column_to_blogs
-- Created: 2025-08-05
-- Description: Thêm cột featured cho bài viết nổi bật

-- Up
ALTER TABLE blogs ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER status;
CREATE INDEX idx_blogs_featured ON blogs (is_featured, published_at DESC);

-- Down (Rollback)
-- ALTER TABLE blogs DROP COLUMN is_featured;
-- DROP INDEX idx_blogs_featured ON blogs;
```

## 🔍 Monitoring & Debugging

### Queries hữu ích cho monitoring

```sql
-- Kiểm tra kích thước database
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.tables
WHERE table_schema = 'blog_app_2025'
ORDER BY (data_length + index_length) DESC;

-- Kiểm tra slow queries
SHOW FULL PROCESSLIST;

-- Phân tích index usage
SELECT
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    NULLABLE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'blog_app_2025';
```

## 🚨 Troubleshooting

### Lỗi thường gặp

#### 1. Connection refused

```bash
# Kiểm tra MySQL service
sudo systemctl status mysql
sudo systemctl start mysql

# Kiểm tra port
netstat -tlnp | grep :3306
```

#### 2. Character encoding issues

```sql
-- Kiểm tra charset
SHOW VARIABLES LIKE 'character_set%';

-- Sửa charset table
ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Foreign key constraints

```sql
-- Tắt foreign key check tạm thời
SET FOREIGN_KEY_CHECKS = 0;
-- ... thực hiện operations
SET FOREIGN_KEY_CHECKS = 1;
```

## 📚 Resources

### Documentation

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [MariaDB Knowledge Base](https://mariadb.com/kb/en/)

### Tools khuyến nghị

- **phpMyAdmin** - Web interface
- **MySQL Workbench** - Desktop GUI
- **DBeaver** - Universal database tool
- **Adminer** - Lightweight web interface

### Performance Tools

- **MySQL Tuner** - Performance tuning
- **Percona Toolkit** - Advanced optimization
- **pt-query-digest** - Query analysis

---

## 📞 Support

Nếu gặp vấn đề với database, hãy kiểm tra:

1. Log files: `/var/log/mysql/error.log`
2. Configuration: `/etc/mysql/mysql.conf.d/mysqld.cnf`
3. Connection settings trong backend application

**Created**: August 2025  
**Version**: 1.0  
**Maintainer**: Blog App 2025 Team
