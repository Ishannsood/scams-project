const router = require('express').Router();
const { attendance, activities, registrations, users, uuidv4 } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/attendance/my/history — member's own attendance history
// MUST be defined before /:activityId to prevent 'my' being matched as a param
router.get('/my/history', authenticate, (req, res) => {
  const myAttendance = attendance.filter(a => a.userId === req.user.id);
  const enriched = myAttendance.map(a => {
    const activity = activities.find(act => act.id === a.activityId);
    return { ...a, activity };
  });
  res.json(enriched);
});

// GET /api/attendance/:activityId — get attendance for an activity (exec/advisor)
router.get('/:activityId', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const { activityId } = req.params;
  const activity = activities.find(a => a.id === activityId);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });

  const regs = registrations.filter(r => r.activityId === activityId);
  const result = regs.map(r => {
    const user = users.find(u => u.id === r.userId);
    const attended = attendance.find(a => a.userId === r.userId && a.activityId === activityId);
    return {
      userId: r.userId,
      name: user?.name || 'Unknown',
      email: user?.email,
      attended: !!attended,
      markedAt: attended?.markedAt || null,
    };
  });
  res.json({ activity, attendance: result });
});

// POST /api/attendance/:activityId/mark — mark attendance (exec/advisor)
router.post('/:activityId/mark', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const { activityId } = req.params;
  const { userId, present } = req.body;

  if (!userId) return res.status(400).json({ message: 'userId is required' });

  const activity = activities.find(a => a.id === activityId);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });

  const isRegistered = registrations.find(r => r.userId === userId && r.activityId === activityId);
  if (!isRegistered) return res.status(400).json({ message: 'User is not registered for this activity' });

  const existingIdx = attendance.findIndex(a => a.userId === userId && a.activityId === activityId);

  if (present === false) {
    if (existingIdx !== -1) attendance.splice(existingIdx, 1);
    return res.json({ message: 'Attendance unmarked' });
  }

  if (existingIdx === -1) {
    attendance.push({
      id: uuidv4(),
      userId,
      activityId,
      markedAt: new Date().toISOString(),
      markedBy: req.user.id,
    });
  }
  res.json({ message: 'Attendance marked' });
});

module.exports = router;
