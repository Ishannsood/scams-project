const router       = require('express').Router();
const Activity     = require('../models/Activity');
const Registration = require('../models/Registration');
const Attendance   = require('../models/Attendance');
const User         = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/summary', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const [activities, allRegs, allAtt, allUsers] = await Promise.all([
      Activity.find({}).lean(),
      Registration.find({}).lean(),
      Attendance.find({}).lean(),
      User.find({}).lean(),
    ]);

    const summary = activities.map(a => {
      const regs     = allRegs.filter(r => r.activityId === a._id);
      const attended = allAtt.filter(x => x.activityId === a._id);
      const rate     = regs.length > 0 ? Math.round((attended.length / regs.length) * 100) : 0;
      return {
        activityId: a._id, title: a.title, date: a.date, location: a.location,
        maxCapacity: a.maxCapacity, registered: regs.length, attended: attended.length,
        attendanceRate: `${rate}%`, fillRate: `${Math.round((regs.length / a.maxCapacity) * 100)}%`,
        isPast: new Date(a.date) < new Date(),
      };
    });

    res.json({
      overview: {
        totalActivities:   activities.length,
        totalMembers:      allUsers.filter(u => u.role === 'member').length,
        totalRegistrations: allRegs.length,
        totalAttendance:   allAtt.length,
      },
      activities: summary,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/members', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const [members, allRegs, allAtt] = await Promise.all([
      User.find({ role: 'member' }).lean(),
      Registration.find({}).lean(),
      Attendance.find({}).lean(),
    ]);
    const result = members.map(u => {
      const regs = allRegs.filter(r => r.userId === u._id);
      const att  = allAtt.filter(a => a.userId === u._id);
      return { id: u._id, name: u.name, email: u.email, activitiesRegistered: regs.length, activitiesAttended: att.length };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
