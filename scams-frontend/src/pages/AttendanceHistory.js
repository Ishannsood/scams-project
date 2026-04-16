import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const load = async () => {
    setLoading(true); setError(null); setCountdown(0);
    try {
      const [hist, regs] = await Promise.all([api.myHistory(), api.getMyRegistrations()]);
      setHistory(hist);
      const pastRegs = regs.filter(r => r.activity && new Date(r.activity.date) < new Date());
      setTotalRegistered(pastRegs.length);
    } catch (e) {
      setError(e.message || 'Failed to load.');
      if (e.message === 'COLD_START') {
        let t = 55; setCountdown(t);
        const iv = setInterval(() => { t -= 1; setCountdown(t); if (t <= 0) { clearInterval(iv); load(); } }, 1000);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Could not load attendance history</h3>
            <p style={{ fontSize:12, color:'var(--gray-400)', fontFamily:'monospace', background:'var(--gray-100)', padding:'6px 12px', borderRadius:6 }}>{error}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </>
        )}
      </div>
    </div>
  );

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
