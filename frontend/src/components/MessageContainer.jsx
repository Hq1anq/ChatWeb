import React from 'react';
// Sửa lỗi: Thêm phần mở rộng .jsx để đảm bảo module resolution
import Messages from './chat/Messages.jsx';
import MessageInput from './chat/MessageInput.jsx';
import { Phone, Video, Info } from 'lucide-react';

const MessageContainer = () => {
  // Dữ liệu mẫu, sau này sẽ lấy từ state
  const selectedConversation = {
    name: 'Alice',
  };

  if (!selectedConversation) {
    // Hiển thị khi chưa chọn cuộc trò chuyện
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-base-content/60">
          Hãy chọn một cuộc trò chuyện để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header của khung chat */}
      <div className="flex items-center justify-between p-4 shadow-sm bg-base-100">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="avatar online">
            <div className="w-12 rounded-full">
              <img src={`https://placehold.co/600x600/E5E7EB/333333?text=A`} alt="User avatar" />
            </div>
          </div>
          <span className="font-bold text-lg">{selectedConversation.name}</span>
        </div>
        {/* Các nút hành động */}
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-circle">
            <Phone size={20} />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Video size={20} />
          </button>
          <button className="btn btn-ghost btn-circle">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Đường kẻ ngang */}
      <div className="divider m-0"></div>

      {/* Khu vực hiển thị tin nhắn */}
      <div className="grow overflow-y-auto p-4 bg-base-200">
        <Messages />
      </div>

      {/* Khu vực nhập tin nhắn */}
      <div className="p-4 bg-base-100">
        <MessageInput />
      </div>
    </div>
  );
};

export default MessageContainer;

