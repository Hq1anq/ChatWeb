import { useState, useRef } from 'react'
import { Send, Paperclip, X, Loader2, FileText, Image } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore' // <--- 1. Import AuthStore
import toast from 'react-hot-toast'
import { getProfilePic } from '../../lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [fileAttachment, setFileAttachment] = useState(null)
  
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // Lấy currentUser để lọc khỏi danh sách tag
  const { user: currentUser } = useAuthStore() // <--- 2. Lấy user hiện tại
  const { sendMessage, isSendingMessage, selectedUser, groupMembers } = useChatStore()
  
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

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
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
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
    const val = e.target.value;
    const selectionStart = e.target.selectionStart;
    setMessage(val);
    setCursorPosition(selectionStart);
    
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;

    // --- LOGIC TAG ---
    // Kiểm tra undefined thay vì ! để hỗ trợ groupid=0
    if (selectedUser?.groupid === undefined) {
        setShowMentions(false);
        return;
    }

    const textUpToCursor = val.slice(0, selectionStart);
    const lastAtPos = textUpToCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
        const isStartOfLine = lastAtPos === 0;
        const isPrecededBySpace = textUpToCursor[lastAtPos - 1] === ' ' || textUpToCursor[lastAtPos - 1] === '\n';

        if (isStartOfLine || isPrecededBySpace) {
            const query = textUpToCursor.slice(lastAtPos + 1);
            if (query.length < 30 && !query.includes(' ')) { 
                setMentionQuery(query);
                setShowMentions(true);
                return;
            }
        }
    }
    setShowMentions(false);
  }

  const handleSelectMention = (user) => {
      const nameToInsert = user.nickname || user.fullname;
      
      const textUpToCursor = message.slice(0, cursorPosition);
      const lastAtPos = textUpToCursor.lastIndexOf('@');
      const textBeforeAt = message.slice(0, lastAtPos);
      const textAfterCursor = message.slice(cursorPosition);
      
      const newMessage = `${textBeforeAt}@${nameToInsert} ${textAfterCursor}`;
      
      setMessage(newMessage);
      setShowMentions(false);
      
      setTimeout(() => {
          if(textareaRef.current) textareaRef.current.focus();
      }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // --- 3. LỌC DANH SÁCH THÀNH VIÊN ---
  const filteredMembers = showMentions 
      ? (groupMembers || [])
          .filter(m => m.userid !== currentUser?.userid) // <--- Loại bỏ bản thân
          .filter(m => (m.nickname || m.fullname).toLowerCase().includes(mentionQuery.toLowerCase()))
      : [];

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
            <span className="truncate max-w-[150px] md:max-w-[200px] text-sm">{fileAttachment.file.name}</span>
          </div>
          <button type="button" onClick={removeFile} className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-1 md:gap-2">
        <input ref={fileInputRef} type="file" accept="*" className="hidden" onChange={handleFileSelect} disabled={isSendingMessage} />
        <button type="button" className="btn btn-ghost btn-circle btn-sm md:btn-md mb-1" onClick={() => fileInputRef.current?.click()} disabled={isSendingMessage}>
          <Paperclip size={18} className="md:w-5 md:h-5" />
        </button>

        <textarea
          ref={textareaRef}
          placeholder={isSendingMessage ? 'Đang gửi...' : 'Nhập tin nhắn...'}
          className="textarea textarea-bordered w-full resize-none min-h-10 md:min-h-12 max-h-[120px] md:max-h-[150px] leading-normal py-2 md:py-3 text-sm md:text-base"
          value={message}
          onChange={handleInput} 
          onKeyDown={handleKeyDown}
          disabled={isSendingMessage}
          rows={1}
          onClick={(e) => setCursorPosition(e.target.selectionStart)} 
        />

        <button type="submit" className="btn btn-primary btn-circle btn-sm md:btn-md mb-1" disabled={isSendingMessage || (!message.trim() && !fileAttachment)}>
          {isSendingMessage ? <Loader2 size={18} className="animate-spin md:w-5 md:h-5" /> : <Send size={18} className="md:w-5 md:h-5" />}
        </button>
      </form>
    </div>
  )
}

export default MessageInput