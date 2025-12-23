import { useEffect, useState } from 'react'
import { X, Search, Users, MessageSquare, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { formatTimeAgo, getProfilePic } from '../lib/utils'
import CreateGroupModal from './group/CreateGroupModal' // Đảm bảo đã import file bạn tạo ở bước trước

// Component hiển thị Item (dùng chung cho cả User và Group)
const SidebarItem = ({ item, isSelected, isOnline, onClick, isGroup }) => {
  const { user } = useAuthStore();
  const imageSrc = isGroup 
    ? (item.group_pic || "https://placehold.co/600x600/2563EB/FFFFFF?text=G")
    : getProfilePic(item);
  
  const name = isGroup ? item.name : item.fullname;

  let previewText = item.latestMessage || 'Bắt đầu trò chuyện...';
  
  if (isGroup && item.latestMessage) {
      // Kiểm tra xem ai là người gửi tin nhắn cuối
      const isMe = item.latestSenderId === user?.userid;
      // Nếu là tôi: "Bạn: Hello"
      // Nếu là người khác: "Alice: Hello"
      const senderName = isMe ? "Bạn" : (item.latestSenderName || "Thành viên");
      previewText = `${senderName}: ${item.latestMessage}`;
  }
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 items-center p-3 rounded-lg transition-colors
        ${isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-300 cursor-pointer'}`}
    >
      <div className={`avatar shrink-0 ${!isGroup && (isOnline ? 'online' : 'offline')}`}>
        <div className="relative mx-auto lg:mx-0">
          <img
            className={`size-12 object-cover rounded-full ${
              !isGroup && isOnline
                ? 'mask-exclude mask-[radial-gradient(circle_7px_at_calc(100%-6px)_calc(100%-6px),transparent_7px,black_9px)]'
                : ''
            }`}
            src={imageSrc}
            alt={name}
          />
          {!isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
          )}
        </div>
      </div>

      <div className="flex-1 relative min-w-0">
        <h3 className={`font-semibold truncate pr-12 ${isSelected ? 'text-white' : 'text-base-content'}`}>
          {name}
        </h3>
        {item.latestTime && (
          <span className={`absolute top-0 right-0 text-xs ${isSelected ? 'text-white/70' : 'text-base-content/60'}`}>
            {formatTimeAgo(item.latestTime)}
          </span>
        )}
        <p className={`text-sm truncate ${isSelected ? 'text-white/80' : 'text-base-content/70'}`}>
          {previewText} {/* Sửa: Dùng biến previewText đã xử lý ở trên */}
        </p>
      </div>
    </div>
  )
}

const Sidebar = () => {
  const { onlineUsers } = useAuthStore()
  const {
    getUsers, users, isUsersLoading,
    getGroups, groups, isGroupsLoading, // Lấy groups từ store
    selectedUser, setSelectedUser, closeSidebar,
  } = useChatStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('chats') // 'chats' | 'groups'
  const [isModalOpen, setIsModalOpen] = useState(false) // State cho Modal tạo nhóm

  // Lấy dữ liệu khi mount
  useEffect(() => {
    getUsers()
    getGroups()
  }, [])

  // Filter Logic
  const filteredUsers = users.filter((user) =>
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full w-72 flex flex-col bg-base-200 border-r border-base-300">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Đoạn chat</h2>
          <div className="flex gap-2">
            {/* Nút tạo nhóm */}
             <button 
                className="btn btn-ghost btn-circle btn-sm"
                title="Tạo nhóm mới"
                onClick={() => setIsModalOpen(true)}
             >
                <Plus size={20} />
             </button>
             {/* Nút đóng sidebar (mobile) */}
            <button className="btn btn-ghost btn-circle btn-sm md:hidden" onClick={closeSidebar}>
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="input input-bordered w-full pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-base-300 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chats' ? 'bg-base-100 shadow text-primary' : 'hover:bg-base-200 text-base-content/60 cursor-pointer'}`}
            >
              <MessageSquare size={16} /> Tin nhắn
            </button>
            <button 
              onClick={() => setActiveTab('groups')}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'groups' ? 'bg-base-100 shadow text-primary' : 'hover:bg-base-200 text-base-content/60 cursor-pointer'}`}
            >
              <Users size={16} /> Nhóm
            </button>
        </div>
      </div>

      {/* List Container */}
      <div className="grow overflow-y-auto p-2">
        {/* === TAB CHATS === */}
        {activeTab === 'chats' && (
             isUsersLoading ? (
                <div className="flex justify-center py-8"><span className="loading loading-spinner"></span></div>
             ) : filteredUsers.length === 0 ? (
                <div className="text-center text-base-content/60 mt-8">Không tìm thấy người dùng</div>
             ) : (
                <div className="space-y-1">
                    {filteredUsers.map((user) => (
                        <SidebarItem
                            key={user.userid}
                            item={user}
                            isGroup={false}
                            isSelected={selectedUser?.userid === user.userid}
                            isOnline={onlineUsers.includes(user.userid.toString())}
                            onClick={() => setSelectedUser(user)}
                        />
                    ))}
                </div>
             )
        )}

        {/* === TAB GROUPS === */}
        {activeTab === 'groups' && (
             isGroupsLoading ? (
                <div className="flex justify-center py-8"><span className="loading loading-spinner"></span></div>
             ) : filteredGroups.length === 0 ? (
                <div className="text-center text-base-content/60 mt-8">Chưa tham gia nhóm nào</div>
             ) : (
                <div className="space-y-1">
                    {filteredGroups.map((group) => (
                        <SidebarItem
                            key={group.groupid}
                            item={group}
                            isGroup={true}
                            isSelected={selectedUser?.groupid === group.groupid}
                            isOnline={false} // Group không có online status
                            onClick={() => setSelectedUser(group)} // Set cả object group vào selectedUser
                        />
                    ))}
                </div>
             )
        )}
      </div>
      
      {/* Modal Tạo Nhóm */}
      <CreateGroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default Sidebar