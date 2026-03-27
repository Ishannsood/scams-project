import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const acts = await api.getActivities();
        setActivities(acts);
        if (user.role === 'member') {
          const regs = await api.getMyRegistrations();
          setMyRegs(regs);
        }
        if (user.role === 'executive' || user.role === 'advisor') {
          const s = await api.getSummary();
          setSummary(s);
        }
      } finally { setLoading(false); }
    };
    load();
  }, [user.role]);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  const upcoming = activities.filter(a => new Date(a.date) >= new Date()).slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Here's what's happening in your clubs.</p>
      </div>

      {/* Overview stats */}
      {(user.role === 'executive' || user.role === 'advisor') && summary && (
        <>
          <div className="grid-4 mb-4">
            <div className="stat-card">
              <div className="stat-value">{summary.overview.totalActivities}</div>
              <div className="stat-label">Activities</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.overview.totalMembers}</div>
              <div className="stat-label">Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.overview.totalRegistrations}</div>
              <div className="stat-label">Registrations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.overview.totalAttendance}</div>
              <div className="stat-label">Attendances</div>
            </div>
          </div>
        </>
      )}

      {user.role === 'member' && (
        <div className="grid-3 mb-4">
          <div className="stat-card">
            <div className="stat-value">{activities.length}</div>
            <div className="stat-label">Total Activities</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{myRegs.length}</div>
            <div className="stat-label">My Registrations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
      )}

      {/* Upcoming activities */}
      <div className="flex-between mb-4">
        <h2 style={{fontWeight:700, fontSize:'1.05rem'}}>Upcoming Activities</h2>
        <Link to="/activities" className="btn btn-outline btn-sm">View All</Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty"><div className="empty-icon">📅</div><h3>No upcoming activities</h3></div>
      ) : (
        <div className="grid-2">
          {upcoming.map(a => {
            const isRegistered = myRegs.some(r => r.activityId === a.id);
            const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
            return (
              <div className="activity-card" key={a.id}>
                <h3>{a.title}</h3>
                <div className="meta">
                  <span>📅 {new Date(a.date).toLocaleDateString('en-CA', {month:'short',day:'numeric',year:'numeric'})}</span>
                  <span>🕐 {a.time || 'TBD'}</span>
                  <span>📍 {a.location}</span>
                </div>
                <p className="desc">{a.description || 'No description provided.'}</p>
                <div style={{fontSize:'12px', color:'var(--gray-600)'}}>
                  {a.registeredCount} / {a.maxCapacity} registered
                  <div className="cap-bar" style={{marginTop:'4px'}}>
                    <div className={`cap-bar-fill${pct>=100?' full':''}`} style={{width:`${Math.min(pct,100)}%`}} />
                  </div>
                </div>
                <div className="actions">
                  <Link to="/activities" className="btn btn-outline btn-sm">Details</Link>
                  {isRegistered && <span className="badge badge-success">✓ Registered</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick links for exec/advisor */}
      {(user.role === 'executive' || user.role === 'advisor') && (
        <div className="card mt-4">
          <div className="card-title">Quick Actions</div>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <Link to="/manage" className="btn btn-primary">➕ Create Activity</Link>
            <Link to="/attendance" className="btn btn-outline">✅ Mark Attendance</Link>
            <Link to="/reports" className="btn btn-outline">📊 View Reports</Link>
          </div>
        </div>
      )}
    </div>
  );
}
