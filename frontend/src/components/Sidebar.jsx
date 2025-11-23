import { Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import axiosInstance from '../lib/axios'

// Component một cuộc trò chuyện
const Conversation = ({ user, isSelected, onlineUsers, onClick }) => {
  // Kiểm tra user có online không
  const isOnline = onlineUsers.includes(user.userid.toString())
  
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 items-center p-3 rounded-lg cursor-pointer transition-colors
        ${isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-300'}`}
    >
      {/* Avatar với status online/offline */}
      <div className={`avatar ${isOnline ? 'online' : 'offline'}`}>
        <div className="w-12 rounded-full">
          <img
            src={
              user.profilepic
                ? `${import.meta.env.VITE_SERVER_URL}${user.profilepic}`
                : `https://placehold.co/600x600/E5E7EB/333333?text=${user.fullname.charAt(0)}`
            }
            alt={`${user.fullname} avatar`}
          />
        </div>
      </div>

      {/* Thông tin */}
      <div className="grow">
        <h3
          className={`font-semibold ${
            isSelected ? 'text-white' : 'text-base-content'
          }`}
        >
          {user.fullname}
        </h3>
        <p
          className={`text-sm ${
            isSelected ? 'text-white/80' : 'text-base-content/70'
          }`}
        >
          {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
        </p>
      </div>
    </div>
  )
}

const Sidebar = ({ onSelectUser, selectedUserId }) => {
  const { onlineUsers } = useAuthStore()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch danh sách users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await axiosInstance.get('/message/users')
        setUsers(response.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
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
    <div className="h-full flex flex-col bg-base-200 p-4">
      {/* Thanh tìm kiếm */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-square">
          <Search size={20} />
        </button>
      </form>

      {/* Đường kẻ ngang */}
      <div className="divider m-0"></div>

      {/* Danh sách cuộc trò chuyện */}
      <div className="grow overflow-y-auto py-2 pr-2 -mr-2">
        {isLoading ? (
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
              isSelected={selectedUserId === user.userid}
              onlineUsers={onlineUsers}
              onClick={() => onSelectUser(user)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar