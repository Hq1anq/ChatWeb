import React from 'react';
import Sidebar from '../components/Sidebar';
import MessageContainer from '../components/MessageContainer';

const HomePage = () => {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-base-100'>
      {/* Sidebar - Chiếm 1/3 không gian */}
      <div className='w-full sm:w-1/3 md:w-1/4 lg:w-1/5'>
        <Sidebar />
      </div>

      {/* Đường kẻ phân chia dọc (chỉ hiển thị trên màn hình sm trở lên) */}
      <div className="divider divider-horizontal hidden sm:flex m-0 p-0"></div>

      {/* Khung tin nhắn - Chiếm phần còn lại */}
      <div className='grow h-full'>
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;
