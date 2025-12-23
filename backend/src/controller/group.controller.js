import { GroupModel } from '../model/group.model.js';
import { NotificationModel } from '../model/notification.model.js';
// Import socket để bắn thông báo
import { io, getReceiverSocketId } from '../lib/socket.js'; 

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body; 
    const ownerId = req.user.userid; 

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Tên nhóm và thành viên là bắt buộc" });
    }

    // 1. Tạo nhóm & Add Owner
    const newGroup = await GroupModel.create(name, ownerId);
    await GroupModel.addMember(newGroup.groupid, ownerId, 'admin');

    // 2. Add Members
    const addMemberPromises = members.map(memberId => 
      GroupModel.addMember(newGroup.groupid, memberId, 'member')
    );
    await Promise.all(addMemberPromises);

    // === MỚI: REALTIME NOTIFICATION ===
    // Gửi sự kiện 'new-group' cho tất cả thành viên (bao gồm cả Owner để cập nhật UI)
    const allMembers = [...members, ownerId];
    
    allMembers.forEach(memberId => {
        const socketId = getReceiverSocketId(memberId);
        if (socketId) {
            // Gửi toàn bộ thông tin group mới về
            io.to(socketId).emit('new-group', newGroup);
        }
    });
    // ==================================

    res.status(201).json({ 
      success: true, 
      group: newGroup, 
      message: "Tạo nhóm thành công" 
    });
    // SAU KHI ADD MEMBERS THÀNH CÔNG:
    // Tạo thông báo cho từng thành viên (trừ người tạo)
    const notificationPromises = members.map(async (memberId) => {
        const notif = await NotificationModel.create({
            receiver_id: memberId,
            sender_id: ownerId,
            group_id: newGroup.groupid,
            type: 'ADD_GROUP',
            content: `đã thêm bạn vào nhóm ${newGroup.name}`
        });

        // Bắn Socket Realtime cho từng người
        const socketId = getReceiverSocketId(memberId);
        if (socketId) {
            // Emit sự kiện group mới (cũ)
            io.to(socketId).emit('new-group', newGroup);
            // Emit sự kiện thông báo mới (MỚI)
            // Cần query lại thông tin sender để hiển thị đẹp trên UI ngay lập tức
            const notifWithSender = { 
                ...notif, 
                senderName: req.user.fullname, 
                senderPic: req.user.profilepic,
                groupName: newGroup.name
            };
            io.to(socketId).emit('new-notification', notifWithSender);
        }
    });
    
    await Promise.all(notificationPromises);

  } catch (error) {
    console.error("Error in createGroup controller: ", error);
    res.status(500).json({ message: "Lỗi server khi tạo nhóm" });
  }
};

// ... giữ nguyên các hàm khác (getMyGroups, getGroupDetails)
export const getMyGroups = async (req, res) => {
    // ... code cũ của bạn
    try {
        const currentUserId = req.user.userid;
        const groups = await GroupModel.getGroupsByUser(currentUserId);
        res.status(200).json(groups);
      } catch (error) {
        console.error("Error in getMyGroups: ", error);
        res.status(500).json({ message: "Lỗi server" });
      }
};

export const getGroupDetails = async (req, res) => {
    // ... code cũ của bạn
    try {
        const { groupId } = req.params;
        const members = await GroupModel.getGroupMembers(groupId);
        res.status(200).json({ members });
      } catch (error) {
        console.error("Error in getGroupDetails: ", error);
        res.status(500).json({ message: "Lỗi server" });
      }
};

export const updateGroupNickname = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, nickname } = req.body;
    
    // Validate: Chỉ admin nhóm hoặc chính user đó mới được đổi (tùy logic bạn, ở đây cho phép đổi tên mình hoặc admin đổi tên người khác)
    const currentUserId = req.user.userid;
    const isAdmin = await GroupModel.isGroupAdmin(groupId, currentUserId);
    
    if (currentUserId !== userId && !isAdmin) {
        return res.status(403).json({ message: "Bạn không có quyền đổi biệt danh cho người này" });
    }

    await GroupModel.updateNickname(groupId, userId, nickname);
    
    res.status(200).json({ success: true, message: "Cập nhật biệt danh thành công" });
  } catch (error) {
    console.error("Error updating nickname:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};