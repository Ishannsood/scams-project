const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/', (req, res) => res.json({ message: 'SCAMS Backend Running ✅', version: '1.0.0' }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
