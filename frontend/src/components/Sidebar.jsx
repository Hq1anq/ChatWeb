import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { formatTimeAgo } from '../lib/utils'

// Component một cuộc trò chuyện
const Conversation = ({ user, isSelected, onlineUsers, onClick }) => {
  // Kiểm tra user có online không
  const isOnline = onlineUsers.includes(user.userid.toString())

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 items-center p-3 rounded-lg cursor-pointer transition-colors
        ${
          isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
        }`}
    >
      {/* Avatar với status online/offline */}
      <div className={`avatar shrink-0 ${isOnline ? 'online' : 'offline'}`}>
        <div className="relative mx-auto lg:mx-0">
          <img
            className={`size-12 object-cover rounded-full ${
              isOnline
                ? 'mask-exclude mask-[radial-gradient(circle_7px_at_calc(100%-6px)_calc(100%-6px),transparent_7px,black_9px)]'
                : ''
            }`}
            src={
              user.profilepic
                ? `${import.meta.env.VITE_SERVER_URL}${user.profilepic}`
                : `https://placehold.co/600x600/E5E7EB/333333?text=${user.fullname.charAt(
                    0
                  )}`
            }
            alt={`${user.fullname} avatar`}
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
          )}
        </div>
      </div>

      {/* Thông tin */}
      <div className="flex-1 relative min-w-0">
        <h3
          className={`font-semibold ${
            isSelected ? 'text-white' : 'text-base-content'
          }`}
        >
          {user.fullname}
        </h3>

        {/* timestamp on top right */}
        {user.latestTime && (
          <span
            className={`absolute top-0 right-0 text-xs ${
              isSelected ? 'text-white/70' : 'text-base-content/60'
            }`}
          >
            {formatTimeAgo(user.latestTime)}
          </span>
        )}

        <p
          className={`text-sm truncate ${
            isSelected ? 'text-white/80' : 'text-base-content/70'
          }`}
        >
          {user.latestMessage}
        </p>
      </div>
    </div>
  )
}

const Sidebar = () => {
  const { onlineUsers } = useAuthStore()
  const { getUsers, users, isUsersLoading, selectedUser, setSelectedUser } =
    useChatStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Lấy list cho lần đầu render
  useEffect(() => {
    getUsers()
  }, [])

  // Lọc users theo search term
  const filteredUsers = users.filter((user) =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (e) => {
    e.preventDefault()
    // Search được xử lý tự động qua filteredUsers
  }

  return (
    <div className="h-full w-72 flex flex-col bg-base-200 p-4">
      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      {/* Đường kẻ ngang */}
      <div className="divider m-0"></div>

      {/* Danh sách cuộc trò chuyện */}
      <div className="grow overflow-y-auto py-2 pr-2 -mr-2">
        {isUsersLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-base-content/60 mt-8">
            Không tìm thấy người dùng
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Conversation
              key={user.userid}
              user={user}
              isSelected={selectedUser?.userid === user.userid}
              onlineUsers={onlineUsers}
              onClick={() => setSelectedUser(user)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar
