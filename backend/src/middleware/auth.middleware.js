import jwt from 'jsonwebtoken'
import { User } from '../model/user.model.js'

export default async function protectedRoute(req, res, next) {
  try {
    const token = req.cookies.jwt
    if (!token)
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded)
      return res.status(401).json({ message: 'Unauthorized: Invalid token' })

    const user = await User.findById(decoded.userid)
    if (!user)
      return res.status(401).json({ message: 'Unauthorized: User not found' })

    const { password, ...userWithoutPassword } = user
    req.user = userWithoutPassword

    next()
  } catch (error) {
  console.log('Error in protectedRoute middleware:', error.message)
  
  // Phân biệt lỗi do token hết hạn/sai với lỗi server
  if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
  }
  if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  res.status(500).json({ message: 'Internal Server Error' })
}
}
