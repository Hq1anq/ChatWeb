import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName } from '../../lib/utils'
import { Loader2, FileText, Download, Smile, Check, CheckCheck } from 'lucide-react'
import axiosInstance from '../../lib/axios'
import ImageLightbox from './ImageLightbox'

// Danh sách emoji reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡']

// Component hiển thị trạng thái tin nhắn
const MessageStatus = ({ status, fromMe }) => {
  // Chỉ hiển thị trạng thái cho tin nhắn của mình
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
// eslint-disable-next-line no-unused-vars
const Message = ({ messageId, fromMe, text, file, time, isTemp, reactions = [],status = 'sent' }) => {
  const [showLightbox, setShowLightbox] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [localReactions, setLocalReactions] = useState(reactions)

  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'

  const { user } = useAuthStore()
  const { selectedUser } = useChatStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  const targetUser = fromMe ? user : selectedUser

  const profilePic = targetUser?.profilepic
    ? `${serverUrl}${targetUser.profilepic}`
    : `https://placehold.co/600x600/E5E7EB/333333?text=${targetUser?.fullname?.charAt(0) || '?'}`

  const fileName = getFileName(file)
  const isImage = isImageFile(file)
  const fileUrl = `${serverUrl}${file}`

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

  // Xử lý thả reaction
  const handleReaction = (emoji) => {
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
    
    setShowReactionPicker(false)

    // TODO: Gọi API để lưu reaction
    // await axiosInstance.post(`/message/${messageId}/reaction`, { emoji })
  }

  // Nhóm reactions theo emoji
  const groupedReactions = localReactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  // Xác định trạng thái hiển thị
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
          {/* Reaction picker button - hiện khi hover */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10
              ${fromMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'}`}
          >
            <div className="relative">
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="btn btn-ghost btn-circle btn-xs bg-base-200 hover:bg-base-300"
                title="Thả cảm xúc"
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
                      ${fromMe ? 'right-full mr-1' : 'left-full ml-1'} top-1/2 -translate-y-1/2`}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="w-7 h-7 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bong bóng chat */}
          <div className={`chat-bubble flex flex-col ${bubbleColor} w-fit max-w-xs md:max-w-sm lg:max-w-md`}>
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
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors
                    ${users.some(u => u.userId === user?.userid) 
                      ? 'bg-primary/20 border-primary' 
                      : 'bg-base-200 border-base-300 hover:bg-base-300'
                    }`}
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