import express from 'express'

import authRoutes from './route/auth.route.js'

const app = express()

app.use('/api/auth', authRoutes)

app.listen(process.env.PORT, () => {
  console.log('server is running on port', process.env.PORT)
})
