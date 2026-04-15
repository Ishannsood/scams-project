const router = require('express').Router();
const { activities, registrations, users, uuidv4 } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/registrations/recent — last 8 sign-ups (exec/advisor only)
router.get('/recent', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const recent = [...registrations]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 8)
    .map(r => {
      const user = users.find(u => u.id === r.userId);
      const activity = activities.find(a => a.id === r.activityId);
      return {
        id: r.id,
        registeredAt: r.registeredAt,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'member',
        activityTitle: activity?.title || 'Unknown Activity',
        activityId: r.activityId,
      };
    });
  res.json(recent);
});

// GET /api/registrations/my — current user's registrations
router.get('/my', authenticate, (req, res) => {
  const myRegs = registrations.filter(r => r.userId === req.user.id);
  const enriched = myRegs.map(r => {
    const activity = activities.find(a => a.id === r.activityId);
    return { ...r, activity };
  });
  res.json(enriched);
});

// POST /api/registrations/:activityId — register for an activity
router.post('/:activityId', authenticate, (req, res) => {
  const { activityId } = req.params;
  const activity = activities.find(a => a.id === activityId);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });

  const alreadyRegistered = registrations.find(r => r.userId === req.user.id && r.activityId === activityId);
  if (alreadyRegistered) return res.status(400).json({ message: 'Already registered for this activity' });

  const currentCount = registrations.filter(r => r.activityId === activityId).length;
  if (currentCount >= activity.maxCapacity) {
    return res.status(400).json({ message: 'Activity is at full capacity' });
  }

  const reg = { id: uuidv4(), userId: req.user.id, activityId, registeredAt: new Date().toISOString() };
  registrations.push(reg);
  res.status(201).json({ message: 'Successfully registered', registration: reg });
});

// DELETE /api/registrations/:activityId — unregister from an activity
router.delete('/:activityId', authenticate, (req, res) => {
  const { activityId } = req.params;
  const idx = registrations.findIndex(r => r.userId === req.user.id && r.activityId === activityId);
  if (idx === -1) return res.status(404).json({ message: 'Registration not found' });
  registrations.splice(idx, 1);
  res.json({ message: 'Successfully unregistered' });
});

module.exports = router;
