import { useState, useRef } from 'react'
import { Send, Paperclip, X, Loader2, FileText, Image } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import toast from 'react-hot-toast'

// Hằng số cho dung lượng file tối đa (5MB như config bên backend)
const MAX_FILE_SIZE = 5 * 1024 * 1024

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [fileAttachment, setFileAttachment] = useState(null)
  const fileInputRef = useRef(null)

  // Ref cho textarea để điều khiển chiều cao
  const textareaRef = useRef(null)

  const { sendMessage, isSendingMessage, selectedUser } = useChatStore()

  // Function to render the appropriate icon based on file type
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image size={24} className="text-success" />
    }
    // You can add more specific checks here (e.g., for PDF, ZIP)
    return <FileText size={24} className="text-info" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (message.trim() === '' && !fileAttachment) {
      toast.error('Vui lòng nhập tin nhắn hoặc chọn file')
      return
    }

    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhận')
      return
    }

    // Gửi tin nhắn (với Optimistic UI)
    const result = await sendMessage(message, fileAttachment)

    if (result.success) {
      // Clear input sau khi gửi thành công
      setMessage('')
      setFileAttachment(null)
      // Reset chiều cao textarea về ban đầu sau khi gửi
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    if (file.type.startsWith('image/')) {
      // nếu là ảnh, tạo URL preview.
      const reader = new FileReader()
      reader.onloadend = () => {
        // Store both the File object and its preview URL
        setFileAttachment({ file, previewUrl: reader.result })
      }
      reader.readAsDataURL(file)
    } else {
      // For non-image files, store the File object and use null for the preview URL
      setFileAttachment({ file, previewUrl: null })
    }

    toast.success(`File selected: ${file.name}`)
  }

  const removeFile = () => {
    setFileAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Clear the actual file input value
    }
  }

  // Hàm xử lý tự động co giãn chiều cao
  const handleInput = (e) => {
    setMessage(e.target.value)
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  // Hàm xử lý phím bấm (Enter vs Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Chặn xuống dòng mặc định
      handleSubmit(e) // Gửi form
    }
  }

  return (
    <div className="relative">
      {/* Image Preview */}
      {fileAttachment && (
        <div className="mb-3 relative bg-base-200 p-3 rounded-lg border border-base-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-3">
            {fileAttachment.previewUrl ? (
              // Image preview
              <img
                src={fileAttachment.previewUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-md border"
              />
            ) : (
              // Non-image file icon and name
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-base-300 rounded-md">
                {getFileIcon(fileAttachment.file)}
              </div>
            )}
            <span className="truncate max-w-[150px] md:max-w-[200px] text-sm">
              {fileAttachment.file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-1 md:gap-2">
        {/* Nút đính kèm file */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isSendingMessage}
        />
        <button
          type="button"
          className="btn btn-ghost btn-circle btn-sm md:btn-md mb-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMessage}
        >
          <Paperclip size={18} className="md:w-5 md:h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder={isSendingMessage ? 'Đang gửi...' : 'Nhập tin nhắn...'}
          className="textarea textarea-bordered w-full resize-none min-h-10 md:min-h-12 max-h-[120px] md:max-h-[150px] leading-normal py-2 md:py-3 text-sm md:text-base"
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isSendingMessage}
          rows={1}
        />

        {/* Nút gửi */}
        <button
          type="submit"
          className="btn btn-primary btn-circle btn-sm md:btn-md mb-1"
          disabled={isSendingMessage || (!message.trim() && !fileAttachment)}
        >
          {isSendingMessage ? (
            <Loader2 size={18} className="animate-spin md:w-5 md:h-5" />
          ) : (
            <Send size={18} className="md:w-5 md:h-5" />
          )}
        </button>
      </form>
    </div>
  )
}

export default MessageInput
















































