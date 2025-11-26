import React from 'react'
import { Loader2 } from 'lucide-react'

const Message = ({ fromMe, text, image, time, isTemp }) => {
  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'

  return (
    <div className={`chat ${alignment}`}>
      {/* Avatar (hiển thị cho tin nhắn đến) */}
      {!fromMe && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              alt="User avatar"
              src="https://placehold.co/600x600/E5E7EB/333333?text=A"
            />
          </div>
        </div>
      )}

      {/* Bong bóng chat */}
      <div className={`chat-bubble ${bubbleColor}`}>
        {/* Hiển thị ảnh nếu có */}
        {image && (
          <div className="mb-2">
            <img
              src={image}
              alt="Attached"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}
        
        {/* Hiển thị text */}
        {text && <div>{text}</div>}

        {/* Loading indicator cho tin nhắn tạm */}
        {isTemp && (
          <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
            <Loader2 size={12} className="animate-spin" />
            Đang gửi...
          </div>
        )}
      </div>

      {/* Thời gian */}
      <div className="chat-footer opacity-50 text-xs mt-1">
        {time}
      </div>
    </div>
  )
}

export default Message
