import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile } from '../../lib/utils'
import { Loader2, FileText, Download } from 'lucide-react'
import axiosInstance from '../../lib/axios'

const Message = ({ fromMe, text, file, time, isTemp }) => {
  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'

  // Lấy thông tin user để hiển thị avatar chính xác
  const { user } = useAuthStore()
  const { selectedUser } = useChatStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  // Xác định avatar cần hiển thị (Của mình hay của bạn chat)
  const targetUser = fromMe ? user : selectedUser

  // Logic hiển thị Avatar: Có ảnh -> Link Server, Không có -> Ảnh mặc định
  const profilePic = targetUser?.profilepic
    ? `${serverUrl}${targetUser.profilepic}`
    : `https://placehold.co/600x600/E5E7EB/333333?text=${targetUser.fullname.charAt(
        0
      )}`

  // LOGIC MỚI: Extract tên file gốc (originName) bằng split và slice
  const fullFileName = file ? file.substring(file.lastIndexOf('/') + 1) : ''
  // Tách chuỗi theo '-', loại bỏ phần tử đầu tiên (metadata), và nối phần còn lại
  const parts = fullFileName.split('-')
  const fileName = parts.length > 1 ? parts.slice(1) : fullFileName
  const isImage = isImageFile(file)
  const fileUrl = `${serverUrl}${file}`

  const handleDownload = async (e) => {
    // Ngăn chặn các hành vi mặc định và ngăn chặn sự kiện nổi bọt
    e.preventDefault()
    e.stopPropagation()

    try {
      // 1. Dùng axios để fetch file dưới dạng binary data (blob)
      const response = await axiosInstance.get(fileUrl, {
        responseType: 'blob', // Yêu cầu trả về dữ liệu dưới dạng Blob để tải ảnh về client
      })

      // 2. Tạo Blob, URL tạm thời và thẻ <a> ẩn để kích hoạt tải xuống
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click() // Kích hoạt download

      // 3. Dọn dẹp
      link.remove()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi tải file:', error)
      // Có thể thêm toast.error('Không thể tải file');
    }
  }

  return (
    <div className={`chat ${alignment}`}>
      {/* Avatar */}
      {!fromMe && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full border">
            <img alt="User avatar" src={profilePic} />
          </div>
        </div>
      )}

      {/* Bong bóng chat */}
      <div className={`chat-bubble flex flex-col ${bubbleColor}`}>
        {/* Hiển thị ảnh nếu có */}
        {file && (
          <div className="mb-2">
            {isImage ? (
              <img
                src={fileUrl} // Nếu là base64 (preview) hoặc url (server) đều chạy tốt
                alt="Attached"
                className="max-w-xs rounded-lg border border-black/10"
              />
            ) : (
              // File không phải ảnh: .txt, pdf, zip, ...
              <div className="flex items-center justify-between gap-2 p-2 bg-base-100 rounded-lg border border-base-300 transition-colors">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer" // Security
                  download={fileName} // Thêm thuộc tính này để trình duyệt tải file
                  className="flex items-center gap-2 p-2 bg-base-100 rounded-lg text-primary hover:bg-base-200 transition-colors"
                  title={`Tải xuống ${fileName}`}
                >
                  <FileText
                    size={20}
                    className="shrink-0 text-base-content/80"
                  />
                  <span className="truncate max-w-[150px] font-medium text-sm text-base-content/80">
                    {fileName}
                  </span>
                </a>
                {/* Nút/Icon Tải xuống - THAY THẺ <a> BẰNG <button> */}
                <button
                  type="button" // Sử dụng type="button" để tránh submit form
                  onClick={handleDownload} // Gắn hàm download vào sự kiện click
                  className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-base-200 shrink-0"
                  title={`Tải xuống ${fileName}`}
                >
                  <Download size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hiển thị text - SỬA ĐỔI QUAN TRỌNG: whitespace-pre-wrap */}
        {text && (
          <p className="whitespace-pre-wrap wrap-break-words text-left min-w-0">
            {text}
          </p>
        )}

        {/* Loading indicator */}
        {isTemp && (
          <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
            <Loader2 size={12} className="animate-spin" />
            Đang gửi...
          </div>
        )}
      </div>

      {/* Thời gian */}
      <div className="chat-footer opacity-50 text-xs mt-1">{time}</div>
    </div>
  )
}

export default Message
