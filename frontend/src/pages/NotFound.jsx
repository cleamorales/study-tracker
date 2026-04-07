import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="sidebar-logo-dot"></div>
          StudyTrack
        </div>

        <div style={{ fontSize: 64, fontWeight: 600, color: '#7c3aed', margin: '16px 0 8px' }}>
          404
        </div>

        <p style={{ fontSize: 16, fontWeight: 500, color: '#1e1b4b', marginBottom: 8 }}>
          Page not found
        </p>

        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%' }}>
            Back to dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound