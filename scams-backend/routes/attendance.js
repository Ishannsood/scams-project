const router       = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Attendance   = require('../models/Attendance');
const Activity     = require('../models/Activity');
const Registration = require('../models/Registration');
const User         = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my/history', authenticate, async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user.id }).lean();
    const result  = await Promise.all(records.map(async a => {
      const activity = await Activity.findById(a.activityId).lean();
      return { ...a, id: a._id, activity: activity ? { ...activity, id: activity._id } : null };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:activityId', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId).lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const regs   = await Registration.find({ activityId }).lean();
    const result = await Promise.all(regs.map(async r => {
      const user     = await User.findById(r.userId).lean();
      const attended = await Attendance.findOne({ userId: r.userId, activityId }).lean();
      return { userId: r.userId, name: user?.name || 'Unknown', email: user?.email, attended: !!attended, markedAt: attended?.markedAt || null };
    }));
    res.json({ activity: { ...activity, id: activity._id }, attendance: result });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:activityId/mark', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const { activityId } = req.params;
    const { userId, present } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const activity = await Activity.findById(activityId).lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    const isReg = await Registration.findOne({ userId, activityId });
    if (!isReg) return res.status(400).json({ message: 'User is not registered for this activity' });

    if (present === false) {
      await Attendance.deleteOne({ userId, activityId });
      return res.json({ message: 'Attendance unmarked' });
    }

    await Attendance.findOneAndUpdate(
      { userId, activityId },
      { $setOnInsert: { _id: uuidv4(), userId, activityId, markedAt: new Date().toISOString(), markedBy: req.user.id } },
      { upsert: true }
    );
    res.json({ message: 'Attendance marked' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
