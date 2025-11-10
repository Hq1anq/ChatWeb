import { Link, useNavigate } from 'react-router-dom'
import { Bell, Settings, User, LogOut, MessageSquareText } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
// Giả sử bạn sẽ tạo store này
import { useAuthStore } from '../store/authStore'

const Navbar = () => {
  const navigate = useNavigate()
  // Giả sử bạn lấy user và hàm logout từ store
  const { user, logout } = useAuthStore()

  // Dùng dữ liệu mẫu
  // const user = {
  //   name: 'Username',
  //   avatar: 'https://placehold.co/100x100/A0A0A0/333333?text=U',
  // }

  const handleLogout = () => {
    console.log('Đăng xuất...')
    logout()
    navigate('/login')
  }

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      {/*Tên ứng dụng */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-2xl font-bold text-primary">
          <MessageSquareText size={28} className="mr-2" />
          ChatApp
        </Link>
      </div>

      {/*Icon và User Dropdown */}
      <div className="flex-none gap-2">
        {/* Theme Toggle Component */}
        <ThemeToggle />
        {/* Icon thông báo */}
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <Bell size={20} />
            {/* Hiển thị chấm đỏ nếu có thông báo mới */}
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>

        {/* Dropdown của User */}
        <div className="dropdown dropdown-end">
          {/* Nút kích hoạt dropdown (Avatar) */}
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full flex items-center justify-center">
              {user?.profilepic ? (
                <img alt="User Avatar" src={user.profilepic} />
              ) : (
                <User size={32} />
              )}
            </div>
          </label>

          {/* Nội dung menu dropdown */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li className="p-2 font-semibold">{user?.name}</li>
            <div className="divider m-0"></div>
            <li>
              <Link to="/profile">
                <User size={16} />
                Hồ sơ
              </Link>
            </li>
            <li>
              <Link to="/settings">
                <Settings size={16} />
                Cài đặt
              </Link>
            </li>
            <li>
              <button onClick={handleLogout}>
                <LogOut size={16} />
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
