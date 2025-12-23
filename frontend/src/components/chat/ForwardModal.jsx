import { useState } from 'react'
import { X, Search, Send, Users, User } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import axiosInstance from '../../lib/axios'
import toast from 'react-hot-toast'

const ForwardModal = ({ message, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTargets, setSelectedTargets] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [isForwarding, setIsForwarding] = useState(false)

  const { users, groups } = useChatStore()
  const { user: currentUser } = useAuthStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  // Lọc danh sách theo search query
  const filteredUsers = (users || [])
    .filter(u => u.userid !== currentUser?.userid)
    .filter(u => u.fullname?.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredGroups = (groups || [])
    .filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  // Toggle chọn target
  const toggleTarget = (target, type) => {
    const targetId = type === 'user' ? `user-${target.userid}` : `group-${target.groupid}`
    
    setSelectedTargets(prev => {
      const exists = prev.find(t => t.id === targetId)
      if (exists) {
        return prev.filter(t => t.id !== targetId)
      } else {
        return [...prev, { 
          id: targetId, 
          type, 
          data: target,
          name: type === 'user' ? target.fullname : target.name
        }]
      }
    })
  }

  // Kiểm tra target đã được chọn chưa
  const isSelected = (target, type) => {
    const targetId = type === 'user' ? `user-${target.userid}` : `group-${target.groupid}`
    return selectedTargets.some(t => t.id === targetId)
  }

  // Xử lý chuyển tiếp
  const handleForward = async () => {
    if (selectedTargets.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người hoặc nhóm')
      return
    }

    setIsForwarding(true)

    try {
      const originalMessageId = message.messageid

      // Chuyển tiếp đến từng target
      for (const target of selectedTargets) {
        const receiverId = target.type === 'user' ? target.data.userid : target.data.groupid
        
        await axiosInstance.post(`/message/forward/${receiverId}`, {
          originalMessageId,
          isGroup: target.type === 'group'
        })
      }

      toast.success(`Đã chuyển tiếp đến ${selectedTargets.length} người/nhóm`)
      onClose()
    } catch (error) {
      console.error('Lỗi chuyển tiếp:', error)
      toast.error('Không thể chuyển tiếp tin nhắn')
    } finally {
      setIsForwarding(false)
    }
  }

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-bold">Chuyển tiếp tin nhắn</h3>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-3 bg-base-200 mx-4 mt-4 rounded-lg">
          <p className="text-xs text-base-content/50 mb-1">Tin nhắn:</p>
          <p className="text-sm">
            {message.content 
              ? truncateText(message.content) 
              : (message.file ? '📎 File đính kèm' : 'Tin nhắn')}
          </p>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              placeholder="Tìm kiếm người hoặc nhóm..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300 px-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-base-content/60 hover:text-base-content'
            }`}
          >
            <User size={16} />
            Người dùng ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'groups' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-base-content/60 hover:text-base-content'
            }`}
          >
            <Users size={16} />
            Nhóm ({filteredGroups.length})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'users' && (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-base-content/50 py-4">Không tìm thấy người dùng</p>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.userid}
                    onClick={() => toggleTarget(user, 'user')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected(user, 'user') 
                        ? 'bg-primary/20 border border-primary' 
                        : 'bg-base-200 hover:bg-base-300'
                    }`}
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img 
                          src={user.profilepic 
                            ? `${serverUrl}${user.profilepic}` 
                            : `https://placehold.co/100x100/E5E7EB/333333?text=${user.fullname?.charAt(0) || '?'}`
                          } 
                          alt={user.fullname}
                        />
                      </div>
                    </div>
                    <span className="font-medium flex-1">{user.fullname}</span>
                    {isSelected(user, 'user') && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-content text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-2">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-base-content/50 py-4">Không tìm thấy nhóm</p>
              ) : (
                filteredGroups.map(group => (
                  <div
                    key={group.groupid}
                    onClick={() => toggleTarget(group, 'group')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected(group, 'group') 
                        ? 'bg-primary/20 border border-primary' 
                        : 'bg-base-200 hover:bg-base-300'
                    }`}
                  >
                    <div className="avatar placeholder">
                      <div className="w-10 rounded-full bg-neutral text-neutral-content">
                        <Users size={20} />
                      </div>
                    </div>
                    <span className="font-medium flex-1">{group.name}</span>
                    {isSelected(group, 'group') && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-content text-xs">✓</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected targets */}
        {selectedTargets.length > 0 && (
          <div className="p-3 bg-base-200 mx-4 mb-2 rounded-lg">
            <p className="text-xs text-base-content/50 mb-2">
              Đã chọn ({selectedTargets.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTargets.map(target => (
                <span 
                  key={target.id}
                  className="badge badge-primary gap-1"
                >
                  {target.name}
                  <X 
                    size={12} 
                    className="cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTargets(prev => prev.filter(t => t.id !== target.id))
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={handleForward}
            disabled={selectedTargets.length === 0 || isForwarding}
            className="btn btn-primary w-full"
          >
            {isForwarding ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Đang chuyển tiếp...
              </>
            ) : (
              <>
                <Send size={18} />
                Chuyển tiếp {selectedTargets.length > 0 && `(${selectedTargets.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForwardModal