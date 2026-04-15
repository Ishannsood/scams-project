const router = require('express').Router();
const { users, registrations, attendance, activities } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/members — exec/advisor only
router.get('/', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const result = users.map(u => {
    const myRegs = registrations.filter(r => r.userId === u.id);
    const myAttendance = attendance.filter(a => a.userId === u.id);

    // Most recently registered activity
    const lastReg = myRegs
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))[0];
    const lastActivity = lastReg
      ? activities.find(a => a.id === lastReg.activityId)
      : null;

    const attendanceRate = myRegs.length > 0
      ? Math.round((myAttendance.length / myRegs.length) * 100)
      : 0;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      activitiesRegistered: myRegs.length,
      activitiesAttended: myAttendance.length,
      attendanceRate,
      lastActivityTitle: lastActivity?.title || null,
      joinedAt: myRegs.length > 0
        ? myRegs.sort((a, b) => new Date(a.registeredAt) - new Date(b.registeredAt))[0].registeredAt
        : null,
    };
  });

  // Sort: most active first
  result.sort((a, b) => b.activitiesRegistered - a.activitiesRegistered);
  res.json(result);
});

module.exports = router;
