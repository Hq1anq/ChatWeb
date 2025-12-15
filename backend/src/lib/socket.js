import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { getConnection } from './db.js'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
  },
})

const userSocketMap = {} // {userId: socketId}

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId]
}

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id)

  const userId = socket.handshake.query.userId
  if (userId) {
    userSocketMap[userId] = socket.id
    
    // 1. Join các nhóm đã có (Code cũ - giữ nguyên)
    try {
      const pool = await getConnection();
      const groups = await pool.request()
        .input('userId', userId)
        .query('SELECT group_id FROM GroupMembers WHERE user_id = @userId');
      
      groups.recordset.forEach(row => {
        socket.join(`group_${row.group_id}`);
      });
    } catch (error) {
      console.error("Error joining group rooms:", error);
    }
  }

  // === MỚI: Lắng nghe sự kiện Client xin join nhóm mới ===
  socket.on("join-group", (groupId) => {
      const roomName = `group_${groupId}`;
      socket.join(roomName);
      console.log(`User ${userId} just joined room: ${roomName}`);
  });
  // =======================================================

  io.emit('online-users', Object.keys(userSocketMap))

  socket.on('disconnect', () => {
    if (userId) delete userSocketMap[userId]
    io.emit('online-users', Object.keys(userSocketMap))
  })
})

export { io, app, server }