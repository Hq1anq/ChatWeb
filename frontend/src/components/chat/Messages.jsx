import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName } from '../../lib/utils'
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
    : `https://placehold.co/600x600/E5E7EB/333333?text=${targetUser?.fullname?.charAt(0) || '?'}`

  // Extract tên file gốc (originName) bằng split và slice
  const fileName = getFileName(file)
  const isImage = isImageFile(file)
  const fileUrl = `${serverUrl}${file}`

  const handleDownload = async (e) => {
    // Ngăn chặn các hành vi mặc định và ngăn chặn sự kiện nổi bọt
    e.preventDefault()
    e.stopPropagation()

    try {
      // 1. Dùng axios để fetch file dưới dạng binary data (blob)
      const response = await axiosInstance.get(fileUrl, {
        responseType: 'blob',
      })

      // 2. Tạo Blob, URL tạm thời và thẻ <a> ẩn để kích hoạt tải xuống
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // 3. Dọn dẹp
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi tải file:', error)
    }
  }

  return (
    <div className={`chat ${alignment}`}>
      {/* Avatar - ẩn trên mobile để tiết kiệm không gian */}
      {!fromMe && (
        <div className="chat-image avatar hidden sm:block">
          <div className="w-8 md:w-10 rounded-full border">
            <img alt="User avatar" src={profilePic} />
          </div>
        </div>
      )}

      {/* Bong bóng chat */}
      <div
        className={`chat-bubble flex flex-col ${bubbleColor} max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md`}
      >
        {/* Hiển thị ảnh nếu có */}
        {file && (
          <div className="mb-2">
            {isImage ? (
              <img
                src={fileUrl}
                alt="Attached"
                className="max-w-full rounded-lg border border-black/10"
              />
            ) : (
              // File không phải ảnh: .txt, pdf, zip, ...
              <div className="flex items-center justify-between gap-2 p-2 bg-base-100 rounded-lg border border-base-300 transition-colors">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={fileName}
                  className="flex items-center gap-2 p-1 md:p-2 bg-base-100 rounded-lg text-primary hover:bg-base-200 transition-colors min-w-0"
                  title={`Tải xuống ${fileName}`}
                >
                  <FileText
                    size={18}
                    className="shrink-0 text-base-content/80"
                  />
                  <span className="truncate max-w-[100px] md:max-w-[150px] font-medium text-xs md:text-sm text-base-content/80">
                    {fileName}
                  </span>
                </a>
                {/* Nút Tải xuống */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-base-200 shrink-0"
                  title={`Tải xuống ${fileName}`}
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hiển thị text */}
        {text && (
          <p className="whitespace-pre-wrap break-words text-left min-w-0 text-sm md:text-base">
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
      <div className="chat-footer opacity-50 text-[10px] md:text-xs mt-1">
        {time}
      </div>
    </div>
  )
}

export default Message
















































