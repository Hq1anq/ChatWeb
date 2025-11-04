import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

const MessageInput = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === '') return; // Không gửi tin nhắn rỗng

    console.log('Gửi tin nhắn:', message);
    setMessage(''); // Xoá nội dung input sau khi gửi
    // TODO: Thêm logic gửi tin nhắn (qua API hoặc Socket)
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {/* Nút đính kèm file */}
      <button type="button" className="btn btn-ghost btn-circle">
        <Paperclip size={20} />
      </button>

      {/* Ô nhập liệu */}
      <input
        type="text"
        placeholder="Nhập tin nhắn..."
        className="input input-bordered w-full"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Nút gửi - SỬA LỖI: Thêm dấu = vào (type="submit") */}
      <button type="submit" className="btn btn-primary btn-circle">
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;

