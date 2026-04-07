import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashedPassword]
    )
    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()])
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const user = users[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

export default router