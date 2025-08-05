import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogDetail.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockBlog = {
      id: id,
      title: "Khám phá vẻ đẹp của React trong năm 2025",
      content: `React tiếp tục là một trong những framework phổ biến nhất trong cộng đồng developer. 

Với những cập nhật mới trong năm 2025, React đã mang đến nhiều tính năng thú vị:

• Server Components mạnh mẽ hơn
• Performance được cải thiện đáng kể  
• Developer Experience tốt hơn
• Integration với AI tools

Hãy cùng khám phá những điều thú vị này!`,
      author: {
        name: "Nguyễn Văn A",
        avatar: "A",
        username: "@nguyenvana"
      },
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
      privacy: "public",
      createdAt: "2025-01-05T10:30:00Z",
      likes: 42,
      shares: 12,
      isLiked: false,
      tags: ["React", "JavaScript", "WebDev"]
    };

    const mockComments = [
      {
        id: 1,
        author: { name: "Trần Thị B", avatar: "B", username: "@tranthib" },
        content: "Bài viết rất hay! Cảm ơn bạn đã chia sẻ.",
        createdAt: "2025-01-05T11:00:00Z",
        likes: 5
      },
      {
        id: 2,
        author: { name: "Lê Văn C", avatar: "C", username: "@levanc" },
        content: "React thực sự đang ngày càng mạnh mẽ. Mình đang học và thấy rất thú vị!",
        createdAt: "2025-01-05T11:30:00Z",
        likes: 3
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setBlog(mockBlog);
      setComments(mockComments);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleLike = () => {
    setBlog(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: { name: "Bạn", avatar: "U", username: "@user" },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-error">
        <h2>Không tìm thấy bài viết</h2>
        <button onClick={() => navigate('/blogs')} className="back-btn">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Header */}
        <div className="blog-detail-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <div className="header-actions">
            <button className="share-btn">
              <i className="fas fa-share"></i>
            </button>
            <button className="more-btn">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>

        {/* Blog Content */}
        <div className="blog-content">
          {/* Author Info */}
          <div className="author-section">
            <div className="author-avatar">
              {blog.author.avatar}
            </div>
            <div className="author-info">
              <h3 className="author-name">{blog.author.name}</h3>
              <p className="author-username">{blog.author.username}</p>
              <p className="publish-date">{formatDate(blog.createdAt)}</p>
            </div>
            <div className="privacy-badge">
              <i className={`fas ${blog.privacy === 'public' ? 'fa-globe' : blog.privacy === 'friends' ? 'fa-user-friends' : 'fa-lock'}`}></i>
              {blog.privacy === 'public' ? 'Công khai' : blog.privacy === 'friends' ? 'Bạn bè' : 'Riêng tư'}
            </div>
          </div>

          {/* Blog Text Content */}
          <div className="blog-text">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-body">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Blog Image */}
          {blog.image && (
            <div className="blog-image">
              <img src={blog.image} alt="Blog content" />
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-tags">
              {blog.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="interaction-bar">
            <button 
              className={`interaction-btn like-btn ${blog.isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <i className={`${blog.isLiked ? 'fas' : 'far'} fa-heart`}></i>
              <span>{blog.likes}</span>
            </button>
            <button className="interaction-btn comment-btn">
              <i className="far fa-comment"></i>
              <span>{comments.length}</span>
            </button>
            <button className="interaction-btn share-btn">
              <i className="fas fa-share"></i>
              <span>{blog.shares}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="comments-title">
            Bình luận ({comments.length})
          </h3>

          {/* Add Comment */}
          <form onSubmit={handleComment} className="add-comment">
            <div className="comment-avatar">U</div>
            <div className="comment-input-wrapper">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="comment-input"
                rows="3"
              />
              <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.author.avatar}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author.name}</span>
                    <span className="comment-username">{comment.author.username}</span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-actions">
                    <button className="comment-like">
                      <i className="far fa-heart"></i>
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    <button className="comment-reply">Trả lời</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
