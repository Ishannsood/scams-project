const router = require('express').Router();
const { announcements, users, uuidv4 } = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/announcements — all authenticated users
router.get('/', authenticate, (req, res) => {
  const enriched = [...announcements]
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .map(a => {
      const creator = users.find(u => u.id === a.createdBy);
      return { ...a, creatorName: creator?.name || 'Unknown' };
    });
  res.json(enriched);
});

// POST /api/announcements — executive/advisor only
router.post('/', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const { title, content, pinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  const announcement = {
    id: uuidv4(),
    title,
    content,
    pinned: !!pinned,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
  };
  announcements.push(announcement);
  res.status(201).json(announcement);
});

// DELETE /api/announcements/:id — executive/advisor only
router.delete('/:id', authenticate, authorize('executive', 'advisor'), (req, res) => {
  const idx = announcements.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Announcement not found' });
  announcements.splice(idx, 1);
  res.json({ message: 'Announcement deleted' });
});

module.exports = router;
