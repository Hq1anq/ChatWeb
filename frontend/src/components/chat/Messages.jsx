import { useRef, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { Pin, X } from 'lucide-react'
import Message from './Message'
import ForwardModal from './ForwardModal'

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
const getMessageStatus = (message) => {
    if (message.isTemp) return 'sending'
    if (message.seen || message.seenAt) return 'seen'
    if (message.delivered || message.deliveredAt) return 'delivered'
    return 'sent'
}

const Messages = ({ messages, onReply }) => {
  const { user } = useAuthStore()
  const { groupMembers, selectedUser, markMessagesAsSeen } = useChatStore()
  const lastMessageRef = useRef()
  
  const [forwardingMessage, setForwardingMessage] = useState(null)
  const [pinnedMessageIds, setPinnedMessageIds] = useState([])

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

  // Đánh dấu đã xem khi component mount hoặc messages thay đổi
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      const isGroup = selectedUser.groupid !== undefined
      const conversationId = isGroup ? selectedUser.groupid : selectedUser.userid
      
      const hasUnseenMessages = messages.some(
        msg => msg.senderid !== user?.userid && !msg.seen
      )
      
      if (hasUnseenMessages) {
        markMessagesAsSeen(conversationId, isGroup)
      }
    }
  }, [selectedUser, messages, user, markMessagesAsSeen])

  const pinnedMessages = messages.filter(msg => 
    pinnedMessageIds.includes(msg.messageid) || msg.isPinned
  )

  const handlePin = (messageId, shouldPin) => {
    if (shouldPin) {
      setPinnedMessageIds(prev => [...prev, messageId])
    } else {
      setPinnedMessageIds(prev => prev.filter(id => id !== messageId))
    }
  }

  const handleForward = (message) => {
    setForwardingMessage(message)
  }

  const handleReply = (replyData) => {
    if (onReply) {
      onReply(replyData)
    }
  }

  return (
    <div className="flex flex-col gap-2 pb-2">
      {/* Pinned Messages Bar */}
      {pinnedMessages.length > 0 && (
        <div className="sticky top-0 z-20 bg-warning/10 border border-warning/30 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-2 text-warning text-sm font-medium mb-1">
            <Pin size={14} />
            <span>Tin nhắn đã ghim ({pinnedMessages.length})</span>
          </div>
          <div className="space-y-1">
            {pinnedMessages.slice(0, 3).map(msg => (
              <div 
                key={msg.messageid} 
                className="flex items-center justify-between bg-base-100 rounded p-2 text-xs"
              >
                <p className="truncate flex-1">
                  {msg.content || (msg.file ? '📎 File đính kèm' : '')}
                </p>
                <button
                  onClick={() => handlePin(msg.messageid, false)}
                  className="btn btn-ghost btn-circle btn-xs"
                  title="Bỏ ghim"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages List */}
      {messages.map((message, index) => {
        const isNewDay = index === 0 || !isSameDay(message.created, messages[index - 1].created);
        const isFromMe = message.senderid === user?.userid;
        const isPinned = pinnedMessageIds.includes(message.messageid) || message.isPinned;

        // Lấy thông tin replyTo từ message (đã được backend format sẵn)
        const replyTo = message.replyTo || (message.replyToId ? {
          messageId: message.replyToId,
          content: message.replyContent,
          file: message.replyFile,
          senderName: message.replySenderName || (message.replySenderId === user?.userid ? 'Bạn' : 'Người dùng'),
          senderId: message.replySenderId
        } : null);

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
              status={getMessageStatus(message)}
              isPinned={isPinned}
              replyTo={replyTo}
              isForwarded={message.isForwarded}
              message={message}
              onReply={handleReply}
              onPin={handlePin}
              onForward={handleForward}
              senderProfilePic={message.sender?.profilepic || message.profilepic}
              highlightRegex={highlightRegex}
            />
          </div>
        );
      })}

      {/* Forward Modal */}
      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
        />
      )}
    </div>
  )
}

export default Messages