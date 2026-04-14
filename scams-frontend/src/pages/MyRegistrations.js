import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const data = await api.getMyRegistrations();
    setRegs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleUnregister = async (activityId) => {
    try { await api.unregister(activityId); flash('Unregistered successfully.'); load(); }
    catch (e) { flash('❌ ' + e.message); }
  };

  if (loading) return <div className="loading">Loading your registrations…</div>;

  const upcoming = regs.filter(r => r.activity && new Date(r.activity.date) >= new Date());
  const past = regs.filter(r => r.activity && new Date(r.activity.date) < new Date());

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>You are registered for <strong>{regs.length}</strong> activit{regs.length !== 1 ? 'ies' : 'y'}.</p>
      </div>

      {msg && <div className={`alert ${msg.startsWith('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {regs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No registrations yet</h3>
          <p>Browse Activities to sign up for events.</p>
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
