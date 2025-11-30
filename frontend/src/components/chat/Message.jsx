import React from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'

const Message = ({ fromMe, text, image, time, isTemp }) => {
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
        {image && (
          <div className="mb-2">
            <img
              src={image} // Nếu là base64 (preview) hoặc url (server) đều chạy tốt
              alt="Attached"
              className="max-w-xs rounded-lg border border-black/10"
            />
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
