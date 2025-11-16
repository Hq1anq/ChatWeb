import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
})

const userSocketMap = {} // {userId: socketId}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  const userId = socket.handshake.query.userId
  if (userId) {
    userSocketMap[userId] = socket.id
    console.log(`User ${userId} connected with socket ID: ${socket.id}`)
  }

  io.emit('online-users', Object.keys(userSocketMap)) // Gửi danh sách người dùng online cho tất cả kết nối

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
    delete userSocketMap[userId]
    io.emit('online-users', Object.keys(userSocketMap))
  })
})

export { io, app, server }
