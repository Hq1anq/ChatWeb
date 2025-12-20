import { useState, useRef } from 'react'
import { Send, Paperclip, X, Loader2, FileText, Image, Smile } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { getProfilePic } from '../../lib/utils'
import EmojiPicker from './EmojiPicker'

const MAX_FILE_SIZE = 5 * 1024 * 1024

// Danh sách emoji phổ biến
const EMOJI_CATEGORIES = {
  'Mặt cười': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'],
  'Cảm xúc': ['😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱'],
  'Cử chỉ': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Trái tim': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Động vật': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'],
  'Đồ ăn': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🌮', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🎂', '🍩', '🍪', '🍫'],
}

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [fileAttachment, setFileAttachment] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Mặt cười')
  
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const { user: currentUser } = useAuthStore()
  const { sendMessage, isSendingMessage, selectedUser, groupMembers } = useChatStore()
  
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={24} className="text-success" />
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

    const result = await sendMessage(message, fileAttachment)

    if (result.success) {
      setMessage('')
      setFileAttachment(null)
      setShowMentions(false)
      setShowEmojiPicker(false)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setFileAttachment({ file, previewUrl: reader.result })
      reader.readAsDataURL(file)
    } else {
      setFileAttachment({ file, previewUrl: null })
    }
    toast.success(`Đã chọn: ${file.name}`)
  }

  const removeFile = () => {
    setFileAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleInput = (e) => {
    const val = e.target.value
    const selectionStart = e.target.selectionStart
    setMessage(val)
    setCursorPosition(selectionStart)
    
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`

    // Logic tag
    if (selectedUser?.groupid === undefined) {
      setShowMentions(false)
      return
    }

    const textUpToCursor = val.slice(0, selectionStart)
    const lastAtPos = textUpToCursor.lastIndexOf('@')

    if (lastAtPos !== -1) {
      const isStartOfLine = lastAtPos === 0
      const isPrecededBySpace = textUpToCursor[lastAtPos - 1] === ' ' || textUpToCursor[lastAtPos - 1] === '\n'

      if (isStartOfLine || isPrecededBySpace) {
        const query = textUpToCursor.slice(lastAtPos + 1)
        if (query.length < 30 && !query.includes(' ')) { 
          setMentionQuery(query)
          setShowMentions(true)
          return
        }
      }
    }
    setShowMentions(false)
  }

  const handleSelectMention = (user) => {
    const nameToInsert = user.nickname || user.fullname
    
    const textUpToCursor = message.slice(0, cursorPosition)
    const lastAtPos = textUpToCursor.lastIndexOf('@')
    const textBeforeAt = message.slice(0, lastAtPos)
    const textAfterCursor = message.slice(cursorPosition)
    
    const newMessage = `${textBeforeAt}@${nameToInsert} ${textAfterCursor}`
    
    setMessage(newMessage)
    setShowMentions(false)
    
    setTimeout(() => {
      if(textareaRef.current) textareaRef.current.focus()
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Xử lý chọn emoji
  const handleEmojiSelect = (emoji) => {
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition)
    setMessage(newMessage)
    setCursorPosition(cursorPosition + emoji.length)
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length)
      }
    }, 0)
  }

  const filteredMembers = showMentions 
    ? (groupMembers || [])
        .filter(m => m.userid !== currentUser?.userid)
        .filter(m => (m.nickname || m.fullname).toLowerCase().includes(mentionQuery.toLowerCase()))
    : []

  return (
    <div className="relative">
      {/* Popup Gợi ý Tag */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-base-100 shadow-xl border border-base-300 rounded-lg overflow-hidden z-50">
          <div className="p-2 bg-base-200 text-xs font-bold text-base-content/50">Gợi ý thành viên</div>
          <ul className="max-h-40 overflow-y-auto">
            {filteredMembers.map(member => (
              <li 
                key={member.userid}
                className="flex items-center gap-2 p-2 hover:bg-primary/10 cursor-pointer transition-colors"
                onClick={() => handleSelectMention(member)}
              >
                <div className="avatar w-6 h-6">
                  <img 
                    className="rounded-full object-cover" 
                    src={getProfilePic(member)} 
                    alt="avatar"
                  />
                </div>
                <span className="text-sm font-medium truncate">{member.nickname || member.fullname}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-base-100 shadow-xl border border-base-300 rounded-lg overflow-hidden z-50">
            {/* Header - Categories */}
            <div className="flex overflow-x-auto bg-base-200 p-1 gap-1 scrollbar-hide">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveEmojiCategory(category)}
                  className={`px-2 py-1 text-xs whitespace-nowrap rounded transition-colors ${
                    activeEmojiCategory === category
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="p-2 h-48 overflow-y-auto">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleEmojiSelect(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-base-200 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* File Preview */}
      {fileAttachment && (
        <div className="mb-3 relative bg-base-200 p-3 rounded-lg border border-base-300 max-w-xs md:max-w-sm">
          <div className="flex items-center gap-3">
            {fileAttachment.previewUrl ? (
              <img src={fileAttachment.previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
            ) : (
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-base-300 rounded-md">
                {getFileIcon(fileAttachment.file)}
              </div>
            )}
            <span className="truncate max-w-37.5 md:max-w-50 text-sm">{fileAttachment.file.name}</span>
          </div>
          <button type="button" onClick={removeFile} className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-1 md:gap-2">
        {/* Nút đính kèm file */}
        <input ref={fileInputRef} type="file" accept="*" className="hidden" onChange={handleFileSelect} disabled={isSendingMessage} />
        <button 
          type="button" 
          className="btn btn-ghost btn-circle btn-sm md:btn-md mb-1" 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isSendingMessage}
          title="Đính kèm file"
        >
          <Paperclip size={18} className="md:w-5 md:h-5" />
        </button>

        {/* Nút emoji */}
        <button 
          type="button" 
          className="btn btn-ghost btn-circle btn-sm md:btn-md mb-1" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
          disabled={isSendingMessage}
          title="Chọn emoji"
        >
          <Smile size={18} className="md:w-5 md:h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder={isSendingMessage ? 'Đang gửi...' : 'Nhập tin nhắn...'}
          className="textarea textarea-bordered w-full resize-none min-h-10 md:min-h-12 max-h-30 md:max-h-37.5 leading-normal py-2 md:py-3 text-sm md:text-base"
          value={message}
          onChange={handleInput} 
          onKeyDown={handleKeyDown}
          disabled={isSendingMessage}
          rows={1}
          onClick={(e) => setCursorPosition(e.target.selectionStart)} 
        />

        {/* Nút gửi */}
        <button 
          type="submit" 
          className="btn btn-primary btn-circle btn-sm md:btn-md mb-1" 
          disabled={isSendingMessage || (!message.trim() && !fileAttachment)}
          title="Gửi tin nhắn"
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