import React, { useState, useRef } from 'react'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import toast from 'react-hot-toast'

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  const { sendMessage, isSendingMessage, selectedUser } = useChatStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (message.trim() === '' && !imagePreview) {
      toast.error('Vui lòng nhập tin nhắn hoặc chọn ảnh')
      return
    }

    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhận')
      return
    }

    // Gửi tin nhắn (với Optimistic UI)
    const result = await sendMessage(message, imagePreview)

    if (result.success) {
      // Clear input sau khi gửi thành công
      setMessage('')
      setImagePreview(null)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-lg border-2 border-primary"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Nút đính kèm file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          disabled={isSendingMessage}
        />
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMessage}
        >
          <Paperclip size={20} />
        </button>

        {/* Ô nhập liệu */}
        <input
          type="text"
          placeholder={
            isSendingMessage ? 'Đang gửi...' : 'Nhập tin nhắn...'
          }
          className="input input-bordered w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSendingMessage}
        />

        {/* Nút gửi */}
        <button
          type="submit"
          className="btn btn-primary btn-circle"
          disabled={isSendingMessage || (!message.trim() && !imagePreview)}
        >
          {isSendingMessage ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  )
}

export default MessageInput