import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Attendance() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingActs, setLoadingActs] = useState(true);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [msg, setMsg] = useState('');

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

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const toggleAttendance = async (userId, currentlyAttended) => {
    try {
      await api.markAttendance(selected, { userId, present: !currentlyAttended });
      flash(currentlyAttended ? 'Attendance removed.' : '✅ Attendance marked!');
      loadAttendance(selected);
    } catch (e) { flash('❌ ' + e.message); }
  };

  const markAll = async () => {
    if (!attendanceData) return;
    const unattended = attendanceData.attendance.filter(a => !a.attended);
    for (const a of unattended) {
      await api.markAttendance(selected, { userId: a.userId, present: true });
    }
    flash(`✅ Marked ${unattended.length} attendees!`);
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

      {msg && <div className={`alert ${msg.startsWith('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

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
            <div className="stat-card">
              <div className="stat-value">{total}</div>
              <div className="stat-label">Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{attended}</div>
              <div className="stat-label">Present</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{total - attended}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                {attendanceData.activity.title} — Attendance Sheet
              </span>
              {total > attended && (
                <button className="btn btn-success btn-sm" onClick={markAll}>
                  ✅ Mark All Present
                </button>
              )}
            </div>

            {total === 0 ? (
              <div className="empty" style={{ padding: '36px' }}>
                <div className="empty-icon">👥</div>
                <h3>No registrations yet</h3>
                <p>Nobody has registered for this activity.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.attendance.map(a => (
                      <tr key={a.userId}>
                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                        <td style={{ color: 'var(--gray-600)' }}>{a.email}</td>
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
                    ))}
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
