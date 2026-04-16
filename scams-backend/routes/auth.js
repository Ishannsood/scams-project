const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { users, uuidv4 } = require('../data/store');
const { SECRET, authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required' });

  if (typeof name !== 'string' || name.trim().length < 2)
    return res.status(400).json({ message: 'Name must be at least 2 characters' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: 'Please enter a valid email address' });

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(400).json({ message: 'Email already registered' });

  const validRoles = ['member', 'executive', 'advisor'];
  const userRole = validRoles.includes(role) ? role : 'member';

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name: name.trim(), email: email.toLowerCase(), password: hashedPassword, role: userRole };
  users.push(user);

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/profile — update name and/or password
router.patch('/profile', authenticate, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    user.name = name.trim();
  }

  if (newPassword !== undefined) {
    if (!currentPassword)
      return res.status(400).json({ message: 'Current password is required to set a new password' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    user.password = await bcrypt.hash(newPassword, 10);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET, { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
