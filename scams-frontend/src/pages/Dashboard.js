import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [acts, anns] = await Promise.all([api.getActivities(), api.getAnnouncements()]);
        setActivities(acts);
        setLatestAnnouncement(anns[0] || null);
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

  const allUpcoming = activities.filter(a => new Date(a.date) >= new Date());
  const upcoming = allUpcoming.slice(0, 3);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">

      {/* Hero banner */}
      <div className="page-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>{greeting()}, {user.name.split(' ')[0]} 👋</h1>
            <p>Here's what's happening in your club today.</p>
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.3)',
            flexShrink: 0,
          }}>
            {{ member: 'Member', executive: 'Executive', advisor: 'Advisor' }[user.role]}
          </span>
        </div>
        {(user.role === 'executive' || user.role === 'advisor') && (
          <div className="hero-actions">
            <Link to="/manage" className="btn-hero btn-hero-white">➕ New Activity</Link>
            <Link to="/attendance" className="btn-hero btn-hero-outline">✅ Attendance</Link>
            <Link to="/reports" className="btn-hero btn-hero-outline">📊 Reports</Link>
          </div>
        )}
        {user.role === 'member' && (
          <div className="hero-actions">
            <Link to="/activities" className="btn-hero btn-hero-white">Browse Activities</Link>
            <Link to="/my-registrations" className="btn-hero btn-hero-outline">My Registrations</Link>
          </div>
        )}
      </div>

      {/* Exec / Advisor stats */}
      {(user.role === 'executive' || user.role === 'advisor') && summary && (
        <div className="grid-4 mb-4">
          <div className="stat-card stat-primary">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{summary.overview.totalActivities}</div>
            <div className="stat-label">Activities</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{summary.overview.totalMembers}</div>
            <div className="stat-label">Members</div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">🎫</div>
            <div className="stat-value">{summary.overview.totalRegistrations}</div>
            <div className="stat-label">Registrations</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{summary.overview.totalAttendance}</div>
            <div className="stat-label">Attendances</div>
          </div>
        </div>
      )}

      {/* Member stats */}
      {user.role === 'member' && (
        <div className="grid-3 mb-4">
          <div className="stat-card stat-primary">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{activities.length}</div>
            <div className="stat-label">Total Activities</div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">🎫</div>
            <div className="stat-value">{myRegs.length}</div>
            <div className="stat-label">Registered</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">🗓</div>
            <div className="stat-value">{allUpcoming.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
      )}

      {/* Latest announcement */}
      {latestAnnouncement && (
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: '6px' }}>
              {latestAnnouncement.pinned ? '📌 Pinned Announcement' : '📢 Latest Announcement'}
            </div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{latestAnnouncement.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.55 }}>{latestAnnouncement.content}</div>
          </div>
          <Link to="/announcements" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>View All</Link>
        </div>
      )}

      {/* Upcoming activities */}
      <div className="flex-between mb-4">
        <div className="section-label" style={{ margin: 0 }}>Upcoming Activities</div>
        <Link to="/activities" className="btn btn-outline btn-sm">View All</Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📅</span>
          <h3>No upcoming activities</h3>
          <p>Check back later for new events.</p>
        </div>
      ) : (
        <div className="grid-2">
          {upcoming.map(a => {
            const isRegistered = myRegs.some(r => r.activityId === a.id);
            const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
            const isFull = a.registeredCount >= a.maxCapacity;
            return (
              <div className={`activity-card ${isFull ? 'status-full' : 'status-open'}`} key={a.id}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <h3>{a.title}</h3>
                  {isFull
                    ? <span className="badge badge-danger">Full</span>
                    : <span className="badge badge-success">Open</span>}
                </div>
                <div className="meta">
                  <span>📅 {new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>🕐 {a.time || 'TBD'}</span>
                  <span>📍 {a.location}</span>
                </div>
                <p className="desc">{a.description || 'No description provided.'}</p>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                  {a.registeredCount} / {a.maxCapacity} registered
                  <div className="cap-bar" style={{ marginTop: '5px' }}>
                    <div className={`cap-bar-fill${pct >= 100 ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                <div className="actions">
                  <Link to={`/activities/${a.id}`} className="btn btn-outline btn-sm">View Details</Link>
                  {isRegistered && <span className="badge badge-success">✓ Registered</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
