const express   = require('express');
const cors      = require('cors');
const connectDB = require('./db');
const seed      = require('./seed');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Connect to MongoDB then seed on first run
connectDB().then(seed);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/members',       require('./routes/members'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/', (req, res) => res.json({ message: 'SCAMS Backend Running ✅', version: '2.0.0', db: 'MongoDB' }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
