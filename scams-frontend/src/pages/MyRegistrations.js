import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function MyRegistrations() {
  const toast = useToast();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await api.getMyRegistrations();
    setRegs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUnregister = async (activityId) => {
    try { await api.unregister(activityId); toast('Unregistered successfully.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const upcoming = regs.filter(r => r.activity && new Date(r.activity.date) >= new Date());
  const past = regs.filter(r => r.activity && new Date(r.activity.date) < new Date());

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
