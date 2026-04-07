import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import db from './config/db.js'
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)

app.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1')
    res.json({ message: 'Server is running and database is connected' })
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})