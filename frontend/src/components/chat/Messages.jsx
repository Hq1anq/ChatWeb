import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { isImageFile, getFileName, formatTime } from '../../lib/utils'
import { Loader2, FileText, Download } from 'lucide-react'
import axiosInstance from '../../lib/axios'
import { useRef, useEffect, useMemo } from 'react'

// === HÀM HỖ TRỢ HIGHLIGHT TAG (@) ===
const formatMessageContent = (content) => {
  if (!content) return null;
  
  // Regex tìm chuỗi bắt đầu bằng @ theo sau là ký tự chữ/số/dấu gạch dưới/khoảng trắng
  // Ví dụ: @Alice Johnson, @Bob
  const parts = content.split(/(@[\p{L}\p{N}_ ]+)/u); 

  return parts.map((part, index) => {
      // Logic đơn giản: Nếu bắt đầu bằng @ và dài hơn 1 ký tự -> Tô màu
      if (part.startsWith('@') && part.length > 1) {
          return (
              <span key={index} className="text-blue-500 font-bold bg-blue-500/10 rounded px-1">
                  {part}
              </span>
          );
      }
      return part;
  });
};

const Message = ({ message, fromMe, time, highlightRegex }) => {
  const { text, file, isTemp } = { 
    text: message.content, 
    file: message.file, 
    isTemp: message.isTemp 
  }

  const alignment = fromMe ? 'chat-end' : 'chat-start'
  const bubbleColor = fromMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'

  const { user } = useAuthStore()
  const { selectedUser } = useChatStore()
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

  // Kiểm tra xem đang chat nhóm hay chat riêng
  const isGroup = selectedUser?.groupid !== undefined;

  let profilePic = "";
  let senderName = "";    
  let avatarName = "";    

  if (fromMe) {
    profilePic = user.profilepic;
    senderName = "Bạn"; 
    avatarName = user.fullname; 
  } else {
    if (isGroup) {
      profilePic = message.sender?.profilepic || message.profilepic;
      senderName = senderName = message.nickname || message.sender?.fullname || message.fullname || "Thành viên";
      avatarName = message.sender?.fullname || message.fullname || senderName;
    } else {
      profilePic = selectedUser?.profilepic;
      senderName = selectedUser?.fullname;
      avatarName = senderName;
    }
  }

  const profilePicUrl = profilePic
    ? `${serverUrl}${profilePic}`
    : `https://placehold.co/600x600/E5E7EB/333333?text=${avatarName?.charAt(0).toUpperCase() || '?'}`

  const fileName = getFileName(file)
  const isImage = isImageFile(file)
  const fileUrl = `${serverUrl}${file}`

  const renderContent = (content) => {
    if (!content) return null;
    if (!highlightRegex) return content;

    // Split nội dung dựa trên Regex các tên thành viên
    const parts = content.split(highlightRegex);

    return parts.map((part, index) => {
        // Kiểm tra xem part này có phải là Tag không
        if (part.startsWith('@')) {
             return (
                <span key={index} className="font-bold text-yellow-300 underline decoration-yellow-500/50 decoration-2 cursor-pointer">
                    {part}
                </span>
            );
        }
        return part;
    });
  };

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const response = await axiosInstance.get(fileUrl, { responseType: 'blob' })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Lỗi tải file:', error)
    }
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
            {isImage ? (
              <img
                src={fileUrl}
                alt="Attached"
                className="max-w-full rounded-lg border border-black/10"
              />
            ) : (
              <div className="flex items-center justify-between gap-2 p-2 bg-base-100 rounded-lg border border-base-300 transition-colors">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={fileName}
                  className="flex items-center gap-2 p-1 md:p-2 bg-base-100 rounded-lg text-primary hover:bg-base-200 transition-colors min-w-0"
                  title={`Tải xuống ${fileName}`}
                >
                  <FileText size={18} className="shrink-0 text-base-content/80" />
                  <span className="truncate max-w-[100px] md:max-w-[150px] font-medium text-xs md:text-sm text-base-content/80">
                    {fileName}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-base-200 shrink-0"
                  title={`Tải xuống ${fileName}`}
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Render text đã highlight */}
        {text && <p className="whitespace-pre-wrap wrap-break-word text-left min-w-0 text-sm md:text-base">{renderContent(text)}</p>}

        {isTemp && (
          <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
            <Loader2 size={12} className="animate-spin" />
            Đang gửi...
          </div>
        )}
        
        {isTemp && <div className="flex items-center gap-2 mt-1 text-xs opacity-70"><Loader2 size={12} className="animate-spin" /> Đang gửi...</div>}
      </div>
      <div className="chat-footer opacity-50 text-[10px] md:text-xs mt-1 ml-1">{time}</div>
    </div>
  )
}

const Messages = ({ messages }) => {
  const { user } = useAuthStore()
  const lastMessageRef = useRef()
  const { groupMembers, selectedUser } = useChatStore()

  // Tạo Regex Highlight động dựa trên danh sách thành viên
  const highlightRegex = useMemo(() => {
    if (!selectedUser?.groupid || !groupMembers.length) return null;
    
    // Lấy tất cả tên hiển thị có thể có (Nickname và Fullname)
    // Sắp xếp theo độ dài giảm dần để match tên dài trước (tránh lỗi match một phần)
    const names = groupMembers
      .flatMap(m => [m.nickname, m.fullname])
      .filter(Boolean) // Loại bỏ null/undefined
      .map(name => name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape ký tự đặc biệt trong tên
      .sort((a, b) => b.length - a.length); 

    if (names.length === 0) return null;

    // Regex match: @Tên (theo sau phải là khoảng trắng hoặc kết thúc dòng hoặc dấu câu)
    // (?<=\s|^)@ -> Lookbehind: @ phải ở đầu dòng hoặc sau khoảng trắng (tùy chọn)
    // (${names.join('|')}) -> Match bất kỳ tên nào trong list
    return new RegExp(`(@(?:${names.join('|')}))`, 'g');
  }, [groupMembers, selectedUser]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messages])

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col gap-2 pb-2">
      {messages.map((message, index) => (
        <div key={message.messageid || message.tempId || index} ref={index === messages.length - 1 ? lastMessageRef : null}>
          <Message message={message} fromMe={message.senderid === user?.userid} time={formatTime(message.created)} highlightRegex={highlightRegex} />
        </div>
      ))}
    </div>
  )
}

export default Messages
