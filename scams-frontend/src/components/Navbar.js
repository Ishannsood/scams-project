import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        SCAMS <span>Student Club Management</span>
      </NavLink>

      <div className="navbar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/activities">Activities</NavLink>
        {(user?.role === 'executive' || user?.role === 'advisor') && (
          <>
            <NavLink to="/manage">Manage</NavLink>
            <NavLink to="/attendance">Attendance</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </>
        )}
        {user?.role === 'member' && (
          <NavLink to="/my-registrations">My Registrations</NavLink>
        )}
      </div>

      <div className="navbar-right">
        <div className="user-chip">
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          <span>{user?.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
