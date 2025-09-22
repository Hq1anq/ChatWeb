import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName } from '../../lib/utils'
import { 
  Loader2, FileText, Download, Smile, Check, CheckCheck,
  Reply, Pin, Forward, MoreHorizontal, CornerUpRight
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
      icon: <Loader2 size={14} className="animate-spin" strokeWidth={3} />,
      color: 'text-base-content',
      title: 'Đang gửi...'
    },
    sent: {
      icon: <Check size={14} strokeWidth={3} />,
      color: 'text-base-content',
      title: 'Đã gửi'
    },
    delivered: {
      icon: <CheckCheck size={14} strokeWidth={3} />,
      color: 'text-base-content',
      title: 'Đã nhận'
    },
    seen: {
      icon: <CheckCheck size={14} strokeWidth={3} />,
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

// Component hiển thị tin nhắn được reply - ĐÃ CẢI THIỆN UI
const ReplyPreview = ({ replyTo, fromMe }) => {
  if (!replyTo) return null

  const truncateText = (text, maxLength = 50) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div 
      className={`mb-2 rounded-md overflow-hidden cursor-pointer transition-all hover:opacity-80
        ${fromMe 
          ? 'bg-black/20 border-l-4 border-white/50' 
          : 'bg-white/10 border-l-4 border-primary'
        }`}
      title="Click để xem tin nhắn gốc"
    >
      <div className="px-3 py-2">
        {/* Tên người gửi */}
        <div className={`text-xs font-bold mb-0.5 ${fromMe ? 'text-white/90' : 'text-primary'}`}>
          {replyTo.senderName || 'Người dùng'}
        </div>
        {/* Nội dung tin nhắn */}
        <p className={`text-xs truncate ${fromMe ? 'text-white/70' : 'text-base-content/70'}`}>
          {replyTo.file && !replyTo.content 
            ? '📎 File đính kèm' 
            : truncateText(replyTo.content)}
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
  isForwarded = false,
  onReply,
  onPin,
  onForward,
  message,
  highlightRegex
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

  const isGroup = selectedUser?.groupid !== undefined;

  let profilePic = ""; let senderName = ""; let avatarName = "";
  if (fromMe) {
    profilePic = user.profilepic; senderName = "Bạn"; avatarName = user.fullname;
  } else {
    if (isGroup) {
      profilePic = message.sender?.profilepic || message.profilepic;
      senderName = message.nickname || message.sender?.fullname || message.fullname || "Thành viên";
      avatarName = message.sender?.fullname || message.fullname || senderName;
    } else {
      profilePic = selectedUser?.profilepic; senderName = selectedUser?.fullname; avatarName = senderName;
    }
  }
  const profilePicUrl = profilePic ? `${serverUrl}${profilePic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${avatarName?.charAt(0).toUpperCase() || '?'}`

  const fileName = getFileName(file)
  const isImage = isImageFile(file)
  const fileUrl = file ? `${serverUrl}${file}` : ''

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

  // Logic xử lý highlight text (Mentions)
  const renderedContent = useMemo(() => {
    if (!highlightRegex || !text) return text;

    // Split text giữ lại phần khớp nhờ capturing group trong regex
    const parts = text.split(highlightRegex);

    return parts.map((part, index) => {
      // Kiểm tra xem phần này có khớp regex không
      if (part.match(highlightRegex)) {
        return (
          <span key={index} className="font-bold text-accent-content bg-accent hover:bg-accent/80 rounded px-1 mx-0.5 inline-block cursor-default">
            {part}
          </span>
        );
      }
      return part;
    });
  }, [text, highlightRegex]);

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
      await axiosInstance.post(`/message/${messageId}/reaction`, { emoji })
    } catch (error) {
      console.error('Lỗi khi thả reaction:', error)
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
        <div className="chat-image avatar hidden sm:block">
          <div className="w-8 md:w-10 rounded-full border border-base-300"><img alt="User avatar" src={profilePicUrl} /></div>
        </div>
        {isGroup && !fromMe && <div className="chat-header mb-1"><span className="text-xs font-bold opacity-70 mr-1">{senderName}</span></div>}

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
                    className={`absolute z-50 bg-base-100 shadow-lg rounded-lg py-1 border border-base-300 min-w-35
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

          {/* Forwarded indicator */}
          {isForwarded && (
            <div className={`flex items-center gap-1 text-xs text-base-content/50 mb-1 ${fromMe ? 'justify-end' : 'justify-start'}`}>
              <CornerUpRight size={12} />
              <span>Đã chuyển tiếp</span>
            </div>
          )}

          {/* Bong bóng chat */}
          <div className={`${file ? '' : `chat-bubble ${bubbleColor}`} flex flex-col w-fit max-w-xs md:max-w-sm lg:max-w-md`}>
            {/* Reply preview */}
            {replyTo && <ReplyPreview replyTo={replyTo} fromMe={fromMe} />}

            {/* Hiển thị ảnh nếu có */}
            {file && (
              <div className="">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt="Attached"
                    className="max-w-xs rounded-lg border border-black/10 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowLightbox(true)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 bg-base-300 hover:bg-base-200 rounded-lg border border-base-300 transition-colors">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={fileName}
                      className="flex items-center gap-2 p-2 rounded-lg text-primary"
                      title={`Tải xuống ${fileName}`}
                    >
                      <FileText size={20} className="shrink-0 text-base-content/80" />
                      <span className="truncate max-w-37.5 font-medium text-sm text-base-content/80">
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
              <p className="whitespace-pre-wrap wrap-break-word text-left min-w-0 inline">
                {renderedContent}
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