import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    // Clear error khi user bắt đầu nhập
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    login(formData)
    // const result = await login(formData)

    // if (result.success) {
    //   navigate('/') // Chuyển về trang home sau khi đăng nhập thành công
    // }
  }

  return (
    <div className="flex items-center justify-center h-full bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100 p-8">
        <div className="card-body p-0">
          <h2 className="card-title justify-center text-3xl font-bold mb-6">
            Đăng nhập
          </h2>

          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Trường Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <User size={18} />
                <input
                  type="text"
                  name="email"
                  className="grow"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {/* Trường Mật khẩu */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mật khẩu</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  className="grow"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {/* Nút Đăng nhập */}
            <div className="form-control mt-6">
              <button className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          {/* Link chuyển sang trang Đăng ký */}
          <p className="text-center text-sm mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="link link-primary">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
