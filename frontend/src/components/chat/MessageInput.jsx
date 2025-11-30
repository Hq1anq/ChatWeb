import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import toast from 'react-hot-toast'

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  // 1. Thêm Ref cho textarea để điều khiển chiều cao
  const textareaRef = useRef(null)
  
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
      // 2. Reset chiều cao textarea về ban đầu sau khi gửi
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

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

  // 3. Hàm xử lý tự động co giãn chiều cao
  const handleInput = (e) => {
    setMessage(e.target.value);
    const target = e.target;
    target.style.height = "auto"; 
    target.style.height = `${target.scrollHeight}px`; 
  };

  // 4. Hàm xử lý phím bấm (Enter vs Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Chặn xuống dòng mặc định
      handleSubmit(e);    // Gửi form
    }
  }

  return (
    <div className="relative p-4 w-full">
      {/* Image Preview - Giữ nguyên */}
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
      <form onSubmit={handleSubmit} className="flex items-end gap-2"> {/* items-end để icon nằm dưới cùng */}
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
          className="btn btn-ghost btn-circle mb-1" // mb-1 để căn đều đáy với textarea
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMessage}
        >
          <Paperclip size={20} />
        </button>

        {/* 5. Thay Input bằng Textarea */}
        <textarea
          ref={textareaRef}
          placeholder={isSendingMessage ? 'Đang gửi...' : 'Nhập tin nhắn...'}
          className="textarea textarea-bordered w-full resize-none min-h-[48px] max-h-[150px] leading-normal py-3"
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isSendingMessage}
          rows={1}
        />

        {/* Nút gửi */}
        <button
          type="submit"
          className="btn btn-primary btn-circle mb-1" // mb-1 để căn đều đáy với textarea
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