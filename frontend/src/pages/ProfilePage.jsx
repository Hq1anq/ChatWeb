import { useState, useEffect, useRef } from 'react'
import { User, Mail, Edit2, Save, KeyRound, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { getProfilePic } from '../lib/utils'

const ProfilePage = () => {
  const {
    user,
    isUpdatingProfile,
    updateProfilePic,
    updateProfileBio,
    updatePassword,
  } = useAuthStore()

  // State cho phần thông tin cá nhân (Tên, Bio)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ fullname: '', bio: '' })

  // State cho phần đổi mật khẩu
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })

  // Ref để reset input file sau khi upload xong
  const fileInputRef = useRef(null)

  // Đồng bộ dữ liệu User từ Store vào Form khi trang vừa load
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  // --- 1. XỬ LÝ ẢNH & BIO ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const uploadData = new FormData()
      uploadData.append('profilepic', file)
      // Gọi hàm update trong store
      await updateProfilePic(uploadData)
    } catch (error) {
      console.error(error)
    } finally {
      // Reset input file để có thể chọn lại cùng 1 ảnh nếu muốn
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    // Gọi API update Bio
    const result = await updateProfileBio({ bio: formData.bio })

    // Nếu thành công thì tắt chế độ chỉnh sửa
    if (result.success) setIsEditing(false)
  }

  // --- 2. XỬ LÝ ĐỔI MẬT KHẨU ---
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleUpdatePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return toast.error('Vui lòng nhập đầy đủ mật khẩu')
    }

    const result = await updatePassword(passwords)

    if (result.success) {
      // Reset form mật khẩu sau khi thành công
      setPasswords({ currentPassword: '', newPassword: '' })
    }
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* CARD 1: THÔNG TIN CÁ NHÂN */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Hồ sơ của bạn</h2>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="avatar mb-4">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={getProfilePic(user)}
                    alt="User Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <label
                className={`btn btn-sm btn-outline btn-primary cursor-pointer ${
                  isUpdatingProfile ? 'btn-disabled opacity-50' : ''
                }`}
              >
                {isUpdatingProfile ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Edit2 size={14} />
                )}
                <span>
                  {isUpdatingProfile ? 'Đang tải...' : 'Thay đổi Avatar'}
                </span>

                {/* Input file ẩn, được kích hoạt khi bấm vào label */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            {/* Form Info */}
            <div className="space-y-4">
              {/* Tên hiển thị */}
              <label className="input input-bordered flex items-center gap-2">
                <User size={18} />
                <input
                  type="text"
                  name="fullname"
                  className="grow"
                  placeholder="Tên của bạn"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  disabled={!isEditing} // Chỉ sửa được khi bấm nút Chỉnh sửa
                />
              </label>

              {/* Email (Read-only) */}
              <label className="input input-bordered flex items-center gap-2 opacity-70 cursor-not-allowed bg-base-200">
                <Mail size={18} />
                <input
                  type="email"
                  className="grow cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
              </label>

              {/* Bio (Textarea) */}
              <div className="form-control">
                <textarea
                  name="bio"
                  className="textarea textarea-bordered w-full h-24 text-base leading-normal"
                  placeholder="Giới thiệu về bạn..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                ></textarea>
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {formData.bio.length}/500 ký tự
                  </span>
                </div>
              </div>
            </div>

            {/* Nút Chỉnh sửa / Lưu */}
            <div className="card-actions justify-end mt-6">
              {isEditing ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Save size={18} />
                  )}
                  Lưu thay đổi
                </button>
              ) : (
                <button
                  className="btn btn-outline btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: ĐỔI MẬT KHẨU */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Đổi mật khẩu</h2>

            {/* Mật khẩu cũ */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Mật khẩu hiện tại
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <KeyRound size={18} className="text-base-content/50" />
                <input
                  type="password"
                  name="currentPassword"
                  className="grow"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                />
              </label>
            </div>

            {/* Mật khẩu mới */}
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text font-medium">Mật khẩu mới</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <KeyRound size={18} className="text-base-content/50" />
                <input
                  type="password"
                  name="newPassword"
                  className="grow"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                />
              </label>
            </div>

            {/* Nút Đổi mật khẩu */}
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleUpdatePassword}
                disabled={
                  isUpdatingProfile ||
                  !passwords.currentPassword ||
                  !passwords.newPassword
                }
              >
                {isUpdatingProfile ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  'Đổi mật khẩu'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
