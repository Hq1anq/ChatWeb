import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserCircle, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear errors khi user bắt đầu nhập
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setValidationError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    const result = await signup({
      fullName: formData.fullName,
      username: formData.username,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/'); // Chuyển về trang home sau khi đăng ký thành công
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">
            Tạo tài khoản
          </h2>

          {/* Hiển thị thông báo lỗi */}
          {displayError && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={20} />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Trường Họ và Tên */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Họ và Tên</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <UserCircle size={16} />
                <input
                  type="text"
                  name="fullName"
                  className="grow"
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {/* Trường Tên đăng nhập */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Tên đăng nhập</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <User size={16} />
                <input
                  type="text"
                  name="username"
                  className="grow"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {/* Trường Mật khẩu */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Mật khẩu</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <Lock size={16} />
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

            {/* Trường Xác nhận Mật khẩu */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Xác nhận Mật khẩu</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <Lock size={16} />
                <input
                  type="password"
                  name="confirmPassword"
                  className="grow"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </label>
            </div>

            {/* Nút Đăng ký */}
            <div className="form-control mt-6">
              <button 
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </div>
          </form>

          {/* Link chuyển sang trang Đăng nhập */}
          <p className="text-center text-sm mt-4">
            Đã có tài khoản?{' '}
            <Link to="/login" className="link link-primary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;