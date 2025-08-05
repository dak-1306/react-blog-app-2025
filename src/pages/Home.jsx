import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBlogs } from "../api/blog";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import { formatRelativeTime, truncateText } from "../utils";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Lấy blogs mới nhất khi component mount
  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  const fetchLatestBlogs = async () => {
    try {
      setLoading(true);
      const response = await getBlogs({ limit: 6 });
      setBlogs(response.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearchPerformed(true);
      const response = await getBlogs({ search: searchQuery, limit: 10 });
      setBlogs(response.data || []);
    } catch (error) {
      console.error("Error searching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleViewAllBlogs = () => {
    navigate("/blogs");
  };

  const handleStartWriting = () => {
    navigate("/blogs/create");
  };

  return (
    <div className="home">
      {/* Banner Section */}
      <section className="banner">
        <div className="banner__content">
          <h1 className="banner__title">
            Chào mừng bạn đến với{" "}
            <span className="banner__highlight">Blog App 2025</span>
          </h1>
          <p className="banner__subtitle">
            Chia sẻ kiến thức • Kết nối đam mê • Khám phá thế giới qua những câu
            chuyện
          </p>
          <div className="banner__actions">
            <Button
              size="large"
              onClick={handleStartWriting}
              className="banner__cta"
            >
              Bắt đầu viết bài
            </Button>
            <Button variant="outline" size="large" onClick={handleViewAllBlogs}>
              Khám phá bài viết
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2 className="search-title">Tìm kiếm bài viết</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Button type="submit" loading={loading} className="search-button">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="results-section">
        <div className="results-container">
          <div className="results-header">
            <h2 className="results-title">
              {searchPerformed
                ? `Kết quả tìm kiếm "${searchQuery}"`
                : "Bài viết mới nhất"}
            </h2>
            {!searchPerformed && (
              <Button variant="outline" onClick={handleViewAllBlogs}>
                Xem tất cả
              </Button>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <Spinner size="large" />
              <p>Đang tải...</p>
            </div>
          ) : (
            <div className="blog-grid">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="blog-card"
                    onClick={() => handleBlogClick(blog.id)}
                  >
                    {blog.image && (
                      <div className="blog-card__image">
                        <img src={blog.image} alt={blog.title} />
                      </div>
                    )}
                    <div className="blog-card__content">
                      <h3 className="blog-card__title">{blog.title}</h3>
                      <p className="blog-card__excerpt">
                        {truncateText(blog.excerpt || blog.content, 120)}
                      </p>
                      <div className="blog-card__meta">
                        <span className="blog-card__author">
                          {blog.author?.name}
                        </span>
                        <span className="blog-card__date">
                          {formatRelativeTime(blog.createdAt)}
                        </span>
                      </div>
                      {blog.category && (
                        <span className="blog-card__category">
                          {blog.category}
                        </span>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="no-results">
                  <h3>
                    {searchPerformed
                      ? "Không tìm thấy kết quả nào"
                      : "Chưa có bài viết nào"}
                  </h3>
                  <p>
                    {searchPerformed
                      ? "Hãy thử với từ khóa khác"
                      : "Hãy là người đầu tiên viết bài!"}
                  </p>
                  {!searchPerformed && (
                    <Button onClick={handleStartWriting}>
                      Viết bài đầu tiên
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
