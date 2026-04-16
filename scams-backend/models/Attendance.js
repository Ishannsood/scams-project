const mongoose = require('mongoose');
const s = new mongoose.Schema({
  _id:        String,
  userId:     String,
  activityId: String,
  markedAt:   String,
  markedBy:   String,
}, { toJSON: { transform: (_,r) => { r.id=r._id; delete r._id; delete r.__v; return r; } } });
module.exports = mongoose.model('Attendance', s);
