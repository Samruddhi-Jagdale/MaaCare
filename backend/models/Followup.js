// models/Followup.js
// NOTE: This model is unused and orphaned as of the MaaCare v2 refactor.
// Follow-up dates and notes are stored in Checkup.js fields: nextFollowUpDate, followUpNotes.
// This file is retained for reference only and should NOT be imported or used.
const mongoose = require('mongoose');

const FollowupSchema = new mongoose.Schema({
  woman: { type: mongoose.Schema.Types.ObjectId, ref: 'Woman', required: true },
  followupDate: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  nextFollowupDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Followup', FollowupSchema);
