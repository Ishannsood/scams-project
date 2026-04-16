import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function MyRegistrations() {
  const toast = useToast();
  const [regs,     setRegs]     = useState([]);
  const [waitlisted, setWaitlisted] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [countdown, setCountdown] = useState(0);

  const load = async () => {
    setLoading(true); setError(null); setCountdown(0);
    try {
      const [data, wl] = await Promise.all([api.getMyRegistrations(), api.getMyWaitlist()]);
      setRegs(data);
      setWaitlisted(wl);
    } catch (e) {
      setError(e.message || 'Failed to load.');
      if (e.message === 'COLD_START') {
        let t = 55; setCountdown(t);
        const iv = setInterval(() => { t -= 1; setCountdown(t); if (t <= 0) { clearInterval(iv); load(); } }, 1000);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUnregister = async (activityId) => {
    try { await api.unregister(activityId); toast('Unregistered successfully.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const handleLeaveWaitlist = async (activityId) => {
    try { await api.leaveWaitlist(activityId); toast('Removed from waitlist.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const upcoming = regs.filter(r => r.activity && new Date(r.activity.date) >= new Date());
  const past = regs.filter(r => r.activity && new Date(r.activity.date) < new Date());

  if (error) return (
    <div className="page">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', textAlign:'center', gap:16 }}>
        {error === 'COLD_START' ? (
          <>
            <div style={{ fontSize:'2.5rem' }}>⏳</div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Server is waking up…</h3>
            <p style={{ fontSize:13, color:'var(--gray-500)', maxWidth:340 }}>The free server spins down after inactivity. It'll be ready in about a minute.</p>
            <div style={{ width:64, height:64, borderRadius:'50%', border:'4px solid var(--gray-200)', borderTopColor:'var(--primary)', animation:'spin 1s linear infinite' }} />
            <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.04em' }}>{countdown}s</p>
            <p style={{ fontSize:12, color:'var(--gray-400)' }}>Retrying automatically…</p>
            <button className="btn btn-ghost btn-sm" onClick={load}>Retry now</button>
          </>
        ) : (
          <>
            <div style={{ fontSize:'2.5rem' }}>⚠️</div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Could not load registrations</h3>
            <p style={{ fontSize:12, color:'var(--gray-400)', fontFamily:'monospace', background:'var(--gray-100)', padding:'6px 12px', borderRadius:6 }}>{error}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="page">
      <div className="grid-3 mb-4">
        {[1,2,3].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-stat" />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
      <div className="grid-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>Track your upcoming and past activity registrations.</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{regs.length}</div>
          <div className="stat-label">Total Registered</div>
        </div>
        <div className="stat-card stat-warning" style={{ display: waitlisted.length === 0 ? 'none' : undefined }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{waitlisted.length}</div>
          <div className="stat-label">On Waitlist</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">🗓</div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">⏮</div>
          <div className="stat-value">{past.length}</div>
          <div className="stat-label">Past</div>
        </div>
      </div>


      {regs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No registrations yet</h3>
          <p>Browse available activities and sign up for ones you'd like to attend.</p>
          <div style={{ marginTop: 20 }}>
            <Link to="/activities" className="btn btn-primary">Browse Activities</Link>
          </div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <div className="section-label">Upcoming ({upcoming.length})</div>
              <div className="grid-2 mb-4">
                {upcoming.map(r => (
                  <div className="activity-card status-open" key={r.id}>
                    <div className="flex-between">
                      <h3>{r.activity.title}</h3>
                      <span className="badge badge-success">Upcoming</span>
                    </div>
                    <div className="meta">
                      <span>📅 {new Date(r.activity.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>🕐 {r.activity.time || 'TBD'}</span>
                      <span>📍 {r.activity.location}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '11px' }}>
                      Registered on {new Date(r.registeredAt).toLocaleDateString()}
                    </p>
                    <div className="actions">
                      <Link to={`/activities/${r.activityId}`} className="btn btn-outline btn-sm">Details</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleUnregister(r.activityId)}>
                        Unregister
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {waitlisted.length > 0 && (
            <>
              <div className="section-label">Waitlisted ({waitlisted.length})</div>
              <div className="grid-2 mb-4">
                {waitlisted.map(w => (
                  <div className="activity-card" key={w.id} style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="flex-between">
                      <h3>{w.activity?.title || 'Unknown Activity'}</h3>
                      <span className="badge badge-warning">#{w.position} in queue</span>
                    </div>
                    <div className="meta">
                      <span>📅 {w.activity ? new Date(w.activity.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}</span>
                      <span>📍 {w.activity?.location || '—'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      You'll be automatically registered if a spot opens up.
                    </p>
                    <div className="actions">
                      <Link to={`/activities/${w.activityId}`} className="btn btn-outline btn-sm">Details</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleLeaveWaitlist(w.activityId)}>
                        Leave Waitlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <div className="section-label">Past ({past.length})</div>
              <div className="grid-2">
                {past.map(r => (
                  <div className="activity-card status-past" key={r.id}>
                    <div className="flex-between">
                      <h3>{r.activity.title}</h3>
                      <span className="badge badge-warning">Past</span>
                    </div>
                    <div className="meta">
                      <span>📅 {new Date(r.activity.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>📍 {r.activity.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
