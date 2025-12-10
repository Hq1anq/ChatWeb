import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    if (!selectedUser?.userid) return
    getMessages(selectedUser.userid)
    onMessage()
    return () => offMessage()
  }, [selectedUser?.userid])

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Hàm quay lại danh sách chat (mobile)
  const handleBack = () => {
    setSelectedUser(null)
    openSidebar()
  }

  if (!selectedUser) {
    // Hiển thị khi chưa chọn cuộc trò chuyện
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full relative">
        {/* Nút mở sidebar trên mobile khi chưa chọn chat */}
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

  const isOnline = onlineUsers.includes(selectedUser.userid.toString())

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header của khung chat */}
      <div className="flex items-center justify-between p-2 md:p-4 shadow-sm bg-base-100">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Nút Back trên mobile */}
          <button
            className="btn btn-ghost btn-circle btn-sm md:hidden"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar với online status */}
          <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
            <div className="w-10 md:w-12 rounded-full">
              <img
                src={
                  selectedUser.profilepic
                    ? `${import.meta.env.VITE_SERVER_URL}${selectedUser.profilepic}`
                    : `https://placehold.co/600x600/E5E7EB/333333?text=${selectedUser.fullname.charAt(0)}`
                }
                alt={`${selectedUser.fullname} avatar`}
              />
            </div>
          </div>

          <div className="min-w-0">
            <span className="font-bold text-sm md:text-lg block truncate max-w-[150px] md:max-w-none">
              {selectedUser.fullname}
            </span>
            <p className="text-xs text-base-content/60">
              {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </p>
          </div>
        </div>

        {/* Các nút hành động */}
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

      {/* Đường kẻ ngang */}
      <div className="divider m-0"></div>

      {/* Khu vực hiển thị tin nhắn */}
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
            <Messages messages={messages} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Khu vực nhập tin nhắn */}
      <div className="p-2 md:p-4 bg-base-100">
        <MessageInput />
      </div>
    </div>
  )
}

export default MessageContainer