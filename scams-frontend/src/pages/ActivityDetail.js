import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

const STATUS_THEME = {
  open: { gradient: 'linear-gradient(135deg,#065f46 0%,#059669 55%,#34d399 100%)', badge: '#d1fae5', badgeText: '#065f46', label: 'Open' },
  full: { gradient: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 55%,#f87171 100%)', badge: '#fee2e2', badgeText: '#7f1d1d', label: 'Full' },
  past: { gradient: 'linear-gradient(135deg,#1e293b 0%,#334155 55%,#64748b 100%)', badge: '#f1f5f9', badgeText: '#334155', label: 'Past'  },
};

export default function ActivityDetail() {
  const { id }     = useParams();
  const { user }   = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();
  const [activity, setActivity]     = useState(null);
  const [isRegistered, setIsReg]    = useState(false);
  const [isWaiting,    setIsWaiting] = useState(false);
  const [loading, setLoading]       = useState(true);

  const load = async () => {
    try {
      const act = await api.getActivity(id);
      setActivity(act);
      if (user.role === 'member') {
        const [regs, wl] = await Promise.all([api.getMyRegistrations(), api.getMyWaitlist()]);
        setIsReg(regs.some(r => r.activityId === id));
        setIsWaiting(wl.some(w => w.activityId === id));
      }
    } catch { navigate('/activities'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleRegister   = async () => {
    try { await api.joinActivity(id);  toast('Registered successfully!');         load(); }
    catch (e) { toast(e.message, 'error'); }
  };
  const handleUnregister   = async () => {
    try { await api.unregister(id);    toast('Unregistered from activity.','info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };
  const handleJoinWaitlist = async () => {
    try { await api.joinWaitlist(id);  toast('Added to waitlist!');                 load(); }
    catch (e) { toast(e.message, 'error'); }
  };
  const handleLeaveWaitlist = async () => {
    try { await api.leaveWaitlist(id); toast('Removed from waitlist.','info');       load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  if (loading) return <div className="loading">Loading activity…</div>;
  if (!activity) return null;

  const isPast  = new Date(activity.date) < new Date();
  const isFull  = activity.registeredCount >= activity.maxCapacity;
  const pct     = Math.round((activity.registeredCount / activity.maxCapacity) * 100);
  const status  = isPast ? 'past' : isFull ? 'full' : 'open';
  const theme   = STATUS_THEME[status];

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <Link to="/activities" className="btn btn-ghost btn-sm">← Back to Activities</Link>
      </div>

      {/* ── Hero header ── */}
      <div style={{
        background: theme.gradient,
        borderRadius: 20, padding: '36px 36px 32px',
        marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}>
        {/* dot texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 20%, transparent 100%)',
        }} />
        {/* glow blob */}
        <div style={{
          position: 'absolute', bottom: '-60%', right: '-5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Status + organizer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              background: theme.badge, color: theme.badgeText,
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 999,
            }}>
              {theme.label}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Organised by {activity.creatorName}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.15, color: '#fff', marginBottom: 20,
            textShadow: '0 1px 8px rgba(0,0,0,0.2)',
          }}>
            {activity.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {[
              { icon: '📅', value: new Date(activity.date).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
              { icon: '🕐', value: activity.time || 'Time TBD' },
              { icon: '📍', value: activity.location },
            ].map(m => (
              <div key={m.icon} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left — description */}
        <div className="card">
          {activity.description ? (
            <>
              <div className="card-title">About this Activity</div>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.75, fontSize: 14 }}>
                {activity.description}
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--gray-400)', fontSize: 14, fontStyle: 'italic' }}>
              No description provided.
            </p>
          )}

          {/* Member registration CTA */}
          {user.role === 'member' && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
              {isPast ? (
                <div style={{
                  padding: '12px 16px', background: 'var(--gray-100)',
                  borderRadius: 8, fontSize: 13, color: 'var(--gray-500)', fontWeight: 500,
                }}>
                  This activity has already taken place.
                </div>
              ) : isWaiting ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  background: '#fffbeb', borderRadius: 10, border: '1.5px solid #fde68a',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>⏳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: 13 }}>You're on the waitlist</div>
                    <div style={{ fontSize: 12, color: '#92400e', marginTop: 1 }}>
                      You'll be automatically registered if a spot opens up.
                      {activity.waitlistCount > 1 && ` (${activity.waitlistCount} people waiting)`}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleLeaveWaitlist}>Leave</button>
                </div>
              ) : isRegistered ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  background: '#f0fdf4', borderRadius: 10, border: '1.5px solid #bbf7d0',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 13 }}>You're registered!</div>
                    <div style={{ fontSize: 12, color: '#047857', marginTop: 1 }}>See you there.</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleUnregister}>Unregister</button>
                </div>
              ) : isFull ? (
                <button className="btn btn-lg" onClick={handleJoinWaitlist} style={{
                  width: '100%', background: 'var(--warning)', color: '#fff',
                  boxShadow: '0 4px 14px rgba(217,119,6,0.3)',
                }}>
                  ⏳ Join Waitlist{activity.waitlistCount > 0 ? ` · ${activity.waitlistCount} waiting` : ''}
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={handleRegister} style={{ width: '100%' }}>
                  ✅ Register for this Activity
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right — capacity + details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Capacity card */}
          <div className="card">
            <div className="card-title">Capacity</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: pct >= 100 ? 'var(--danger)' : 'var(--primary)' }}>
                {activity.registeredCount}
              </span>
              <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>
                of {activity.maxCapacity}
              </span>
            </div>
            <div className="cap-bar" style={{ height: 8, marginBottom: 6 }}>
              <div className={`cap-bar-fill${pct >= 100 ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>
              {pct >= 100 ? 'No spots remaining' : `${activity.maxCapacity - activity.registeredCount} spots remaining`} · {pct}% filled
            </div>
          </div>

          {/* Quick info card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Date',      value: new Date(activity.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) },
              { label: 'Time',      value: activity.time || 'TBD' },
              { label: 'Location',  value: activity.location },
              { label: 'Organizer', value: activity.creatorName },
            ].map(item => (
              <div key={item.label} className="detail-item">
                <span className="detail-label">{item.label}</span>
                <span className="detail-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Exec participant table ── */}
      {(user.role === 'executive' || user.role === 'advisor') && (
        <div className="card mt-4" style={{ padding: 0, marginTop: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
            Registered Participants
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: 'var(--gray-500)' }}>
              ({activity.participants?.length ?? 0})
            </span>
          </div>
          {activity.participants?.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Registered</th></tr>
                </thead>
                <tbody>
                  {activity.participants.map(p => (
                    <tr key={p.userId}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{p.email}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                        {new Date(p.registeredAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty" style={{ padding: 32 }}>
              <div className="empty-icon">👥</div>
              <h3>No registrations yet</h3>
              <p>Nobody has signed up for this activity.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
