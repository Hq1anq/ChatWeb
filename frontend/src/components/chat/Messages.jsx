import React from 'react';
// Sửa lỗi: Thêm phần mở rộng .jsx để đảm bảo module resolution
import Message from './Message.jsx';

const Messages = () => {
  // Dữ liệu mẫu
  const messageData = [
    { id: 1, text: 'Chào bạn!', fromMe: false, time: '10:00 AM' },
    { id: 2, text: 'Chào, bạn khoẻ không?', fromMe: true, time: '10:01 AM' },
    { id: 3, text: 'Mình khoẻ, cảm ơn bạn. Còn bạn?', fromMe: false, time: '10:01 AM' },
    { id: 4, text: 'Mình cũng vậy. Đang làm gì đó?', fromMe: true, time: '10:02 AM' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Dùng vòng lặp để render các tin nhắn */}
      {messageData.map((msg) => (
        <Message
          key={msg.id}
          text={msg.text}
          fromMe={msg.fromMe}
          time={msg.time}
        />
      ))}
    </div>
  );
};

export default Messages;

