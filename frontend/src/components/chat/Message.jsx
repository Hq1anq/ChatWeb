import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName } from '../../lib/utils'
import { 
  Loader2, FileText, Download, Smile, Check, CheckCheck,
  Reply, Pin, Forward, MoreHorizontal
} from 'lucide-react'
import axiosInstance from '../../lib/axios'
import ImageLightbox from './ImageLightbox'
import toast from 'react-hot-toast'

// Danh sách emoji reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡']

// Component hiển thị trạng thái tin nhắn
const MessageStatus = ({ status, fromMe }) => {
  if (!fromMe) return null

  const statusConfig = {
    sending: {
      icon: <Loader2 size={14} className="animate-spin" />,
      color: 'text-base-content/50',
      title: 'Đang gửi...'
    },
    sent: {
      icon: <Check size={14} />,
      color: 'text-base-content/50',
      title: 'Đã gửi'
    },
    delivered: {
      icon: <CheckCheck size={14} />,
      color: 'text-base-content/50',
      title: 'Đã nhận'
    },
    seen: {
      icon: <CheckCheck size={14} />,
      color: 'text-info',
      title: 'Đã xem'
    }
  }

  const config = statusConfig[status] || statusConfig.sent

  return (
    <span className={`inline-flex items-center ${config.color}`} title={config.title}>
      {config.icon}
    </span>
  )
}

// Component hiển thị tin nhắn được reply
const ReplyPreview = ({ replyTo }) => {
  if (!replyTo) return null

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="flex items-center gap-2 mb-2 p-2 bg-base-300/50 rounded-lg border-l-4 border-primary text-xs">
      <Reply size={12} className="shrink-0 text-primary" />
      <div className="min-w-0">
        <span className="font-semibold text-primary">{replyTo.senderName || 'Người dùng'}</span>
        <p className="truncate text-base-content/70">
          {replyTo.file && !replyTo.content ? '📎 File đính kèm' : truncateText(replyTo.content)}
        </p>
      </div>
    </div>
  )
}

const Message = ({ 
  messageId, 
  fromMe, 
  text, 
  file, 
  time, 
  isTemp, 
  reactions = [],
  status = 'sent',
  isPinned = false,
  replyTo = null,
  senderName = '',
  onReply,
  onPin,
  onForward,
  message
}) => {
  const [showLightbox, setShowLightbox] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [localReactions, setLocalReactions] = useState(reactions)
  const [isReacting, setIsReacting] = useState(false)

  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'

  const { user, socket } = useAuthStore()
  const { selectedUser } = useChatStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  const targetUser = fromMe ? user : selectedUser

  const profilePic = targetUser?.profilepic
    ? `${serverUrl}${targetUser.profilepic}`
    : `https://placehold.co/600x600/E5E7EB/333333?text=${targetUser?.fullname?.charAt(0) || '?'}`

  const fileName = getFileName(file)
  const isImage = isImageFile(file)
  const fileUrl = `${serverUrl}${file}`

  // Cập nhật reactions khi prop thay đổi
  useEffect(() => {
    setLocalReactions(reactions)
  }, [reactions])

  // Lắng nghe socket event cho reactions
  useEffect(() => {
    if (!socket || !messageId) return

    const handleReaction = (data) => {
      if (data.messageId === messageId) {
        if (data.action === 'added') {
          setLocalReactions(prev => {
            // Kiểm tra đã có chưa
            const exists = prev.find(r => r.emoji === data.emoji && r.userId === data.userId)
            if (exists) return prev
            return [...prev, { emoji: data.emoji, userId: data.userId, userName: data.userName }]
          })
        } else if (data.action === 'removed') {
          setLocalReactions(prev => 
            prev.filter(r => !(r.emoji === data.emoji && r.userId === data.userId))
          )
        }
      }
    }

    socket.on('messageReaction', handleReaction)
    return () => socket.off('messageReaction', handleReaction)
  }, [socket, messageId])

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const response = await axiosInstance.get(fileUrl, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi khi tải file:', error)
    }
  }

  // Xử lý thả reaction - GỌI API
  const handleReaction = async (emoji) => {
    if (isReacting || !messageId || isTemp) return
    
    setIsReacting(true)
    setShowReactionPicker(false)

    // Optimistic update
    const existingReaction = localReactions.find(
      r => r.emoji === emoji && r.userId === user?.userid
    )

    if (existingReaction) {
      setLocalReactions(prev => 
        prev.filter(r => !(r.emoji === emoji && r.userId === user?.userid))
      )
    } else {
      setLocalReactions(prev => [
        ...prev,
        { emoji, userId: user?.userid, userName: user?.fullname }
      ])
    }

    try {
      // Gọi API
      await axiosInstance.post(`/message/${messageId}/reaction`, { emoji })
    } catch (error) {
      console.error('Lỗi khi thả reaction:', error)
      // Rollback nếu lỗi
      setLocalReactions(reactions)
      toast.error('Không thể thả cảm xúc')
    } finally {
      setIsReacting(false)
    }
  }

  // Xử lý Reply
  const handleReply = () => {
    if (onReply) {
      onReply({
        messageId,
        content: text,
        file,
        senderName: fromMe ? 'Bạn' : senderName || selectedUser?.fullname,
        senderId: fromMe ? user?.userid : selectedUser?.userid
      })
    }
    setShowActionMenu(false)
  }

  // Xử lý Pin
  const handlePin = () => {
    if (onPin) {
      onPin(messageId, !isPinned)
    }
    setShowActionMenu(false)
  }

  // Xử lý Forward
  const handleForward = () => {
    if (onForward) {
      onForward(message || { messageId, content: text, file })
    }
    setShowActionMenu(false)
  }

  // Nhóm reactions theo emoji
  const groupedReactions = localReactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  const displayStatus = isTemp ? 'sending' : status

  return (
    <>
      <div className={`chat ${alignment} group`}>
        {/* Avatar */}
        {!fromMe && (
          <div className="chat-image avatar">
            <div className="w-10 rounded-full border">
              <img alt="User avatar" src={profilePic} />
            </div>
          </div>
        )}

        {/* Container cho bubble + reactions */}
        <div className="relative">
          {/* Action buttons - hiện khi hover */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1
              ${fromMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'}`}
          >
            {/* Reaction button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowReactionPicker(!showReactionPicker)
                  setShowActionMenu(false)
                }}
                className="btn btn-ghost btn-circle btn-xs bg-base-200 hover:bg-base-300"
                title="Thả cảm xúc"
                disabled={isTemp}
              >
                <Smile size={14} />
              </button>

              {/* Reaction picker popup */}
              {showReactionPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowReactionPicker(false)}
                  />
                  <div 
                    className={`absolute z-50 bg-base-100 shadow-lg rounded-full px-2 py-1 flex gap-1 border border-base-300
                      ${fromMe ? 'right-0' : 'left-0'} bottom-full mb-1`}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        disabled={isReacting}
                        className="w-7 h-7 flex items-center justify-center text-lg hover:scale-125 transition-transform disabled:opacity-50"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Reply button */}
            <button
              onClick={handleReply}
              className="btn btn-ghost btn-circle btn-xs bg-base-200 hover:bg-base-300"
              title="Phản hồi"
              disabled={isTemp}
            >
              <Reply size={14} />
            </button>

            {/* More actions button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowActionMenu(!showActionMenu)
                  setShowReactionPicker(false)
                }}
                className="btn btn-ghost btn-circle btn-xs bg-base-200 hover:bg-base-300"
                title="Thêm"
                disabled={isTemp}
              >
                <MoreHorizontal size={14} />
              </button>

              {/* Action menu popup */}
              {showActionMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowActionMenu(false)}
                  />
                  <div 
                    className={`absolute z-50 bg-base-100 shadow-lg rounded-lg py-1 border border-base-300 min-w-[140px]
                      ${fromMe ? 'right-0' : 'left-0'} bottom-full mb-1`}
                  >
                    <button
                      onClick={handlePin}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors"
                    >
                      <Pin size={14} className={isPinned ? 'text-warning' : ''} />
                      <span>{isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}</span>
                    </button>
                    <button
                      onClick={handleForward}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors"
                    >
                      <Forward size={14} />
                      <span>Chuyển tiếp</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pinned indicator */}
          {isPinned && (
            <div className={`flex items-center gap-1 text-xs text-warning mb-1 ${fromMe ? 'justify-end' : 'justify-start'}`}>
              <Pin size={12} />
              <span>Đã ghim</span>
            </div>
          )}

          {/* Bong bóng chat */}
          <div className={`chat-bubble flex flex-col ${bubbleColor} w-fit max-w-xs md:max-w-sm lg:max-w-md`}>
            {/* Reply preview */}
            {replyTo && <ReplyPreview replyTo={replyTo} />}

            {/* Hiển thị ảnh nếu có */}
            {file && (
              <div className="mb-2">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt="Attached"
                    className="max-w-xs rounded-lg border border-black/10 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowLightbox(true)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 bg-base-100 rounded-lg border border-base-300 transition-colors">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={fileName}
                      className="flex items-center gap-2 p-2 bg-base-100 rounded-lg text-primary hover:bg-base-200 transition-colors"
                      title={`Tải xuống ${fileName}`}
                    >
                      <FileText size={20} className="shrink-0 text-base-content/80" />
                      <span className="truncate max-w-[150px] font-medium text-sm text-base-content/80">
                        {fileName}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-base-200 shrink-0"
                      title={`Tải xuống ${fileName}`}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hiển thị text */}
            {text && (
              <p className="whitespace-pre-wrap break-words text-left min-w-0 inline">
                {text}
              </p>
            )}
          </div>

          {/* Hiển thị reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div 
              className={`flex flex-wrap gap-1 mt-1 ${fromMe ? 'justify-end' : 'justify-start'}`}
            >
              {Object.entries(groupedReactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  disabled={isReacting || isTemp}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors
                    ${users.some(u => u.userId === user?.userid) 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-base-200 border-base-300 hover:bg-base-300'
                    } disabled:opacity-50`}
                  title={users.map(u => u.userName).join(', ')}
                >
                  <span>{emoji}</span>
                  <span className="text-base-content/70">{users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thời gian + Trạng thái */}
        <div className="chat-footer opacity-50 text-xs mt-1 flex items-center gap-1">
          <span>{time}</span>
          <MessageStatus status={displayStatus} fromMe={fromMe} />
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && isImage && (
        <ImageLightbox
          src={fileUrl}
          alt={fileName}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  )
}

export default Message