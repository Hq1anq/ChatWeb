import { useState } from 'react'
import { User, Mail, FileText, Edit2, Save, KeyRound } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, isUpdatingProfile, updateProfilePic } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('profilepic', file)

      const response = await updateProfilePic(formData)
      if (response.success) {
        console.log('Cập nhật ảnh đại diện thành công')
        toast.success('Cập nhật ảnh đại diện thành công')
      } else {
        console.error('Cập nhật ảnh đại diện thất bại:', response.error)
      }
    } catch (error) {
      console.log('Lỗi khi tải lên ảnh đại diện:', error)
      toast.error('Lỗi khi tải lên ảnh đại diện')
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Gọi API để cập nhật thông tin user
    console.log('Đã lưu thông tin:', user)
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Card thông tin cá nhân */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6">Hồ sơ của bạn</h2>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="avatar mb-4">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={
                      user.profilepic
                        ? `${import.meta.env.VITE_SERVER_URL}${user.profilepic}`
                        : '/avatar.avif'
                    }
                    alt="User Avatar"
                  />
                </div>
              </div>
              {/* TODO: Thêm chức năng thay đổi avatar */}
              <label className="btn btn-sm btn-outline btn-primary">
                <Edit2 size={14} /> Thay đổi Avatar
                <input
                  type="file"
                  id="avater-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            {/* Form thông tin */}
            <div className="space-y-4">
              {/* Tên */}
              <label className="input input-bordered flex items-center gap-2">
                <User size={18} />
                <input
                  type="text"
                  name="name"
                  className="grow"
                  placeholder="Tên của bạn"
                  value={user?.fullname || ''}
                  disabled={!isEditing}
                />
              </label>

              {/* Email */}
              <label className="input input-bordered flex items-center gap-2">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  className="grow"
                  placeholder="Email"
                  value={user?.email || ''}
                  disabled // Thường không cho đổi email
                />
              </label>

              {/* Bio */}
              <textarea
                name="bio"
                className="textarea textarea-bordered w-full h-24"
                placeholder="Giới thiệu về bạn..."
                value={user?.bio || ''}
                disabled={!isEditing}
              ></textarea>
            </div>

            {/* Nút điều khiển */}
            <div className="card-actions justify-end mt-6">
              {isEditing ? (
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={18} /> Lưu thay đổi
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

        {/* Card đổi mật khẩu */}
        <div className="card w-full bg-base-100 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Bảo mật</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mật khẩu cũ</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <KeyRound size={18} />
                <input
                  type="password"
                  className="grow"
                  placeholder="********"
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mật khẩu mới</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <KeyRound size={18} />
                <input
                  type="password"
                  className="grow"
                  placeholder="********"
                />
              </label>
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">Đổi mật khẩu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
