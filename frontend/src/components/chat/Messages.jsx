import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName } from '../../lib/utils'
import { Loader2, FileText, Download } from 'lucide-react'
import axiosInstance from '../../lib/axios'
import { useRef, useEffect, useMemo } from 'react'

const isSameDay = (d1, d2) => {
    if (!d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    // So sánh ngày dựa trên UTC để tránh lệch múi giờ server
    return date1.getUTCDate() === date2.getUTCDate() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCFullYear() === date2.getUTCFullYear();
};

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // So sánh ngày
    if (isSameDay(date, today)) return "Hôm nay";
    if (isSameDay(date, yesterday)) return "Hôm qua";
    
    // Dùng UTC để hiển thị đúng ngày server đã lưu
    return date.toLocaleDateString("vi-VN", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric",
        timeZone: 'UTC' 
    });
};

const Message = ({ message, fromMe, time, highlightRegex }) => {
  const { text, file, isTemp } = { text: message.content, file: message.file, isTemp: message.isTemp }
  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'
  const { user } = useAuthStore()
  const { selectedUser } = useChatStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
  const isGroup = selectedUser?.groupid !== undefined;

  let profilePic = ""; let senderName = ""; let avatarName = "";
  if (fromMe) {
    profilePic = user.profilepic; senderName = "Bạn"; avatarName = user.fullname;
  } else {
    if (isGroup) {
      profilePic = message.sender?.profilepic || message.profilepic;
      senderName = message.nickname || message.sender?.fullname || message.fullname || "Thành viên";
      avatarName = message.sender?.fullname || message.fullname || senderName;
    } else {
      profilePic = selectedUser?.profilepic; senderName = selectedUser?.fullname; avatarName = senderName;
    }
  }
  const profilePicUrl = profilePic ? `${serverUrl}${profilePic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${avatarName?.charAt(0).toUpperCase() || '?'}`

  const renderContent = (content) => {
    if (!content) return null;
    if (!highlightRegex) return content;
    const parts = content.split(highlightRegex);
    return parts.map((part, index) => {
        if (part.match(highlightRegex)) {
             return <span key={index} className="font-bold text-yellow-300 underline decoration-yellow-500/50 decoration-2 cursor-pointer">{part}</span>;
        }
        return part;
    });
  };

  const fileName = getFileName(file); const isImage = isImageFile(file); const fileUrl = `${serverUrl}${file}`;
  const handleDownload = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const response = await axiosInstance.get(fileUrl, { responseType: 'blob' })
      const blob = new Blob([response.data]); const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
    } catch (error) { console.error('Lỗi tải file:', error) }
  }

  return (
    <div className={`chat ${alignment}`}>
      <div className="chat-image avatar hidden sm:block">
        <div className="w-8 md:w-10 rounded-full border border-base-300"><img alt="User avatar" src={profilePicUrl} /></div>
      </div>
      {isGroup && !fromMe && <div className="chat-header mb-1"><span className="text-xs font-bold opacity-70 mr-1">{senderName}</span></div>}
      
      <div className={`chat-bubble flex flex-col ${bubbleColor} max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md shadow-sm`}>
        {file && (
             <div className="mb-2">
                {isImage ? <img src={fileUrl} className="max-w-full rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(fileUrl, '_blank')} /> 
                         : <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg border border-base-300 transition-colors">
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" download={fileName} className="flex items-center gap-2 p-1 md:p-2 bg-base-100 rounded-lg text-primary hover:bg-base-200 transition-colors min-w-0">
                                <FileText size={18} className="shrink-0 text-base-content/80" />
                                <span className="truncate max-w-[100px] md:max-w-[150px] font-medium text-xs md:text-sm text-base-content/80">{fileName}</span>
                            </a>
                            <button onClick={handleDownload} className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-base-200 shrink-0"><Download size={16} /></button>
                           </div>}
             </div>
        )}
        {text && <p className="whitespace-pre-wrap break-words text-left min-w-0 text-sm md:text-base">{renderContent(text)}</p>}
        {isTemp && <div className="flex items-center gap-2 mt-1 text-xs opacity-70"><Loader2 size={12} className="animate-spin" /> Đang gửi...</div>}
      </div>
      <div className="chat-footer opacity-50 text-[10px] md:text-xs mt-1 ml-1">{time}</div>
    </div>
  )
}

const Messages = ({ messages }) => {
  const { user } = useAuthStore()
  const { groupMembers, selectedUser } = useChatStore()
  const lastMessageRef = useRef()

  const highlightRegex = useMemo(() => {
    if (selectedUser?.groupid === undefined || !groupMembers.length) return null;
    const names = groupMembers.flatMap(m => [m.nickname, m.fullname]).filter(Boolean).map(name => name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length);
    if (names.length === 0) return null;
    return new RegExp(`(@(?:${names.join('|')}))(?![\\w])`, 'g');
  }, [groupMembers, selectedUser]);

  useEffect(() => { setTimeout(() => { lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 100) }, [messages])

  // === HÀM FORMAT TIME ===
  const formatTime = (dateString, isTemp) => {
    const date = new Date(dateString)
    
    // Nếu là tin nhắn tạm (vừa gửi): Nó là UTC chuẩn -> Cần chuyển sang giờ VN (Asia/Ho_Chi_Minh)
    if (isTemp) {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        })
    }
    
    // Nếu là tin nhắn từ Server: Server đã lưu giờ Local (22:53) nhưng trả về dạng chuỗi
    // Ta coi chuỗi đó là "đúng giờ hiển thị rồi", nên dùng UTC để không bị cộng thêm 7 tiếng nữa
    return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC' 
    })
  }

  return (
    <div className="flex flex-col gap-2 pb-2">
      {messages.map((message, index) => {
        const isNewDay = index === 0 || !isSameDay(message.created, messages[index - 1].created);

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
                    message={message} 
                    fromMe={message.senderid === user?.userid} 
                    time={formatTime(message.created, message.isTemp)} // Truyền isTemp vào
                    highlightRegex={highlightRegex} 
                />
            </div>
        );
      })}
    </div>
  )
}

export default Messages