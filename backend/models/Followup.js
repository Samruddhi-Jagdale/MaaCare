// models/Followup.js
const mongoose = require('mongoose');

const FollowupSchema = new mongoose.Schema({
  woman: { type: mongoose.Schema.Types.ObjectId, ref: 'Woman', required: true },
  followupDate: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  nextFollowupDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Followup', FollowupSchema);
