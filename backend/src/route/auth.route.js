import express from 'express'

import { getConnection } from '../lib/db.js'
import {
  signup,
  login,
  logout,
  checkAuth,
} from '../controller/auth.controller.js'
import protectedRoute from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', (req, res) => {
  return res.json('BACKEND')
})

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.get('/me', protectedRoute, checkAuth)

router.get('/users', async (req, res) => {
  try {
    const pool = await getConnection()
    const result = await pool.request().query('SELECT * FROM Users')
    res.json(result.recordset)
  } catch (err) {
    console.error('❌ Error fetching users:', err)
    res.status(500).send('Server error')
  }
})

export default router
