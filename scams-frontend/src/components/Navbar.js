import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setOpen(false);

  const isAdmin = user?.role === 'executive' || user?.role === 'advisor';

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand" onClick={close}>
        SCAMS <span>Student Club Management</span>
      </NavLink>

      {/* Desktop nav */}
      <div className="navbar-nav navbar-nav-desktop">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/activities">Activities</NavLink>
        <NavLink to="/announcements">Announcements</NavLink>
        {isAdmin && (
          <>
            <NavLink to="/manage">Manage</NavLink>
            <NavLink to="/members">Members</NavLink>
            <NavLink to="/attendance">Attendance</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </>
        )}
        {user?.role === 'member' && (
          <>
            <NavLink to="/my-registrations">My Registrations</NavLink>
            <NavLink to="/attendance-history">My Attendance</NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        <div className="user-chip navbar-user-chip-desktop">
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          <span>{user?.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm navbar-logout-desktop" onClick={handleLogout} style={{ color: 'var(--gray-500)' }}>Sign out</button>

        {/* Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line${open ? ' open' : ''}`} />
          <span className={`hamburger-line${open ? ' open' : ''}`} />
          <span className={`hamburger-line${open ? ' open' : ''}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-user">
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <span style={{ fontWeight: 500 }}>{user?.name}</span>
          </div>
          <NavLink to="/dashboard"         onClick={close}>Dashboard</NavLink>
          <NavLink to="/activities"        onClick={close}>Activities</NavLink>
          <NavLink to="/announcements"     onClick={close}>Announcements</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/manage"     onClick={close}>Manage</NavLink>
              <NavLink to="/members"    onClick={close}>Members</NavLink>
              <NavLink to="/attendance" onClick={close}>Attendance</NavLink>
              <NavLink to="/reports"    onClick={close}>Reports</NavLink>
            </>
          )}
          {user?.role === 'member' && (
            <>
              <NavLink to="/my-registrations"  onClick={close}>My Registrations</NavLink>
              <NavLink to="/attendance-history" onClick={close}>My Attendance</NavLink>
            </>
          )}
          <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
