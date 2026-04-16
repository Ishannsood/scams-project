const mongoose = require('mongoose');
const s = new mongoose.Schema({
  _id:         String,
  title:       String,
  description: { type: String, default: '' },
  date:        String,
  time:        { type: String, default: '' },
  location:    { type: String, default: 'TBD' },
  category:    { type: String, default: 'General' },
  createdBy:   String,
  maxCapacity: { type: Number, default: 30 },
  createdAt:   String,
  updatedAt:   String,
}, { toJSON: { transform: (_,r) => { r.id=r._id; delete r._id; delete r.__v; return r; } } });
module.exports = mongoose.model('Activity', s);
