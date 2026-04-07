import express from 'express'
import db from '../config/db.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Log a new session
router.post('/', authMiddleware, async (req, res) => {
  const { subject, duration_minutes, focus_rating, mood, notes } = req.body
  const user_id = req.user.id

  if (!subject || !duration_minutes) {
    return res.status(400).json({ message: 'Subject and duration are required' })
  }

  if (typeof duration_minutes !== 'number' || duration_minutes < 1) {
    return res.status(400).json({ message: 'Duration must be a positive number' })
  }

  if (focus_rating && (focus_rating < 1 || focus_rating > 5)) {
    return res.status(400).json({ message: 'Focus rating must be between 1 and 5' })
  }

  const validMoods = ['great', 'good', 'neutral', 'tired', 'stressed']
  if (mood && !validMoods.includes(mood)) {
    return res.status(400).json({ message: 'Invalid mood value' })
  }
  
  try {
    // check if subject exists for this user, if not create it
    let [subjects] = await db.query(
      'SELECT * FROM subjects WHERE user_id = ? AND name = ?',
      [user_id, subject]
    )

    let subject_id
    if (subjects.length === 0) {
      const [result] = await db.query(
        'INSERT INTO subjects (user_id, name) VALUES (?, ?)',
        [user_id, subject]
      )
      subject_id = result.insertId
    } else {
      subject_id = subjects[0].id
    }

    // save the session
    await db.query(
      'INSERT INTO study_sessions (user_id, subject_id, duration_minutes, focus_rating, mood, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, subject_id, duration_minutes, focus_rating, mood, notes]
    )

    res.status(201).json({ message: 'Session logged successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Get all sessions for logged in user
router.get('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id
  try {
    const [sessions] = await db.query(
      `SELECT ss.*, s.name as subject_name 
       FROM study_sessions ss
       LEFT JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.user_id = ?
       ORDER BY ss.created_at DESC`,
      [user_id]
    )
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Get weekly stats
router.get('/stats', authMiddleware, async (req, res) => {
  const user_id = req.user.id
  try {
    // total hours this week
    const [hoursResult] = await db.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM study_sessions
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [user_id]
    )

    // total sessions this week
    const [sessionsResult] = await db.query(
      `SELECT COUNT(*) as total_sessions
       FROM study_sessions
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [user_id]
    )

    // top subject this week
    const [topSubject] = await db.query(
      `SELECT s.name, SUM(ss.duration_minutes) as total
       FROM study_sessions ss
       LEFT JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.user_id = ? AND ss.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY s.name
       ORDER BY total DESC
       LIMIT 1`,
      [user_id]
    )

    // sessions per day this week
    const [dailyData] = await db.query(
      `SELECT DATE(created_at) as date, SUM(duration_minutes) as total_minutes
       FROM study_sessions
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [user_id]
    )

    // streak calculator
    const [allSessions] = await db.query(
      `SELECT DISTINCT DATE(created_at) as study_date
      FROM study_sessions
      WHERE user_id = ?
      ORDER BY study_date DESC`,
      [user_id]
    )

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < allSessions.length; i++) {
      const sessionDate = new Date(allSessions[i].study_date)
      sessionDate.setHours(0, 0, 0, 0)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    } 

    res.json({
      total_minutes: hoursResult[0].total_minutes,
      total_hours: (hoursResult[0].total_minutes / 60).toFixed(1),
      total_sessions: sessionsResult[0].total_sessions,
      top_subject: topSubject[0]?.name || 'None',
      daily_data: dailyData,
      streak: streak
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

export default router