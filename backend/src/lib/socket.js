import { Server } from 'socket.io'
import { getConnection } from './db.js'
import sql from 'mssql'

let io
let app

export const initializeSocketIO = (httpServer, expressApp) => {
  app = expressApp

  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL],
      credentials: true,
    },
  })

  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id)

    const userId = socket.handshake.query.userId
    if (userId) {
      userSocketMap[userId] = socket.id

      // Join các nhóm đã có
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

    // === Lắng nghe sự kiện join nhóm mới ===
    socket.on('join-group', (groupId) => {
      const roomName = `group_${groupId}`
      socket.join(roomName)
      console.log(`User ${userId} just joined room: ${roomName}`)
    })

    // === MARK AS SEEN - Đánh dấu tin nhắn đã xem ===
    socket.on('markAsSeen', async (data) => {
      const { conversationUserId, isGroup } = data
      
      if (!userId || !conversationUserId) return

      try {
        const pool = await getConnection()
        const now = new Date()

        if (isGroup) {
          // Đánh dấu tin nhắn nhóm đã xem
          await pool.request()
            .input('groupId', sql.Int, conversationUserId)
            .input('oderId', sql.Int, userId)
            .input('seenAt', sql.DateTime, now)
            .query(`
              UPDATE Messages 
              SET seen = 1, seenAt = @seenAt 
              WHERE group_id = @groupId 
                AND senderid != @oderId 
                AND (seen = 0 OR seen IS NULL)
            `)

          // Emit cho tất cả members trong group
          io.to(`group_${conversationUserId}`).emit('messagesSeen', {
            oderId: parseInt(userId),
            oderId: parseInt(conversationUserId),
            isGroup: true,
            seenAt: now
          })

        } else {
          // Đánh dấu tin nhắn 1-1 đã xem
          // Cập nhật tất cả tin nhắn từ người kia gửi cho mình
          const result = await pool.request()
            .input('oderId', sql.Int, userId)
            .input('senderId', sql.Int, conversationUserId)
            .input('seenAt', sql.DateTime, now)
            .query(`
              UPDATE Messages 
              SET seen = 1, seenAt = @seenAt 
              OUTPUT INSERTED.messageid
              WHERE receiverid = @oderId 
                AND senderid = @senderId 
                AND (seen = 0 OR seen IS NULL)
            `)

          const updatedMessageIds = result.recordset.map(r => r.messageid)

          if (updatedMessageIds.length > 0) {
            // Emit cho người gửi biết tin nhắn đã được xem
            const senderSocketId = getReceiverSocketId(conversationUserId)
            if (senderSocketId) {
              io.to(senderSocketId).emit('messagesSeen', {
                oderId: parseInt(userId),
                oderId: parseInt(conversationUserId),
                messageIds: updatedMessageIds,
                isGroup: false,
                seenAt: now
              })
            }
          }
        }

        console.log(`User ${userId} marked messages as seen from ${conversationUserId}`)

      } catch (error) {
        console.error('Error marking messages as seen:', error)
      }
    })

    io.emit('online-users', Object.keys(userSocketMap))

    // --- VIDEO CALL ---
    socket.on('call-offer', (data) => {
      const receiverSocketId = getReceiverSocketId(data.targetUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-received', {
          sender: data.sender,
          offer: data.offer,
          callId: data.callId,
        })
      }
    })

    socket.on('webrtc-signal', (data) => {
      const receiverSocketId = getReceiverSocketId(data.targetUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('webrtc-signal', data)
      }
    })

    socket.on('call-accepted', (data) => {
      const receiverSocketId = getReceiverSocketId(data.targetUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-answered', { callId: data.callId })
      }
    })

    socket.on('call-rejected', (data) => {
      const receiverSocketId = getReceiverSocketId(data.targetUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-rejected', {
          callId: data.callId,
          isError: data.isError,
        })
      }
    })

    socket.on('call-ended', (data) => {
      const receiverSocketId = getReceiverSocketId(data.targetUserId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('call-ended', {
          callId: data.callId,
          senderId: userId,
        })
      }
    })

    socket.on('disconnect', () => {
      if (userId) delete userSocketMap[userId]
      io.emit('online-users', Object.keys(userSocketMap))
    })
  })
}

const userSocketMap = {}

export const getReceiverSocketId = (userId) => userSocketMap[userId]

export { io, app }