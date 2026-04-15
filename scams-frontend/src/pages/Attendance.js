import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function Attendance() {
  const toast = useToast();
  const [activities,    setActivities]    = useState([]);
  const [selected,      setSelected]      = useState(null); // full activity object
  const [attendanceData, setAttData]      = useState(null);
  const [loadingActs,   setLoadingActs]   = useState(true);
  const [loadingAtt,    setLoadingAtt]    = useState(false);
  const [search,        setSearch]        = useState('');

  useEffect(() => {
    api.getActivities().then(data => {
      // Sort: past first (most relevant for marking), then upcoming
      const sorted = [...data].sort((a, b) => {
        const aPast = new Date(a.date) < new Date();
        const bPast = new Date(b.date) < new Date();
        if (aPast && !bPast) return -1;
        if (!aPast && bPast) return  1;
        return new Date(b.date) - new Date(a.date);
      });
      setActivities(sorted);
      setLoadingActs(false);
    });
  }, []);

  const selectActivity = async (act) => {
    if (selected?.id === act.id) return;
    setSelected(act);
    setAttData(null);
    setLoadingAtt(true);
    try {
      const data = await api.getAttendance(act.id);
      setAttData(data);
    } catch (e) { console.error(e); }
    finally { setLoadingAtt(false); }
  };

  const reload = async () => {
    if (!selected) return;
    const data = await api.getAttendance(selected.id);
    setAttData(data);
  };

  const toggle = async (userId, currentlyAttended) => {
    try {
      await api.markAttendance(selected.id, { userId, present: !currentlyAttended });
      toast(currentlyAttended ? 'Attendance removed.' : 'Marked present!', currentlyAttended ? 'info' : 'success');
      reload();
    } catch (e) { toast(e.message, 'error'); }
  };

  const markAll = async () => {
    if (!attendanceData) return;
    const absent = attendanceData.attendance.filter(a => !a.attended);
    for (const a of absent) await api.markAttendance(selected.id, { userId: a.userId, present: true });
    toast(`Marked ${absent.length} member${absent.length !== 1 ? 's' : ''} present!`);
    reload();
  };

  if (loadingActs) return <div className="loading">Loading activities…</div>;

  const attended = attendanceData?.attendance?.filter(a => a.attended).length ?? 0;
  const total    = attendanceData?.attendance?.length ?? 0;
  const rate     = total > 0 ? Math.round((attended / total) * 100) : 0;

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1>Attendance Tracking</h1>
          <p>Select an activity to mark attendance for registered members.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left panel: activity list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search activities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px',
              border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontFamily: 'var(--font)', background: '#fff',
              outline: 'none', color: 'var(--gray-900)',
            }}
          />

          {/* Activity cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 520, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                No activities found
              </div>
            )}
            {filtered.map(a => {
              const isPast    = new Date(a.date) < new Date();
              const isActive  = selected?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => selectActivity(a)}
                  style={{
                    textAlign: 'left', padding: '12px 14px',
                    borderRadius: 'var(--radius)', cursor: 'pointer',
                    border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: isActive ? 'var(--primary-light)' : '#fff',
                    transition: 'all 0.15s', fontFamily: 'var(--font)',
                    boxShadow: isActive ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: isActive ? 'var(--primary)' : 'var(--gray-900)',
                      lineHeight: 1.3,
                    }}>{a.title}</div>
                    <span style={{
                      fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '2px 7px', borderRadius: 999, flexShrink: 0,
                      background: isPast ? 'var(--gray-100)' : 'var(--success-light)',
                      color: isPast ? 'var(--gray-500)' : 'var(--success)',
                    }}>{isPast ? 'Past' : 'Upcoming'}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 5 }}>
                    📅 {new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}{a.registeredCount} registered
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right panel: attendance sheet ── */}
        <div>
          {/* Empty prompt */}
          {!selected && (
            <div className="card">
              <div className="empty" style={{ padding: '56px 24px' }}>
                <div className="empty-icon">📋</div>
                <h3>Select an activity</h3>
                <p>Choose an activity from the list to view and mark attendance.</p>
              </div>
            </div>
          )}

          {selected && loadingAtt && <div className="loading">Loading attendance…</div>}

          {selected && !loadingAtt && attendanceData && (
            <>
              {/* Stats row */}
              <div className="grid-3 mb-4">
                <div className="stat-card stat-primary">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{total}</div>
                  <div className="stat-label">Registered</div>
                </div>
                <div className="stat-card stat-success">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{attended}</div>
                  <div className="stat-label">Present</div>
                </div>
                <div className="stat-card stat-warning">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-value">{total - attended}</div>
                  <div className="stat-label">Absent</div>
                </div>
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div className="card mb-4" style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>
                    <span>Attendance Rate</span>
                    <span style={{ color: rate >= 70 ? 'var(--success)' : 'var(--warning)' }}>{rate}%</span>
                  </div>
                  <div className="cap-bar" style={{ height: 8 }}>
                    <div className="cap-bar-fill" style={{
                      width: `${rate}%`,
                      background: rate >= 70
                        ? 'linear-gradient(90deg,var(--success),#34d399)'
                        : 'linear-gradient(90deg,var(--warning),#fbbf24)',
                    }} />
                  </div>
                </div>
              )}

              {/* Attendance table */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                      {attendanceData.activity.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Attendance Sheet</div>
                  </div>
                  {total > attended && (
                    <button className="btn btn-success btn-sm" onClick={markAll}>✅ Mark All Present</button>
                  )}
                </div>

                {total === 0 ? (
                  <div className="empty" style={{ padding: 36 }}>
                    <div className="empty-icon">👥</div>
                    <h3>No registrations yet</h3>
                    <p>Nobody has registered for this activity.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...attendanceData.attendance]
                          .sort((a, b) => (b.attended ? 1 : 0) - (a.attended ? 1 : 0))
                          .map(a => {
                            const initials = a.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
                            return (
                              <tr key={a.userId} style={{ background: a.attended ? '#f0fdf4' : 'transparent' }}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                      background: a.attended ? 'var(--success-light)' : 'var(--gray-100)',
                                      color: a.attended ? 'var(--success)' : 'var(--gray-500)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: 11, fontWeight: 800,
                                    }}>{initials}</div>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</span>
                                  </div>
                                </td>
                                <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{a.email}</td>
                                <td>
                                  {a.attended
                                    ? <span className="badge badge-success">✓ Present</span>
                                    : <span className="badge badge-danger">✗ Absent</span>}
                                </td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${a.attended ? 'btn-ghost' : 'btn-success'}`}
                                    onClick={() => toggle(a.userId, a.attended)}
                                  >
                                    {a.attended ? 'Unmark' : 'Mark Present'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
