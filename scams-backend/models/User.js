const mongoose = require('mongoose');
const s = new mongoose.Schema({
  _id:      String,
  name:     String,
  email:    { type: String, unique: true, lowercase: true },
  password: String,
  role:     { type: String, enum: ['member','executive','advisor'], default: 'member' },
}, { toJSON: { transform: (_,r) => { r.id=r._id; delete r._id; delete r.__v; return r; } } });
module.exports = mongoose.model('User', s);
