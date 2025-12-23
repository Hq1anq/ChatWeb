import Sidebar from '../components/Sidebar'
import MessageContainer from '../components/MessageContainer'
import { useChatStore } from '../store/chatStore'

const HomePage = () => {
  const { isSidebarOpen, closeSidebar, selectedUser } = useChatStore()

  return (
    <div className="flex h-full w-full bg-base-100 relative overflow-hidden">
      {/* Overlay cho mobile khi sidebar mở */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-30 h-full
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <Sidebar />
      </div>

      {/* Divider - ẩn trên mobile */}
      <div className="divider divider-horizontal hidden md:flex m-0 p-0"></div>

      {/* Message Container */}
      <div className="flex-1 min-w-0 w-full">
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage
















































