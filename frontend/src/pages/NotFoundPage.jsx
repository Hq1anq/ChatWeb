import { useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className={styles.notfoundContainer}>
      <div className={styles.notfoundContent}>
        {/* Icon/Animation 404 */}
        <div className={styles.notfoundIcon}>
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#3b82f6"
              strokeWidth="4"
              opacity="0.2"
            />
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
        <div className={styles.notfoundNumber}>404</div>

        {/* Tiêu đề */}
        <h1 className={styles.notfoundTitle}>Trang không tìm thấy</h1>

        {/* Mô tả */}
        <p className={styles.notfoundDescription}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
        </p>

        {/* Buttons */}
        <div className={styles.notfoundActions}>
          <button className={styles.btnPrimary} onClick={handleGoHome}>
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

          <button className={styles.btnSecondary} onClick={handleGoBack}>
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
        <div className={styles.notfoundSuggestions}>
          <p>Có thể bạn đang tìm:</p>
          <div className={styles.suggestionsLinks}>
            <a href="/" className={styles.suggestionLink}>
              Trang chủ
            </a>
            <a href="/login" className={styles.suggestionLink}>
              Đăng nhập
            </a>
            <a href="/signup" className={styles.suggestionLink}>
              Đăng ký
            </a>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className={styles.notfoundBgDecoration}>
        <div className={`${styles.decorationCircle} ${styles.circle1}`}></div>
        <div className={`${styles.decorationCircle} ${styles.circle2}`}></div>
        <div className={`${styles.decorationCircle} ${styles.circle3}`}></div>
      </div>
    </div>
  )
}

export default NotFoundPage
