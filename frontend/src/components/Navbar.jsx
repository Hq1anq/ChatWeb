import { Link, useNavigate } from 'react-router-dom'
import { Bell, Settings, User, LogOut, MessageSquareText } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { useChatStore } from '../store/chatStore' // Import chatStore để clear tin nhắn
import { formatTimeAgo } from '../lib/utils'

const Navbar = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    reset: resetNotifications // Đổi tên hàm reset để dùng
  } = useNotificationStore();

  const { user, logout } = useAuthStore()
  const { clearMessages, setSelectedUser } = useChatStore() // Lấy hàm clear tin nhắn
  const navigate = useNavigate()

  useEffect(() => {
    // Chỉ fetch và subscribe nếu có user (đã đăng nhập)
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
    // Cleanup khi unmount hoặc user thay đổi
    return () => unsubscribeFromNotifications();
  }, [user]); // Thêm user vào dependency để chạy lại khi login/logout

  const handleLogout = () => {
    // 1. Xóa dữ liệu các store
    resetNotifications();
    clearMessages();

    // 2. Gọi hàm logout của auth
    logout();

    // 3. Chuyển hướng
    navigate('/login');
  }

  const handleNotificationClick = (notif) => {
      // Đánh dấu đã đọc
      if (!notif.is_read) markAsRead(notif.notif_id);

      // Chuyển hướng vào nhóm
      if (notif.group_id) {
          // Tạo object group giả lập từ thông tin notification để ChatStore nhận diện
          const groupData = {
              groupid: notif.group_id,
              name: notif.groupName, // Tên nhóm lấy từ API getByUser
              group_pic: notif.groupPic // Ảnh nhóm lấy từ API getByUser (đã sửa ở bước 1)
          };
          setSelectedUser(groupData);
      }
      
      // Nếu sau này có thông báo chat riêng, xử lý else ở đây...
  };


  return (
    <div className="navbar justify-between px-4 bg-base-300 shadow-lg sticky top-0 z-50 border-b-2 border-b-gray-500">
      {/* Tên ứng dụng */}
      <Link to="/" className="btn btn-ghost text-2xl font-bold text-primary">
        <MessageSquareText size={28} className="mr-2" />
        ChatApp
      </Link>

      {/* Khu vực bên phải */}
      <div className="flex gap-2 items-center">
        {/* Theme Toggle: Luôn hiển thị */}
        <ThemeToggle />

        {/* CHỈ HIỂN THỊ CÁC MỤC SAU NẾU ĐÃ ĐĂNG NHẬP (user tồn tại) */}
        {user && (
          <>
            {/* --- PHẦN THÔNG BÁO --- */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="badge badge-sm badge-error indicator-item text-white border-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-0 max-h-[400px] overflow-y-auto">
                  <div className="p-3 border-b border-base-200 font-bold bg-base-200/50 sticky top-0 backdrop-blur-sm">
                    Thông báo
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-base-content/60 flex flex-col items-center gap-2">
                      <Bell size={32} className="opacity-20" />
                      <p>Không có thông báo mới</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.notif_id} 
                          onClick={() => handleNotificationClick(notif)} // <--- 4. Gọi hàm click mới
                          className={`flex gap-3 p-3 hover:bg-base-200 cursor-pointer transition-colors border-b border-base-100 last:border-0 
                            ${!notif.is_read ? 'bg-blue-50/10' : ''}`}
                        >
                          <div className="avatar placeholder">
                            <div className="w-10 h-10 rounded-full border border-base-300">
                              <img
                                src={
                                  notif.senderPic
                                    ? `${import.meta.env.VITE_SERVER_URL}${notif.senderPic}`
                                    : `https://placehold.co/600x600/E5E7EB/333333?text=${notif.senderName?.charAt(0).toUpperCase() || '?'}`
                                }
                                alt="Sender"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm break-words"><span className="font-bold">{notif.senderName}</span> {notif.content}</p>
                            <p className="text-xs text-base-content/50 mt-1">{formatTimeAgo(notif.created_at)}</p>
                          </div>
                          {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- USER DROPDOWN --- */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full flex items-center justify-center border border-base-300">
                  <img
                    alt="User Avatar"
                    src={user.profilepic ? `${import.meta.env.VITE_SERVER_URL}${user.profilepic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${user.fullname?.charAt(0)}`}
                  />
                </div>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                <li className="p-2 font-semibold text-center bg-base-200/50 rounded-lg mb-1">
                  {user.fullname}
                </li>
                <div className="divider m-0"></div>
                <li><Link to="/profile"><User size={16} /> Hồ sơ</Link></li>
                <li><Link to="/settings"><Settings size={16} /> Cài đặt</Link></li>
                <li><button onClick={handleLogout} className="text-error"><LogOut size={16} /> Đăng xuất</button></li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar
