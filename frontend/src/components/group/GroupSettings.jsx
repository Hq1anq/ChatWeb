import { useEffect, useState } from "react"; // <--- Thêm useState
import { X, Shield, LogOut, Edit2, Check } from "lucide-react"; // <--- Thêm Edit2, Check
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";

const GroupSettings = ({ onClose }) => {
  const { selectedUser, getGroupMembers, groupMembers, isMessagesLoading, updateNickname } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [editingId, setEditingId] = useState(null);
  const [newNickname, setNewNickname] = useState("");

  // selectedUser ở đây đóng vai trò là Group Object
  const isGroup = selectedUser?.groupid !== undefined;

  useEffect(() => {
    if (isGroup) {
      getGroupMembers(selectedUser.groupid);
    }
  }, [selectedUser, getGroupMembers, isGroup]);

  const handleStartEdit = (member) => {
      setEditingId(member.userid);
      setNewNickname(member.nickname || member.fullname);
  };

  const handleSaveNickname = async (userId) => {
      await updateNickname(selectedUser.groupid, userId, newNickname);
      setEditingId(null);
  };

  if (!isGroup) return null;

  // Xử lý Avatar Group
  const groupPicUrl = selectedUser.group_pic
    ? `${import.meta.env.VITE_SERVER_URL}${selectedUser.group_pic}`
    : "https://placehold.co/600x600/2563EB/FFFFFF?text=G";

  return (
    <div className="w-80 border-l border-base-300 h-full bg-base-100 flex flex-col transition-all duration-300 shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-100">
        <h3 className="font-semibold text-lg">Thông tin nhóm</h3>
        <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
          <X className="size-5" />
        </button>
      </div>

      {/* Group Info Section */}
      <div className="p-6 flex flex-col items-center gap-3 border-b border-base-300 bg-base-50/50">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center shadow-md">
            {groupPicUrl ? (
              <img 
                src={groupPicUrl} 
                alt={selectedUser.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-4xl font-bold uppercase">
                {selectedUser.name?.charAt(0)}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-center w-full">
          <h2 className="font-bold text-xl truncate px-2" title={selectedUser.name}>
            {selectedUser.name}
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            {groupMembers.length} thành viên
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-bold text-base-content/40 mb-4 uppercase tracking-wider">
          Thành viên ({groupMembers.length})
        </h4>

        <div className="space-y-4">
        {groupMembers.map((member) => (
            <div key={member.userid} className="flex items-center gap-3 group">
            <div className="avatar">
                <div className="w-10 h-10 rounded-full border border-base-200">
                <img src={member.profilepic ? `${import.meta.env.VITE_SERVER_URL}${member.profilepic}` : `https://placehold.co/600x600/E5E7EB/333333?text=${member.fullname.charAt(0)}`} alt="avt" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {editingId === member.userid ? (
                    <div className="flex items-center gap-1">
                        <input 
                            className="input input-xs input-bordered w-full"
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            autoFocus
                        />
                        <button onClick={() => handleSaveNickname(member.userid)} className="btn btn-xs btn-square btn-success">
                            <Check size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="font-medium truncate text-sm">
                            {member.nickname || member.fullname}
                        </span>
                        {/* SỬA Ở ĐÂY: 
                            - Xóa class 'opacity-0 group-hover:opacity-100' để nút luôn hiện.
                            - Thêm 'text-base-content/50 hover:text-primary' để nút mờ nhẹ, hover vào thì sáng lên.
                        */}
                        <button 
                            onClick={() => handleStartEdit(member)}
                            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary transition-colors"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>
                )}
                
                <div className="text-xs text-base-content/50 flex items-center gap-1">
                    {member.role === "admin" ? <span className="text-primary flex items-center gap-1"><Shield size={10}/> Admin</span> : "Thành viên"}
                    {member.userid === currentUser.userid && <span className="badge badge-xs badge-ghost">Bạn</span>}
                </div>
            </div>
            </div>
        ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-base-300 mt-auto bg-base-100">
        <button className="btn btn-outline btn-error btn-block flex items-center gap-2">
          <LogOut size={18} />
          Rời nhóm
        </button>
      </div>
    </div>
  );
};

export default GroupSettings;