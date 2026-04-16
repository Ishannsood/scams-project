const router       = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Activity     = require('../models/Activity');
const Registration = require('../models/Registration');
const Waitlist     = require('../models/Waitlist');
const User         = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const activities = await Activity.find({}).lean();
    const result = await Promise.all(activities.map(async a => {
      const creator       = await User.findById(a._id === a.createdBy ? a._id : a.createdBy).lean();
      const registeredCount = await Registration.countDocuments({ activityId: a._id });
      const waitlistCount   = await Waitlist.countDocuments({ activityId: a._id });
      return { ...a, id: a._id, creatorName: creator?.name || 'Unknown', registeredCount, waitlistCount };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const creator       = await User.findById(activity.createdBy).lean();
    const regs          = await Registration.find({ activityId: activity._id }).lean();
    const waitlistCount = await Waitlist.countDocuments({ activityId: activity._id });

    const participants = await Promise.all(regs.map(async r => {
      const user = await User.findById(r.userId).lean();
      return { userId: r.userId, name: user?.name || 'Unknown', email: user?.email, registeredAt: r.registeredAt };
    }));

    res.json({ ...activity, id: activity._id, creatorName: creator?.name || 'Unknown', participants, registeredCount: regs.length, waitlistCount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const { title, description, date, time, location, maxCapacity, category } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0)
      return res.status(400).json({ message: 'Title is required' });
    if (!date || isNaN(new Date(date)))
      return res.status(400).json({ message: 'A valid date is required' });
    const capacity = Number(maxCapacity);
    if (maxCapacity !== undefined && (isNaN(capacity) || capacity < 1 || capacity > 1000))
      return res.status(400).json({ message: 'Capacity must be between 1 and 1000' });

    const activity = await Activity.create({
      _id: uuidv4(), title: title.trim(), description: description?.trim() || '',
      date, time: time || '', location: location?.trim() || 'TBD',
      category: category?.trim() || 'General',
      createdBy: req.user.id, maxCapacity: capacity || 30,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ ...activity.toJSON() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const { title, description, date, time, location, maxCapacity, category } = req.body;
    if (date && isNaN(new Date(date))) return res.status(400).json({ message: 'A valid date is required' });
    if (maxCapacity !== undefined && (isNaN(Number(maxCapacity)) || Number(maxCapacity) < 1))
      return res.status(400).json({ message: 'Capacity must be at least 1' });

    if (title !== undefined)       activity.title       = title.trim();
    if (description !== undefined) activity.description = description.trim();
    if (date !== undefined)        activity.date        = date;
    if (time !== undefined)        activity.time        = time;
    if (location !== undefined)    activity.location    = location.trim();
    if (category !== undefined)    activity.category    = category.trim();
    if (maxCapacity !== undefined) activity.maxCapacity = Number(maxCapacity);
    activity.updatedAt = new Date().toISOString();

    await activity.save();
    res.json(activity.toJSON());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity deleted successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
