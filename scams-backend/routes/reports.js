const router = require('express').Router();
const { activities, registrations, attendance, users } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/reports/summary — exec/advisor only
router.get('/summary', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const summary = activities.map(activity => {
    const regs = registrations.filter(r => r.activityId === activity.id);
    const attended = attendance.filter(a => a.activityId === activity.id);
    const attendanceRate = regs.length > 0 ? Math.round((attended.length / regs.length) * 100) : 0;
    return {
      activityId: activity.id,
      title: activity.title,
      date: activity.date,
      location: activity.location,
      maxCapacity: activity.maxCapacity,
      registered: regs.length,
      attended: attended.length,
      attendanceRate: `${attendanceRate}%`,
      fillRate: `${Math.round((regs.length / activity.maxCapacity) * 100)}%`,
      isPast: new Date(activity.date) < new Date(),
    };
  });

  const totalRegistrations = registrations.length;
  const totalAttendance = attendance.length;
  const totalActivities = activities.length;
  const totalMembers = users.filter(u => u.role === 'member').length;

  res.json({
    overview: { totalActivities, totalMembers, totalRegistrations, totalAttendance },
    activities: summary,
  });
});

// GET /api/reports/members — exec/advisor only
router.get('/members', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const members = users.filter(u => u.role === 'member').map(u => {
    const myRegs = registrations.filter(r => r.userId === u.id);
    const myAttendance = attendance.filter(a => a.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      activitiesRegistered: myRegs.length,
      activitiesAttended: myAttendance.length,
    };
  });
  res.json(members);
});

module.exports = router;
