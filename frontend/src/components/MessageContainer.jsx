import { useEffect, useRef, useState } from 'react'
import Messages from './chat/Messages.jsx'
import MessageInput from './chat/MessageInput.jsx'
import { Phone, Video, Info, Menu, ArrowLeft } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'

const MessageContainer = () => {
  const {
    selectedUser,
    getMessages,
    messages,
    isLoadingMessages,
    onMessage,
    offMessage,
    openSidebar,
    setSelectedUser,
  } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const messagesEndRef = useRef(null)
  
  // State cho Reply
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    if (!selectedUser?.userid && !selectedUser?.groupid) return
    const id = selectedUser.groupid || selectedUser.userid
    const isGroup = selectedUser.groupid !== undefined
    getMessages(id, isGroup)
    onMessage()
    return () => offMessage()
  }, [selectedUser?.userid, selectedUser?.groupid])

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset reply khi đổi chat
  useEffect(() => {
    setReplyingTo(null)
  }, [selectedUser])

  // Hàm quay lại danh sách chat (mobile)
  const handleBack = () => {
    setSelectedUser(null)
    openSidebar()
  }

  // Hàm xử lý Reply
  const handleReply = (replyData) => {
    setReplyingTo(replyData)
  }

  // Hàm hủy Reply
  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full relative">
        <button
          className="btn btn-ghost btn-circle md:hidden absolute top-4 left-4"
          onClick={openSidebar}
        >
          <Menu size={24} />
        </button>

        <div className="text-center px-4">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg md:text-xl text-base-content/60">
            Hãy chọn một cuộc trò chuyện để bắt đầu
          </p>
          <p className="text-sm text-base-content/40 mt-2 md:hidden">
            Nhấn vào biểu tượng menu để xem danh sách chat
          </p>
        </div>
      </div>
    )
  }

  const isGroup = selectedUser.groupid !== undefined
  const displayName = isGroup ? selectedUser.name : selectedUser.fullname
  const isOnline = !isGroup && onlineUsers.includes(selectedUser.userid?.toString())
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-4 shadow-sm bg-base-100">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            className="btn btn-ghost btn-circle btn-sm md:hidden"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </button>

          <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
            <div className="w-10 md:w-12 rounded-full">
              <img
                src={
                  selectedUser.profilepic
                    ? `${serverUrl}${selectedUser.profilepic}`
                    : `https://placehold.co/600x600/E5E7EB/333333?text=${displayName?.charAt(0) || '?'}`
                }
                alt={`${displayName} avatar`}
              />
            </div>
          </div>

          <div className="min-w-0">
            <span className="font-bold text-sm md:text-lg block truncate max-w-[150px] md:max-w-none">
              {displayName}
            </span>
            <p className="text-xs text-base-content/60">
              {isGroup 
                ? `${selectedUser.memberCount || ''} thành viên`
                : (isOnline ? 'Đang hoạt động' : 'Không hoạt động')
              }
            </p>
          </div>
        </div>

        <div className="flex gap-1 md:gap-2">
          <button className="btn btn-ghost btn-circle btn-sm md:btn-md">
            <Phone size={18} className="md:w-5 md:h-5" />
          </button>
          <button className="btn btn-ghost btn-circle btn-sm md:btn-md hidden sm:flex">
            <Video size={18} className="md:w-5 md:h-5" />
          </button>
          <button className="btn btn-ghost btn-circle btn-sm md:btn-md hidden sm:flex">
            <Info size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="divider m-0"></div>

      {/* Messages area */}
      <div className="grow overflow-y-auto p-2 md:p-4 bg-base-200">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-base-content/60 text-center px-4">
              Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          <>
            <Messages 
              messages={messages} 
              onReply={handleReply}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-2 md:p-4 bg-base-100">
        <MessageInput 
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  )
}

export default MessageContainer