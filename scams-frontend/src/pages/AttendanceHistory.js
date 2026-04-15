import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.myHistory(), api.getMyRegistrations()])
      .then(([hist, regs]) => {
        setHistory(hist);
        // Only count past registrations as the denominator — upcoming events haven't happened yet
        const pastRegs = regs.filter(r => r.activity && new Date(r.activity.date) < new Date());
        setTotalRegistered(pastRegs.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading attendance history…</div>;

  const attended = history.length;
  const rate = totalRegistered > 0 ? Math.round((attended / totalRegistered) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Attendance History</h1>
        <p>A record of all activities you have attended.</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{totalRegistered}</div>
          <div className="stat-label">Past Events</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{attended}</div>
          <div className="stat-label">Events Attended</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{rate}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No attendance records yet</h3>
          <p>Your attendance will appear here after an executive marks you present.</p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/activities" className="btn btn-primary btn-sm">Browse Activities</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600, fontSize: '14px' }}>
            Attended Events
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history
                  .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
                  .map(record => (
                  <tr key={record.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--success)', flexShrink: 0,
                        }} />
                        {record.activity
                          ? <Link to={`/activities/${record.activityId}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                              {record.activity.title}
                            </Link>
                          : <span style={{ fontWeight: 600 }}>Unknown Activity</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {record.activity
                        ? new Date(record.activity.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>
                      {record.activity?.location || '—'}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>✓ Present</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
