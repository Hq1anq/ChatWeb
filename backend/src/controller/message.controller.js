import Message from '../model/message.model.js'
import { User } from '../model/user.model.js'
//Import từ socket.js để gửi tin nhắn realtime
import { getReceiverSocketId, io } from '../lib/socket.js'

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
    const friendId = req.params.id
    const myId = req.user.userid

    const messages = await Message.getConversation({ myId, friendId })
    res.status(200).json(messages)
  } catch (error) {
    console.error('Error in getMessages controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const receiverid = req.params.id
    const senderid = req.user.userid
    const { content } = req.body

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

    const newMessage = await Message.create({
      senderid,
      receiverid,
      content,
      file, // Sử dụng đường dẫn file đã xác định
    })

    // Logic Real-time
    const receiverSocketId = getReceiverSocketId(receiverid)
    if (receiverSocketId) {
      // Gửi sự kiện 'newMessage' đến đúng socketId của người nhận
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Error in sendMessage controller:', error.message)
    res.status(500).json({ message: 'Internal Server Error.' })
  }
}
