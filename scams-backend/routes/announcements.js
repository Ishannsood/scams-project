const router       = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Announcement = require('../models/Announcement');
const User         = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const all = await Announcement.find({}).sort({ pinned: -1, createdAt: -1 }).lean();
    const result = await Promise.all(all.map(async a => {
      const creator = await User.findById(a.createdBy).lean();
      return { ...a, id: a._id, creatorName: creator?.name || 'Unknown' };
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const { title, content, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
    const ann = await Announcement.create({ _id: uuidv4(), title, content, pinned: !!pinned, createdBy: req.user.id, createdAt: new Date().toISOString() });
    res.status(201).json(ann.toJSON());
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', authenticate, authorize('executive', 'advisor'), async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
