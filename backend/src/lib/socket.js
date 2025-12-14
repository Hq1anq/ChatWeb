import { Server } from 'socket.io'
import { getConnection } from './db.js'

let io // Khai báo biến io global
let app // Khai báo biến app global

// Hàm này sẽ được gọi từ server.js để khởi tạo Socket.io với server HTTPS
export const initializeSocketIO = (httpsServer, expressApp) => {
  app = expressApp // Lưu lại app instance

  io = new Server(httpsServer, {
    cors: {
      // THAY ĐỔI URL CLIENT SANG HTTPS
      origin: [process.env.CLIENT_URL],
      credentials: true,
    },
  })

  // Bắt đầu lắng nghe kết nối Socket.io
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id)

    const userId = socket.handshake.query.userId
    if (userId) {
      userSocketMap[userId] = socket.id

      // 1. Join các nhóm đã có (Giữ nguyên logic)
      try {
        const pool = await getConnection()
        const groups = await pool
          .request()
          .input('userId', userId)
          .query('SELECT group_id FROM GroupMembers WHERE user_id = @userId')

        groups.recordset.forEach((row) => {
          socket.join(`group_${row.group_id}`)
        })
      } catch (error) {
        console.error('Error joining group rooms:', error)
      }
    }

    // === MỚI: Lắng nghe sự kiện Client xin join nhóm mới ===
    socket.on('join-group', (groupId) => {
      const roomName = `group_${groupId}`
      socket.join(roomName)
      console.log(`User ${userId} just joined room: ${roomName}`)
    })
    // =======================================================

    io.emit('online-users', Object.keys(userSocketMap))

    socket.on('disconnect', () => {
      if (userId) delete userSocketMap[userId]
      io.emit('online-users', Object.keys(userSocketMap))
    })
  })
}

const userSocketMap = {} // {userId: socketId}

export const getReceiverSocketId = (userId) => userSocketMap[userId]

export { io, app }
