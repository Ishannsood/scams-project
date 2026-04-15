import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function ActivityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const act = await api.getActivity(id);
      setActivity(act);
      if (user.role === 'member') {
        const regs = await api.getMyRegistrations();
        setIsRegistered(regs.some(r => r.activityId === id));
      }
    } catch {
      navigate('/activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleRegister = async () => {
    try { await api.joinActivity(id); toast('Registered successfully!'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const handleUnregister = async () => {
    try { await api.unregister(id); toast('Unregistered from activity.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <div className="loading">Loading activity…</div>;
  if (!activity) return null;

  const isPast = new Date(activity.date) < new Date();
  const isFull = activity.registeredCount >= activity.maxCapacity;
  const pct = Math.round((activity.registeredCount / activity.maxCapacity) * 100);

  return (
    <div className="page">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/activities" className="btn btn-ghost btn-sm">← Back to Activities</Link>
      </div>


      <div className="card mb-4">
        {/* Title row */}
        <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 20 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{activity.title}</h1>
          <span style={{ flexShrink: 0, marginLeft: 12 }}>
            {isPast
              ? <span className="badge badge-warning">Past</span>
              : isFull
              ? <span className="badge badge-danger">Full</span>
              : <span className="badge badge-success">Open</span>}
          </span>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20, padding: '16px 0', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
          {[
            { label: '📅 Date', value: new Date(activity.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: '🕐 Time', value: activity.time || 'TBD' },
            { label: '📍 Location', value: activity.location },
            { label: '👤 Organizer', value: activity.creatorName },
          ].map(item => (
            <div key={item.label} className="detail-item">
              <span className="detail-label">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {activity.description && (
          <div style={{ marginBottom: 20 }}>
            <div className="detail-label" style={{ marginBottom: 6 }}>About this Activity</div>
            <p style={{ color: 'var(--gray-700)', lineHeight: 1.7, fontSize: '14px' }}>{activity.description}</p>
          </div>
        )}

        {/* Capacity */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex-between" style={{ marginBottom: 6 }}>
            <span className="detail-label">Capacity</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: pct >= 100 ? 'var(--danger)' : 'var(--gray-600)' }}>
              {activity.registeredCount} / {activity.maxCapacity} spots · {pct}% filled
            </span>
          </div>
          <div className="cap-bar" style={{ height: 8 }}>
            <div className={`cap-bar-fill${pct >= 100 ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        {/* Registration CTA */}
        {user.role === 'member' && !isPast && (
          <div style={{ paddingTop: 4 }}>
            {isRegistered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--success-light)', borderRadius: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '13px' }}>You're registered!</div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>See you there.</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleUnregister}>Unregister</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleRegister} disabled={isFull} style={{ width: '100%' }}>
                {isFull ? '🚫 Activity is Full' : '✅ Register for this Activity'}
              </button>
            )}
          </div>
        )}
        {user.role === 'member' && isPast && (
          <div style={{ padding: '10px 16px', background: 'var(--gray-100)', borderRadius: 8, fontSize: '13px', color: 'var(--gray-500)', fontWeight: 500 }}>
            This activity has already taken place.
          </div>
        )}
      </div>

      {(user.role === 'executive' || user.role === 'advisor') && activity.participants?.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600, fontSize: '14px' }}>
            Registered Participants ({activity.participants.length})
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {activity.participants.map(p => (
                  <tr key={p.userId}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{p.email}</td>
                    <td style={{ color: 'var(--gray-600)', fontSize: '12px' }}>
                      {new Date(p.registeredAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(user.role === 'executive' || user.role === 'advisor') && (!activity.participants || activity.participants.length === 0) && (
        <div className="card">
          <div className="empty" style={{ padding: '24px' }}>
            <div className="empty-icon">👥</div>
            <h3>No registrations yet</h3>
            <p>Nobody has signed up for this activity.</p>
          </div>
        </div>
      )}
    </div>
  );
}
