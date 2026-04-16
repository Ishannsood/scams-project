const mongoose = require('mongoose');
const s = new mongoose.Schema({
  _id:       String,
  title:     String,
  content:   String,
  pinned:    { type: Boolean, default: false },
  createdBy: String,
  createdAt: String,
}, { toJSON: { transform: (_,r) => { r.id=r._id; delete r._id; delete r.__v; return r; } } });
module.exports = mongoose.model('Announcement', s);
