import { useState } from "react";
import { X, Search, Users } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { users, createGroup, isCreatingGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Lọc danh sách user để chọn (trừ bản thân user hiện tại - đã được lọc ở store)
  const filteredUsers = users.filter((u) =>
    u.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Vui lòng nhập tên nhóm");
    if (selectedMembers.length < 2)
      return toast.error("Nhóm cần ít nhất 3 người (bạn và 2 người khác)");

    // Gọi hàm createGroup từ store (sẽ viết ở bước sau)
    const success = await createGroup({
      name: groupName,
      members: selectedMembers,
    });

    if (success) {
      toast.success("Tạo nhóm thành công!");
      setGroupName("");
      setSelectedMembers([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="size-5" /> Tạo nhóm mới
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Tên nhóm */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Tên nhóm</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Hội chém gió..."
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Chọn thành viên */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Thêm thành viên</span>
              <span className="label-text-alt">{selectedMembers.length} đã chọn</span>
            </label>
            
            {/* Search User Input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Tìm người dùng..."
                className="input input-sm input-bordered w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* List User */}
            <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2 space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-base-content/60 py-2">
                  Không tìm thấy người dùng
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <label
                    key={user.userid}
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={selectedMembers.includes(user.userid)}
                      onChange={() => toggleMember(user.userid)}
                    />
                    <img
                      src={user.profilepic || "/avatar.png"}
                      alt={user.fullname}
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{user.fullname}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isCreatingGroup}
          >
            {isCreatingGroup ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Tạo nhóm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;