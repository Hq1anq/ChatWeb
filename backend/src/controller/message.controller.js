import Message from '../model/message.model.js'
import { User } from '../model/user.model.js'
//Import từ socket.js để gửi tin nhắn realtime
import { getReceiverSocketId, io } from '../lib/socket.js'
import { NotificationModel } from '../model/notification.model.js';
import { getConnection } from '../lib/db.js'

export const getUsersForSidebar = async (req, res) => {
  // Thêm async
  try {
    const loggedInUserId = req.user.userid

    const filteredUsers = await User.getSidebarList(loggedInUserId)

    res.status(200).json(filteredUsers)
  } catch (error) {
    console.error('Error in getUsersForSidebar controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params // id có thể là friendId hoặc groupId
    const myId = req.user.userid
    
    // Lấy query param để biết là group hay user
    // Frontend cần gọi: /api/message/:id?isGroup=true nếu là group
    const isGroup = req.query.isGroup === 'true';

    let messages;
    if (isGroup) {
        messages = await Message.getGroupMessages({ groupId: chatId });
    } else {
        messages = await Message.getConversation({ myId, friendId: chatId });
    }

    res.status(200).json(messages)
  } catch (error) {
    console.error('Error in getMessages controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverOrGroupId } = req.params
    const senderid = req.user.userid
    // Lấy content và groupId (nếu có) từ body
    const { content, isGroup, mentions } = req.body 

    let file = ''
    // Kiểm tra xem có file được upload không (req.file được thêm bởi Multer)
    if (req.file) {
      // Lưu đường dẫn public của file vào biến file
      // Đường dẫn sẽ là /messages/tên_file_đã_lưu
      file = `/messages/${req.file.filename}`
    }

    if (!content && !file) {
      // Multer sẽ tự động xóa file đã upload nếu gặp lỗi ở đây
      return res
        .status(400)
        .json({ message: 'Message content or file is required' })
    }

    // Xác định logic lưu DB
    let newMessage;
    
    if (isGroup === 'true' || isGroup === true) {
        // --- LOGIC GỬI TIN NHẮN NHÓM ---
        newMessage = await Message.create({
            senderid,
            receiverid: null,
            group_id: receiverOrGroupId,
            content,
            file
        });

        // Emit realtime tới ROOM group
        const roomName = `group_${receiverOrGroupId}`;
        io.to(roomName).emit('newMessage', newMessage);

    } else {
        // --- LOGIC GỬI TIN NHẮN 1-1 (CŨ) ---
        newMessage = await Message.create({
            senderid,
            receiverid: receiverOrGroupId,
            group_id: null,
            content,
            file, 
        });

        // Logic Real-time 1-1
        const receiverSocketId = getReceiverSocketId(receiverOrGroupId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }
    }

    res.status(201).json(newMessage)

    if (isGroup === 'true' && mentions) {
        let mentionedIds = [];
        try { mentionedIds = JSON.parse(mentions); } catch (e) { mentionedIds = mentions; }

        if (Array.isArray(mentionedIds) && mentionedIds.length > 0) {
            // 1. Lấy tên nhóm từ DB để nội dung thông báo chính xác
            let groupName = "nhóm";
            try {
                const pool = await getConnection();
                const groupRes = await pool.request()
                    .input('id', receiverOrGroupId)
                    .query("SELECT name FROM Groups WHERE groupid = @id");
                if (groupRes.recordset[0]) groupName = groupRes.recordset[0].name;
            } catch (err) { console.error("Lỗi lấy tên nhóm:", err); }

            mentionedIds.forEach(async (receiverId) => {
                if (receiverId == senderid) return;

                const notif = await NotificationModel.create({
                    receiver_id: receiverId,
                    sender_id: senderid,
                    group_id: receiverOrGroupId,
                    type: 'TAG',
                    content: `đã nhắc đến bạn trong nhóm ${groupName}` // <--- SỬA NỘI DUNG Ở ĐÂY
                });

                const socketId = getReceiverSocketId(receiverId);
                if (socketId) {
                    const notifWithSender = { 
                         ...notif, 
                         senderName: req.user.fullname, 
                         senderPic: req.user.profilepic,
                         groupName: groupName, // Gửi kèm tên nhóm cho socket
                         groupPic: null // Realtime có thể chưa cần ảnh ngay, hoặc query thêm nếu muốn
                    };
                    io.to(socketId).emit('new-notification', notifWithSender);
                }
            });
        }
    }
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}