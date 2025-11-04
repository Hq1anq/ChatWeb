import React from 'react';
import Sidebar from '../components/Sidebar';
import MessageContainer from '../components/MessageContainer';
import { useAuthStore } from '../store/authStore';

const HomePage = () => {
  const { user } = useAuthStore(); // Lấy thông tin user đã đăng nhập

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-base-100'>
      {/* Sidebar - Có thể truyền user xuống */}
      <div className='w-full sm:w-1/3 md:w-1/4 lg:w-1/5'>
        <Sidebar user={user} />
      </div>

      <div className="divider divider-horizontal hidden sm:flex m-0 p-0"></div>

      {/* MessageContainer - Có thể truyền user xuống */}
      <div className='grow h-full'>
        <MessageContainer user={user} />
      </div>
    </div>
  );
};

export default HomePage;