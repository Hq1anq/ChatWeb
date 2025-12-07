import express from 'express'

import { getConnection } from '../lib/db.js'
import {
  signup,
  login,
  logout,
  checkAuth,
  updateProfilePic,
  updateProfileBio,
  updatePassword,
} from '../controller/auth.controller.js'
import protectedRoute from '../middleware/auth.middleware.js'
import uploadProfilePic from '../middleware/uploadProfilePic.middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
  return res.json('BACKEND')
})

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.get('/me', protectedRoute, checkAuth)

router.put(
  '/update-profile/pic',
  protectedRoute,
  uploadProfilePic.single('profilepic'),
  updateProfilePic
)

router.get('/users', async (req, res) => {
  try {
    const pool = await getConnection()
    const result = await pool
      .request()
      .query('SELECT userid, fullname, email, profilepic FROM Users')
    res.json(result.recordset)
  } catch (err) {
    console.error('❌ Error fetching users:', err)
    res.status(500).send('Server error')
  }
})
router.put('/update-profile/bio', protectedRoute, updateProfileBio);
router.put('/update-password', protectedRoute, updatePassword)
export default router
