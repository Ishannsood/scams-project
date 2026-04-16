const router = require('express').Router();
const { activities, users, registrations, waitlist, uuidv4 } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/activities — all authenticated users
router.get('/', authenticate, (req, res) => {
  const enriched = activities.map(a => {
    const creator = users.find(u => u.id === a.createdBy);
    const regCount  = registrations.filter(r => r.activityId === a.id).length;
    const wlCount   = waitlist.filter(w => w.activityId === a.id).length;
    return { ...a, creatorName: creator?.name || 'Unknown', registeredCount: regCount, waitlistCount: wlCount };
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
  const wlCount = waitlist.filter(w => w.activityId === activity.id).length;
  res.json({ ...activity, creatorName: creator?.name || 'Unknown', participants, registeredCount: regs.length, waitlistCount: wlCount });
});

// POST /api/activities — executive/advisor only
router.post('/', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const { title, description, date, time, location, maxCapacity, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0)
    return res.status(400).json({ message: 'Title is required' });

  if (!date || isNaN(new Date(date)))
    return res.status(400).json({ message: 'A valid date is required' });

  const capacity = Number(maxCapacity);
  if (maxCapacity !== undefined && (isNaN(capacity) || capacity < 1 || capacity > 1000))
    return res.status(400).json({ message: 'Capacity must be between 1 and 1000' });

  const activity = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim() || '',
    date,
    time: time || '',
    location: location?.trim() || 'TBD',
    category: category?.trim() || 'General',
    createdBy: req.user.id,
    maxCapacity: capacity || 30,
    createdAt: new Date().toISOString(),
  };
  activities.push(activity);
  res.status(201).json(activity);
});

// PUT /api/activities/:id — executive/advisor only
router.put('/:id', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const idx = activities.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Activity not found' });

  const { title, description, date, time, location, maxCapacity, category } = req.body;

  if (date && isNaN(new Date(date)))
    return res.status(400).json({ message: 'A valid date is required' });

  if (maxCapacity !== undefined && (isNaN(Number(maxCapacity)) || Number(maxCapacity) < 1))
    return res.status(400).json({ message: 'Capacity must be at least 1' });

  activities[idx] = {
    ...activities[idx],
    title:       title?.trim()       ?? activities[idx].title,
    description: description?.trim() ?? activities[idx].description,
    date:        date                ?? activities[idx].date,
    time:        time                ?? activities[idx].time,
    location:    location?.trim()    ?? activities[idx].location,
    category:    category?.trim()    ?? activities[idx].category ?? 'General',
    maxCapacity: maxCapacity ? Number(maxCapacity) : activities[idx].maxCapacity,
    updatedAt:   new Date().toISOString(),
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
