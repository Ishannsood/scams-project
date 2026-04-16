const router       = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Registration = require('../models/Registration');
const Waitlist     = require('../models/Waitlist');
const Activity     = require('../models/Activity');
const User         = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/recent', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const regs = await Registration.find({}).sort({ registeredAt: -1 }).limit(8).lean();
    const result = await Promise.all(regs.map(async r => {
      const user     = await User.findById(r.userId).lean();
      const activity = await Activity.findById(r.activityId).lean();
      return { id: r._id, registeredAt: r.registeredAt, userName: user?.name || 'Unknown', userRole: user?.role || 'member', activityTitle: activity?.title || 'Unknown Activity', activityId: r.activityId };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.user.id }).lean();
    const result = await Promise.all(regs.map(async r => {
      const activity = await Activity.findById(r.activityId).lean();
      return { ...r, id: r._id, activity: activity ? { ...activity, id: activity._id } : null };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/waitlist/my', authenticate, async (req, res) => {
  try {
    const entries = await Waitlist.find({ userId: req.user.id }).lean();
    const result = await Promise.all(entries.map(async w => {
      const activity = await Activity.findById(w.activityId).lean();
      const queue    = await Waitlist.find({ activityId: w.activityId }).sort({ waitlistedAt: 1 }).lean();
      const position = queue.findIndex(x => x.userId === req.user.id) + 1;
      return { ...w, id: w._id, activity: activity ? { ...activity, id: activity._id } : null, position };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:activityId', authenticate, async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId).lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const alreadyReg = await Registration.findOne({ userId: req.user.id, activityId });
    if (alreadyReg) return res.status(400).json({ message: 'Already registered for this activity' });

    const count = await Registration.countDocuments({ activityId });
    if (count >= activity.maxCapacity) return res.status(400).json({ message: 'Activity is at full capacity' });

    await Waitlist.deleteOne({ userId: req.user.id, activityId });

    const reg = await Registration.create({ _id: uuidv4(), userId: req.user.id, activityId, registeredAt: new Date().toISOString() });
    res.status(201).json({ message: 'Successfully registered', registration: { ...reg.toJSON() } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:activityId', authenticate, async (req, res) => {
  try {
    const { activityId } = req.params;
    const reg = await Registration.findOneAndDelete({ userId: req.user.id, activityId });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });

    const first = await Waitlist.findOneAndDelete({ activityId }, { sort: { waitlistedAt: 1 } });
    if (first) {
      await Registration.create({ _id: uuidv4(), userId: first.userId, activityId, registeredAt: new Date().toISOString(), promotedFromWaitlist: true });
    }
    res.json({ message: 'Successfully unregistered' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:activityId/waitlist', authenticate, async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId).lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    if (await Registration.findOne({ userId: req.user.id, activityId }))
      return res.status(400).json({ message: 'You are already registered for this activity' });
    if (await Waitlist.findOne({ userId: req.user.id, activityId }))
      return res.status(400).json({ message: 'You are already on the waitlist' });

    const count = await Registration.countDocuments({ activityId });
    if (count < activity.maxCapacity) return res.status(400).json({ message: 'Activity still has spots — register directly' });

    const entry = await Waitlist.create({ _id: uuidv4(), userId: req.user.id, activityId, waitlistedAt: new Date().toISOString() });
    const queue = await Waitlist.find({ activityId }).sort({ waitlistedAt: 1 }).lean();
    const position = queue.findIndex(w => w.userId === req.user.id) + 1;
    res.status(201).json({ message: 'Added to waitlist', entry: entry.toJSON(), position });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:activityId/waitlist', authenticate, async (req, res) => {
  try {
    const { activityId } = req.params;
    const entry = await Waitlist.findOneAndDelete({ userId: req.user.id, activityId });
    if (!entry) return res.status(404).json({ message: 'Not on waitlist' });
    res.json({ message: 'Removed from waitlist' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
