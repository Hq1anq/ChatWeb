import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        {/* Icon/Animation 404 */}
        <div className="notfound-icon">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="4" opacity="0.2" />
            <path
              d="M70 85C70 80.5817 73.5817 77 78 77C82.4183 77 86 80.5817 86 85C86 89.4183 82.4183 93 78 93C73.5817 93 70 89.4183 70 85Z"
              fill="#3b82f6"
            />
            <path
              d="M114 85C114 80.5817 117.582 77 122 77C126.418 77 130 80.5817 130 85C130 89.4183 126.418 93 122 93C117.582 93 114 89.4183 114 85Z"
              fill="#3b82f6"
            />
            <path
              d="M70 120C70 120 80 135 100 135C120 135 130 120 130 120"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text 404 */}
        <div className="notfound-number">404</div>
        
        {/* Tiêu đề */}
        <h1 className="notfound-title">Trang không tìm thấy</h1>
        
        {/* Mô tả */}
        <p className="notfound-description">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
        </p>

        {/* Buttons */}
        <div className="notfound-actions">
          <button className="btn-primary" onClick={handleGoHome}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 10L10 3L17 10M4 9V17H7V13H13V17H16V9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Về trang chủ
          </button>
          
          <button className="btn-secondary" onClick={handleGoBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5L7 10L12 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Suggestions */}
        <div className="notfound-suggestions">
          <p>Có thể bạn đang tìm:</p>
          <div className="suggestions-links">
            <a href="/" className="suggestion-link">Trang chủ</a>
            <a href="/login" className="suggestion-link">Đăng nhập</a>
            <a href="/signup" className="suggestion-link">Đăng ký</a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="notfound-bg-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;