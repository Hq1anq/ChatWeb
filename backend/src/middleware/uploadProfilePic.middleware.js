import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = path.resolve('public/profilepics')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const userid = req.user?.userid || 'anon'
    const name = file.originalname
      .replace(ext, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)

    // Format date YYMMDD
    const now = new Date()
    const YY = String(now.getFullYear()).slice(-2)
    const MM = String(now.getMonth() + 1).padStart(2, '0')
    const DD = String(now.getDate()).padStart(2, '0')

    const dateString = `${YY}${MM}${DD}`

    cb(null, `${dateString}.${userid}-${name}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedExt = /.(jpg|jpeg|png|gif)$/i
  if (allowedExt.test(file.originalname)) cb(null, true)
  else cb(new Error('Only image files are allowed'))
}

const uploadProfilePic = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
})

export default uploadProfilePic
