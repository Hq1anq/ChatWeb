import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { app, server } from './lib/socket.js'

import authRoutes from './route/auth.route.js'

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use('/api/auth', authRoutes)

server.listen(process.env.PORT, () => {
  console.log('server is running on port', process.env.PORT)
})
