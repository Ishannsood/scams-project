import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function Attendance() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingActs, setLoadingActs] = useState(true);
  const [loadingAtt, setLoadingAtt] = useState(false);

  useEffect(() => {
    api.getActivities().then(data => { setActivities(data); setLoadingActs(false); });
  }, []);

  const loadAttendance = async (actId) => {
    if (!actId) return;
    setLoadingAtt(true);
    try {
      const data = await api.getAttendance(actId);
      setAttendanceData(data);
    } catch (e) { console.error(e); }
    finally { setLoadingAtt(false); }
  };

  const handleSelect = (e) => {
    setSelected(e.target.value);
    setAttendanceData(null);
    loadAttendance(e.target.value);
  };

  const toggleAttendance = async (userId, currentlyAttended) => {
    try {
      await api.markAttendance(selected, { userId, present: !currentlyAttended });
      toast(currentlyAttended ? 'Attendance removed.' : 'Attendance marked!', currentlyAttended ? 'info' : 'success');
      loadAttendance(selected);
    } catch (e) { toast(e.message, 'error'); }
  };

  const markAll = async () => {
    if (!attendanceData) return;
    const unattended = attendanceData.attendance.filter(a => !a.attended);
    for (const a of unattended) {
      await api.markAttendance(selected, { userId: a.userId, present: true });
    }
    toast(`Marked ${unattended.length} attendees present!`);
    loadAttendance(selected);
  };

  if (loadingActs) return <div className="loading">Loading…</div>;

  const attended = attendanceData?.attendance?.filter(a => a.attended).length || 0;
  const total = attendanceData?.attendance?.length || 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance Tracking</h1>
        <p>Select an activity to mark attendance for registered members.</p>
      </div>


      <div className="card mb-4">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Select Activity</label>
          <select value={selected} onChange={handleSelect}>
            <option value="">— Choose an activity —</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>
                {a.title} — {new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAtt && <div className="loading">Loading attendance…</div>}

      {attendanceData && !loadingAtt && (
        <>
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

          {total > 0 && (
            <div className="card mb-4" style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '12px', fontWeight: 600, color: 'var(--gray-600)' }}>
                <span>Attendance Rate</span>
                <span style={{ color: attended / total >= 0.7 ? 'var(--success)' : 'var(--warning)' }}>
                  {Math.round((attended / total) * 100)}%
                </span>
              </div>
              <div className="cap-bar" style={{ height: 8 }}>
                <div
                  className="cap-bar-fill"
                  style={{
                    width: `${Math.round((attended / total) * 100)}%`,
                    background: attended / total >= 0.7
                      ? 'linear-gradient(90deg, var(--success), #34d399)'
                      : 'linear-gradient(90deg, var(--warning), #fbbf24)',
                  }}
                />
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{attendanceData.activity.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: 2 }}>Attendance Sheet</div>
              </div>
              {total > attended && (
                <button className="btn btn-success btn-sm" onClick={markAll}>✅ Mark All Present</button>
              )}
            </div>

            {total === 0 ? (
              <div className="empty" style={{ padding: '36px' }}>
                <span className="empty-icon">👥</span>
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
                        const initials = a.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                        return (
                          <tr key={a.userId} style={{ background: a.attended ? '#f0fdf4' : 'transparent' }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                  background: a.attended ? 'var(--success-light)' : 'var(--gray-100)',
                                  color: a.attended ? 'var(--success)' : 'var(--gray-500)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '11px', fontWeight: 800,
                                }}>{initials}</div>
                                <span style={{ fontWeight: 600 }}>{a.name}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>{a.email}</td>
                            <td>
                              {a.attended
                                ? <span className="badge badge-success">✓ Present</span>
                                : <span className="badge badge-danger">✗ Absent</span>}
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${a.attended ? 'btn-ghost' : 'btn-success'}`}
                                onClick={() => toggleAttendance(a.userId, a.attended)}
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

      {!selected && !loadingAtt && (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>Select an activity above</h3>
          <p>The attendance sheet will appear here.</p>
        </div>
      )}
    </div>
  );
}
