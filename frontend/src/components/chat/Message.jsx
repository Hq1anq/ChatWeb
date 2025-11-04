import React from 'react';

const Message = ({ fromMe, text, time }) => {
  // Xác định vị trí và màu sắc dựa trên fromMe
  const alignment = fromMe ? 'chat-end' : 'chat-start';
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary';

  return (
    <div className={`chat ${alignment}`}>
      {/* Avatar (hiển thị cho tin nhắn đến) */}
      {!fromMe && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img alt="User avatar" src="https://placehold.co/600x600/E5E7EB/333333?text=A" />
          </div>
        </div>
      )}

      {/* Bong bóng chat */}
      <div className={`chat-bubble ${bubbleColor}`}>
        {text}
      </div>

      {/* Thời gian */}
      <div className="chat-footer opacity-50 text-xs mt-1">
        {time}
      </div>
    </div>
  );
};

export default Message;
