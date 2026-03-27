const router = require('express').Router();
const { activities, users, registrations, uuidv4 } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/activities — all users
router.get('/', authenticate, (req, res) => {
  const enriched = activities.map(a => {
    const creator = users.find(u => u.id === a.createdBy);
    const regCount = registrations.filter(r => r.activityId === a.id).length;
    return { ...a, creatorName: creator?.name || 'Unknown', registeredCount: regCount };
  });
  res.json(enriched);
});

// GET /api/activities/:id
router.get('/:id', authenticate, (req, res) => {
  const activity = activities.find(a => a.id === req.params.id);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });
  const creator = users.find(u => u.id === activity.createdBy);
  const regs = registrations.filter(r => r.activityId === activity.id);
  const participants = regs.map(r => {
    const user = users.find(u => u.id === r.userId);
    return { userId: r.userId, name: user?.name || 'Unknown', email: user?.email, registeredAt: r.registeredAt };
  });
  res.json({ ...activity, creatorName: creator?.name || 'Unknown', participants, registeredCount: regs.length });
});

// POST /api/activities — executive/advisor only
router.post('/', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const { title, description, date, time, location, maxCapacity } = req.body;
  if (!title || !date) return res.status(400).json({ message: 'Title and date are required' });
  const activity = {
    id: uuidv4(),
    title,
    description: description || '',
    date,
    time: time || '',
    location: location || 'TBD',
    createdBy: req.user.id,
    maxCapacity: Number(maxCapacity) || 30,
    createdAt: new Date().toISOString(),
  };
  activities.push(activity);
  res.status(201).json(activity);
});

// PUT /api/activities/:id — executive/advisor only
router.put('/:id', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const idx = activities.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Activity not found' });
  const { title, description, date, time, location, maxCapacity } = req.body;
  activities[idx] = {
    ...activities[idx],
    title: title ?? activities[idx].title,
    description: description ?? activities[idx].description,
    date: date ?? activities[idx].date,
    time: time ?? activities[idx].time,
    location: location ?? activities[idx].location,
    maxCapacity: maxCapacity ? Number(maxCapacity) : activities[idx].maxCapacity,
    updatedAt: new Date().toISOString(),
  };
  res.json(activities[idx]);
});

// DELETE /api/activities/:id — executive/advisor only
router.delete('/:id', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const idx = activities.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Activity not found' });
  activities.splice(idx, 1);
  res.json({ message: 'Activity deleted successfully' });
});

module.exports = router;
