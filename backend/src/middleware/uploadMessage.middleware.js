import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve('public/messages')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLocaleLowerCase()
    const userid = req.user?.userid || 'anon'
    // receiver lấy từ req.params.id bởi route '.../send/:id'
    const receiverid = req.params.id || 'anon'
    // Latin-1 -> Buffer -> UTF-8
    // Tạo Buffer từ chuỗi bị lỗi, giải thích cho Buffer rằng chuỗi này
    // hiện đang được coi là Latin-1 (để Node.js lấy đúng các byte)
    const nameBuffer = Buffer.from(file.originalname, 'latin1')

    // Chuyển Buffer trở lại thành chuỗi, giải mã nó dưới dạng UTF-8
    const originalNameCorrect = nameBuffer.toString('utf8')

    // Sử dụng path.basename an toàn hơn
    const nameWithoutExt = path.basename(originalNameCorrect, ext)
    const name = nameWithoutExt.replace(/\s+/g, '-').slice(0, 50)

    const now = new Date()
    const YY = String(now.getFullYear()).slice(-2)
    const MM = String(now.getMonth() + 1).padStart(2, '0')
    const DD = String(now.getDate()).padStart(2, '0')
    const H = String(now.getHours()).padStart(2, '0')
    const M = String(now.getMinutes()).padStart(2, '0')

    const dateString = `${YY}${MM}${DD}.${H}${M}`

    cb(null, `${dateString}.${userid}.${receiverid}-${name}${ext}`)
  },
})

const uploadMessage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  // fileFilter cho phép tất cả các loại file
})

export default uploadMessage
