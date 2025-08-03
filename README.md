# Blog App 2025

Ứng dụng blog hiện đại được xây dựng với React, Vite và CSS thuần.

## Tính năng

- 🔐 Xác thực người dùng (Đăng nhập/Đăng ký)
- 📝 Quản lý bài viết (CRUD)
- 🔍 Tìm kiếm và lọc bài viết
- 📱 Responsive design
- 🎨 UI/UX hiện đại với CSS thuần
- 📸 Upload hình ảnh
- 👤 Quản lý profile người dùng

## Cấu trúc dự án

```
src/
├── api/                    # API calls
├── assets/                 # Static assets
├── components/             # Reusable components
│   ├── ui/                # UI components
│   └── layout/            # Layout components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── layouts/               # Page layouts
├── pages/                 # Page components
├── router/                # Routing configuration
├── styles/                # Global styles
├── utils/                 # Utility functions
└── config.js              # App configuration
```

## Cài đặt

1. Clone repository:
   \`\`\`bash
   git clone [repository-url]
   cd react-blog-app-2025
   \`\`\`

2. Cài đặt dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Thiết lập biến môi trường:
   \`\`\`bash
   cp .env.example .env

# Cập nhật các giá trị trong file .env

\`\`\`

4. Chạy ứng dụng:
   \`\`\`bash
   npm run dev
   \`\`\`

## Scripts

- \`npm run dev\` - Chạy development server
- \`npm run build\` - Build production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Chạy ESLint

## Công nghệ sử dụng

- **Frontend**: React 19, React Router DOM
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS thuần với CSS Variables
- **Linting**: ESLint

## API Endpoints

API backend cần cung cấp các endpoints sau:

### Authentication

- \`POST /api/auth/login\` - Đăng nhập
- \`POST /api/auth/register\` - Đăng ký
- \`POST /api/auth/logout\` - Đăng xuất
- \`GET /api/auth/me\` - Lấy thông tin user hiện tại

### Blogs

- \`GET /api/blogs\` - Lấy danh sách blog
- \`GET /api/blogs/:id\` - Lấy chi tiết blog
- \`POST /api/blogs\` - Tạo blog mới
- \`PUT /api/blogs/:id\` - Cập nhật blog
- \`DELETE /api/blogs/:id\` - Xóa blog
- \`GET /api/blogs/my-blogs\` - Lấy blog của user hiện tại

### Upload

- \`POST /api/upload/image\` - Upload hình ảnh

## Đóng góp

1. Fork repository
2. Tạo feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Mở Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# E-learning-4-react-blog-app-2025
