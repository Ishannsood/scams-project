const router       = require('express').Router();
const User         = require('../models/User');
const Registration = require('../models/Registration');
const Attendance   = require('../models/Attendance');
const Activity     = require('../models/Activity');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const [users, allRegs, allAtt, allActs] = await Promise.all([
      User.find({}).lean(),
      Registration.find({}).lean(),
      Attendance.find({}).lean(),
      Activity.find({}).lean(),
    ]);

    const result = users.map(u => {
      const myRegs = allRegs.filter(r => r.userId === u._id);
      const myAtt  = allAtt.filter(a => a.userId === u._id);
      const sorted = [...myRegs].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
      const lastAct = sorted[0] ? allActs.find(a => a._id === sorted[0].activityId) : null;
      const attRate = myRegs.length > 0 ? Math.round((myAtt.length / myRegs.length) * 100) : 0;
      const first   = [...myRegs].sort((a,b) => new Date(a.registeredAt)-new Date(b.registeredAt))[0];
      return {
        id: u._id, name: u.name, email: u.email, role: u.role,
        activitiesRegistered: myRegs.length, activitiesAttended: myAtt.length,
        attendanceRate: attRate, lastActivityTitle: lastAct?.title || null,
        joinedAt: first?.registeredAt || null,
      };
    });

    result.sort((a, b) => b.activitiesRegistered - a.activitiesRegistered);
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
