import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dữ liệu đăng nhập:', formData);
    // TODO: Thêm logic gọi API đăng nhập ở đây
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100 p-8"> {/* Thêm padding cho card */}
        <div className="card-body p-0"> {/* Loại bỏ padding mặc định của card-body nếu cần */}
          <h2 className="card-title justify-center text-3xl font-bold mb-6"> {/* Tăng cỡ chữ và margin-bottom */}
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4"> {/* Dùng flex-col và gap */}
            {/* Trường Tên đăng nhập */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tên đăng nhập</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <User size={18} /> {/* Tăng kích thước icon */}
                <input
                  type="text"
                  name="username"
                  className="grow"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {/* Trường Mật khẩu */}
            <div className="form-control"> {/* Loại bỏ mt-4 thừa nếu dùng gap */}
              <label className="label">
                <span className="label-text">Mật khẩu</span>
              </label>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <Lock size={18} /> {/* Tăng kích thước icon */}
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

            {/* Nút Đăng nhập */}
            <div className="form-control mt-6"> {/* Giữ mt-6 để tạo khoảng cách riêng cho nút */}
              <button className="btn btn-primary w-full">Đăng nhập</button> {/* Thêm w-full để nút chiếm toàn bộ chiều rộng */}
            </div>
          </form>

          {/* Link chuyển sang trang Đăng ký */}
          <p className="text-center text-sm mt-6"> {/* Tăng mt-4 thành mt-6 */}
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="link link-primary">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

