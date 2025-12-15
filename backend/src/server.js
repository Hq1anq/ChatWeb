import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path' // 2. Import path

// Import từ file socket của bạn
import { app, server } from './lib/socket.js'

import authRoutes from './route/auth.route.js'
import messageRoutes from './route/message.route.js'
import groupRoutes from './route/group.route.js' // <--- MỚI: Import Group Routes
import notificationRoutes from './route/notification.route.js';

const __dirname = path.resolve() // 4. Lấy đường dẫn gốc của dự án

// Middleware
app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Fallback nếu quên .env
    credentials: true, // Cho phép gửi cookie
  })
)

// Static file serving đặt sau cors
// Cấu hình Static Files (Sửa lại cho chắc chắn)
app.use(
  '/profilepics',
  express.static(path.join(__dirname, 'public/profilepics'))
)
// Bổ sung: Cấu hình Static Files cho tin nhắn (hình ảnh, file)
app.use(
  '/messages', // <-- Endpoint URL
  express.static(path.join(__dirname, 'public/messages')) // <-- Đường dẫn thư mục vật lý
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/groups', groupRoutes) // <--- MỚI: Sử dụng route groups
app.use('/api/notifications', notificationRoutes);

// Khởi chạy server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})