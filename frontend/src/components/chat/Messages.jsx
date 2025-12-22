import { useRef, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import Message from './Message'

const isSameDay = (d1, d2) => {
    if (!d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getUTCDate() === date2.getUTCDate() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCFullYear() === date2.getUTCFullYear();
};

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return "Hôm nay";
    if (isSameDay(date, yesterday)) return "Hôm qua";
    
    return date.toLocaleDateString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric",
        timeZone: 'UTC' 
    });
};

const formatTime = (dateString, isTemp) => {
    const date = new Date(dateString)
    
    if (isTemp) {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        })
    }
    
    return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC' 
    })
}

// Hàm xác định trạng thái tin nhắn
// eslint-disable-next-line no-unused-vars
const getMessageStatus = (message, isLastMessage, selectedUser) => {
    // Nếu đang gửi
    if (message.isTemp) return 'sending'
    
    // Nếu đã được xem (cần backend hỗ trợ field 'seen' hoặc 'seenAt')
    if (message.seen || message.seenAt) return 'seen'
    
    // Nếu đã nhận (cần backend hỗ trợ field 'delivered' hoặc 'deliveredAt')
    if (message.delivered || message.deliveredAt) return 'delivered'
    
    // Mặc định là đã gửi
    return 'sent'
}

const Messages = ({ messages }) => {
  const { user } = useAuthStore()
  const { groupMembers, selectedUser } = useChatStore()
  const lastMessageRef = useRef()

  // eslint-disable-next-line no-unused-vars
  const highlightRegex = useMemo(() => {
    if (selectedUser?.groupid === undefined || !groupMembers.length) return null;
    const names = groupMembers.flatMap(m => [m.nickname, m.fullname]).filter(Boolean).map(name => name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length);
    if (names.length === 0) return null;
    return new RegExp(`(@(?:${names.join('|')}))(?![\\w])`, 'g');
  }, [groupMembers, selectedUser]);

  useEffect(() => { 
    setTimeout(() => { 
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' }) 
    }, 100) 
  }, [messages])

  return (
    <div className="flex flex-col gap-2 pb-2">
      {messages.map((message, index) => {
        const isNewDay = index === 0 || !isSameDay(message.created, messages[index - 1].created);
        const isLastMessage = index === messages.length - 1;
        const isFromMe = message.senderid === user?.userid;

        return (
          <div key={message.messageid || message.tempId || index} ref={index === messages.length - 1 ? lastMessageRef : null}>
            {isNewDay && (
              <div className="flex justify-center my-4">
                <div className="badge badge-ghost text-xs opacity-70 py-3 px-4 rounded-full bg-base-300">
                  {formatDateLabel(message.created)}
                </div>
              </div>
            )}
            <Message 
              messageId={message.messageid}
              fromMe={isFromMe} 
              text={message.content}
              file={message.file}
              time={formatTime(message.created, message.isTemp)}
              isTemp={message.isTemp}
              reactions={message.reactions || []}
              status={getMessageStatus(message, isLastMessage, selectedUser)}
              senderName={message.nickname || message.sender?.fullname || message.fullname}
              senderProfilePic={message.sender?.profilepic || message.profilepic}
              highlightRegex={highlightRegex}
            />
          </div>
        );
      })}
    </div>
  )
}

export default Messages