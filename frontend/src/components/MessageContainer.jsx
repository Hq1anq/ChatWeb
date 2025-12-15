import { useEffect, useRef } from 'react'
import Messages from './chat/Messages.jsx'
import MessageInput from './chat/MessageInput.jsx'
import { Phone, Video, Info, Menu, ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Messages from './chat/Messages.jsx'
import MessageInput from './chat/MessageInput.jsx'
import GroupSettings from './group/GroupSettings.jsx' // Component bạn đã tạo
import { Phone, Video, Info, Menu, ArrowLeft, Settings } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'

const MessageContainer = () => {
  const {
    selectedUser, // Bây giờ có thể là User hoặc Group Object
    getMessages, messages, isLoadingMessages,
    onMessage, offMessage, openSidebar, setSelectedUser, getGroupMembers,
  } = useChatStore()
  
  const { onlineUsers } = useAuthStore()
  const messagesEndRef = useRef(null)
  
  // State để toggle panel cài đặt nhóm
  const [showGroupSettings, setShowGroupSettings] = useState(false)

  // Kiểm tra xem đang chọn group hay user
  const isGroup = selectedUser?.groupid !== undefined
  const chatId = isGroup ? selectedUser?.groupid : selectedUser?.userid

  useEffect(() => {
    if (!chatId) return
    
    // Gọi hàm getMessages với tham số isGroup
    getMessages(chatId, isGroup)

    if (isGroup) {
        getGroupMembers(chatId);
    }
    
    onMessage()
    // Reset state settings khi chuyển chat
    setShowGroupSettings(false) 

    return () => offMessage()
  }, [chatId, isGroup, getMessages, onMessage, offMessage, getGroupMembers])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleBack = () => {
    setSelectedUser(null)
    openSidebar()
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full relative">
        <button className="btn btn-ghost btn-circle md:hidden absolute top-4 left-4" onClick={openSidebar}>
          <Menu size={24} />
        </button>
        <div className="text-center px-4">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg md:text-xl text-base-content/60">Hãy chọn cuộc trò chuyện</p>
        </div>
      </div>
    )
  }

  // Logic hiển thị Header
  const isOnline = !isGroup && onlineUsers.includes(chatId.toString())
  const chatName = isGroup ? selectedUser.name : selectedUser.fullname
  const chatAvatar = isGroup 
    ? (selectedUser.group_pic || "https://placehold.co/600x600/2563EB/FFFFFF?text=G")
    : (selectedUser.profilepic ? `${import.meta.env.VITE_SERVER_URL}${selectedUser.profilepic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${selectedUser.fullname.charAt(0)}`)

  return (
    <div className="flex h-full w-full">
        <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between p-2 md:p-4 shadow-sm bg-base-100 border-b border-base-300">
                <div className="flex items-center gap-2 md:gap-3">
                    <button className="btn btn-ghost btn-circle btn-sm md:hidden" onClick={handleBack}><ArrowLeft size={20} /></button>
                    <div className={`avatar ${isOnline ? 'online' : ''}`}>
                        <div className="w-10 md:w-12 rounded-full"><img src={chatAvatar} alt={chatName} /></div>
                    </div>
                    <div className="min-w-0">
                        <span className="font-bold text-sm md:text-lg block truncate">{chatName}</span>
                        <p className="text-xs text-base-content/60">{isGroup ? `${selectedUser.members?.length || '3'} thành viên` : (isOnline ? 'Online' : 'Offline')}</p>
                    </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                    {isGroup ? (
                        <button className={`btn btn-circle btn-sm md:btn-md ${showGroupSettings ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowGroupSettings(!showGroupSettings)}>
                            <Settings size={18} className="md:w-5 md:h-5" />
                        </button>
                    ) : (
                        <button className="btn btn-ghost btn-circle btn-sm md:btn-md"><Info size={18} /></button>
                    )}
                </div>
            </div>

            {/* Messages */}
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

            {/* Input */}
            <div className="p-2 md:p-4 bg-base-100">
                <MessageInput />
            </div>
        </div>

        {isGroup && showGroupSettings && (
             <div className="hidden lg:block h-full border-l border-base-300">
                <GroupSettings onClose={() => setShowGroupSettings(false)} />
             </div>
        )}
    </div>
  )
}

export default MessageContainer