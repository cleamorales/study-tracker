import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'

function SessionLogger() {
  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState('')
  const [focusRating, setFocusRating] = useState(3)
  const [mood, setMood] = useState('neutral')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.post('/sessions', {
        subject,
        duration_minutes: parseInt(duration),
        focus_rating: focusRating,
        mood,
        notes
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const moodEmojis = {
    great: '😄',
    good: '🙂',
    neutral: '😐',
    tired: '😴',
    stressed: '😰'
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <div className="topbar">
          <h1 className="page-title">Log study session</h1>
        </div>

        <div style={{ maxWidth: 560 }}>
          <div className="card">
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Data Structures, React, Math"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 60"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Focus rating — {focusRating}/5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={focusRating}
                  onChange={(e) => setFocusRating(parseInt(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div className="form-group">
                <label>Mood</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {['great', 'good', 'neutral', 'tired', 'stressed'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 8,
                        border: mood === m ? '1.5px solid #7c3aed' : '0.5px solid #e8e6f9',
                        background: mood === m ? '#f3f0ff' : '#fff',
                        cursor: 'pointer',
                        fontSize: 11,
                        color: mood === m ? '#7c3aed' : '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{moodEmojis[m]}</span>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you study? Any challenges or wins?"
                  rows="4"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save session
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionLogger