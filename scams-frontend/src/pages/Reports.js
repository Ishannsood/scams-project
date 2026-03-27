import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('activities');

  useEffect(() => {
    Promise.all([api.getSummary(), api.getMembers()]).then(([s, m]) => {
      setSummary(s); setMembers(m); setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading reports…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Overview of club activities and member participation.</p>
      </div>

      {/* Overview stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-value">{summary.overview.totalActivities}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.overview.totalMembers}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.overview.totalRegistrations}</div>
          <div className="stat-label">Registrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.overview.totalAttendance}</div>
          <div className="stat-label">Attendances</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['activities', 'members'].map(t => (
          <button
            key={t}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}
          >
            {t === 'activities' ? '📅 Activity Report' : '👥 Member Report'}
          </button>
        ))}
      </div>

      {tab === 'activities' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
            Activity Summary
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Registered</th>
                  <th>Attended</th>
                  <th>Fill Rate</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {summary.activities.map(a => (
                  <tr key={a.activityId}>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td>{new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</td>
                    <td>{a.location}</td>
                    <td>{a.maxCapacity}</td>
                    <td>{a.registered}</td>
                    <td>{a.attended}</td>
                    <td>
                      <span className={`badge ${parseInt(a.fillRate) >= 80 ? 'badge-success' : parseInt(a.fillRate) >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                        {a.fillRate}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${parseInt(a.attendanceRate) >= 70 ? 'badge-success' : parseInt(a.attendanceRate) >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                        {a.attendanceRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
            Member Participation
          </div>
          {members.length === 0 ? (
            <div className="empty" style={{ padding: '36px' }}>
              <div className="empty-icon">👥</div>
              <h3>No members yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered For</th>
                    <th>Attended</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const rate = m.activitiesRegistered > 0
                      ? Math.round((m.activitiesAttended / m.activitiesRegistered) * 100)
                      : 0;
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 500 }}>{m.name}</td>
                        <td style={{ color: 'var(--gray-600)' }}>{m.email}</td>
                        <td>{m.activitiesRegistered}</td>
                        <td>{m.activitiesAttended}</td>
                        <td>
                          <span className={`badge ${rate >= 70 ? 'badge-success' : rate >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
