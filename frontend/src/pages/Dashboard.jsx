import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          api.get('/sessions/stats'),
          api.get('/sessions')
        ])
        setStats(statsRes.data)
        setSessions(sessionsRes.data)
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const moodColors = {
    great: '#22c55e',
    good: '#a78bfa',
    neutral: '#64748b',
    tired: '#f59e0b',
    stressed: '#ef4444'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#94a3b8' }}>Loading...</p>
    </div>
  )

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Hours this week</div>
            <div className="stat-value">{stats?.total_hours}h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sessions this week</div>
            <div className="stat-value">{stats?.total_sessions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top subject</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{stats?.top_subject}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total minutes</div>
            <div className="stat-value">{stats?.total_minutes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Streak</div>
            <div className="stat-value">{stats?.streak} days</div>
            <div className="stat-sub">Keep it up!</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">Recent sessions</div>
            {sessions.length === 0 ? (
              <p style={{ fontSize: 14, color: '#94a3b8' }}>No sessions yet. Start studying!</p>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="session-item">
                  <div
                    className="session-dot"
                    style={{ background: moodColors[session.mood] || '#94a3b8' }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <div className="session-name">{session.subject_name}</div>
                    <div className="session-meta">
                      {session.duration_minutes} min · {session.mood} · {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: session.focus_rating >= 4 ? '#22c55e' : session.focus_rating === 3 ? '#f59e0b' : '#ef4444' }}>
                    {session.focus_rating}/5
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div className="card-title">Quick actions</div>
            <Link to="/log" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%', marginBottom: 12 }}>
                + Log new session
              </button>
            </Link>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Track your study sessions to unlock AI-powered insights and predictions about your productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard