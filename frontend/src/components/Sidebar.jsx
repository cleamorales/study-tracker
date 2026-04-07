import { Link, useLocation, useNavigate } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  function isActive(path) {
    return location.pathname === path ? 'nav-item active' : 'nav-item'
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-dot"></div>
        StudyTrack
      </div>

      <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
      <Link to="/log" className={isActive('/log')}>Log session</Link>

      <div style={{ flex: 1 }}></div>

      <div style={{ padding: '12px', borderTop: '0.5px solid #e8e6f9', marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1b4b', marginBottom: 4 }}>
          {user?.name}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ width: '100%', fontSize: 13, padding: '7px 12px', color: '#ef4444', borderColor: '#fecaca' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar