import React from 'react';
import { Search, LogOut } from 'lucide-react';

// Component mẫu cho một cuộc trò chuyện
const Conversation = ({ name, lastMessage, isSelected }) => (
  <div
    className={`flex gap-3 items-center p-3 rounded-lg cursor-pointer transition-colors
      ${isSelected ? 'bg-primary text-primary-content' : 'hover:bg-base-300'}`}
  >
    {/* Avatar placeholder */}
    <div className="avatar online">
      <div className="w-12 rounded-full">
        <img src={`https://placehold.co/600x600/E5E7EB/333333?text=${name.charAt(0)}`} alt="User avatar" />
      </div>
    </div>

    {/* Thông tin */}
    <div className="grow">
      <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-base-content'}`}>{name}</h3>
      <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-base-content/70'}`}>{lastMessage}</p>
    </div>
  </div>
);

const Sidebar = () => {
  // TODO: Thêm logic đăng xuất
  const handleLogout = () => {
    console.log('Đăng xuất...');
  };

  return (
    <div className="h-full flex flex-col bg-base-200 p-4">
      {/* Thanh tìm kiếm */}
      <form className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary btn-square">
          <Search size={20} />
        </button>
      </form>

      {/* Đường kẻ ngang */}
      <div className="divider m-0"></div>

      {/* Danh sách cuộc trò chuyện */}
      <div className="grow overflow-y-auto py-2 pr-2 -mr-2">
        {/* Đây là dữ liệu mẫu. Bạn sẽ thay thế bằng vòng lặp từ state */}
        <Conversation
          name="Alice"
          lastMessage="Ok, hẹn gặp lại!"
          isSelected={true}
        />
        <Conversation
          name="Bob"
          lastMessage="Bạn đang làm gì vậy?"
          isSelected={false}
        />
        <Conversation
          name="Charlie"
          lastMessage="Tối nay đi chơi không?"
          isSelected={false}
        />
      </div>
    </div>
  );
};

export default Sidebar;
