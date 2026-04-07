import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }}></div>
          StudyTrack
        </div>
        <p className="auth-subtitle">Create an account to start tracking.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register