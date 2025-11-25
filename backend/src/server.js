import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path' // 2. Import path

// Import từ file socket của bạn
import { app, server } from './lib/socket.js'

import authRoutes from './route/auth.route.js'
import messageRoutes from './route/message.route.js'

const __dirname = path.resolve() // 4. Lấy đường dẫn gốc của dự án

// Middleware
app.use(express.json())
app.use(cookieParser())

// Cấu hình Static Files (Sửa lại cho chắc chắn)
// Khi Frontend gọi: http://localhost:5000/profilepics/abc.jpg
// Server sẽ tìm trong: /YourProject/public/profilepics/abc.jpg
app.use(
  '/profilepics',
  express.static(path.join(__dirname, 'public/profilepics'))
)

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Fallback nếu quên .env
    credentials: true, // Cho phép gửi cookie
  })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

// Khởi chạy server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
