import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, UserCircle, Lock } from 'lucide-react';

const SignUpPage = () => {
  // Sử dụng state để lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Hàm xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Hàm xử lý khi submit form (hiện tại chỉ log ra console)
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Thêm logic validate (ví dụ: password === confirmPassword)
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    console.log('Dữ liệu đăng ký:', formData);
    // TODO: Thêm logic gọi API đăng ký ở đây
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold">
            Tạo tài khoản
          </h2>

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
                  placeholder="Nhâp tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
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
                  required
                />
              </label>
            </div>

            {/* Nút Đăng ký */}
            <div className="form-control mt-6">
              <button className="btn btn-primary w-full">Đăng ký</button>
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
