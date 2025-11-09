import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  // 1. Lấy theme từ localStorage hoặc mặc định là 'light'
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // 2. Sử dụng useEffect để cập nhật <html> và localStorage khi 'theme' thay đổi
  useEffect(() => {
    // Cập nhật thuộc tính data-theme trên thẻ <html>
    document.documentElement.setAttribute('data-theme', theme);
    // Lưu giá trị theme mới vào localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Effect này sẽ chạy mỗi khi state 'theme' thay đổi

  // 3. Hàm xử lý khi nhấn nút
  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    
    <label className="swap swap-rotate btn btn-ghost btn-circle">
      {/* dùng 1 checkbox ẩn để quản lý trạng thái 
        'checked' (tương ứng với 'dark' mode) 
      */}
      <input
        type="checkbox"
        onChange={handleToggle}
        checked={theme === 'dark'}
      />
      
      {/* Icon mặt trời (hiển thị khi 'light' mode) */}
      <Sun size={20} className="swap-off fill-current" />
      
      {/* Icon mặt trăng (hiển thị khi 'dark' mode) */}
      <Moon size={20} className="swap-on fill-current" />
    </label>
  );
};

export default ThemeToggle;