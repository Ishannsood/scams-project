const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',        require('./routes/reports'));
app.use('/api/announcements',  require('./routes/announcements'));

// Health check
app.get('/', (req, res) => res.json({ message: 'SCAMS Backend Running ✅', version: '1.0.0' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`\n🚀 SCAMS Backend running on http://localhost:${PORT}`);
  console.log('\n📋 Test Accounts:');
  console.log('  member@test.com   / password123  (Member)');
  console.log('  exec@test.com     / password123  (Executive)');
  console.log('  advisor@test.com  / password123  (Advisor)\n');
});