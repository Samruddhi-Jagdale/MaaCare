// models/Checkup.js
const mongoose = require('mongoose');

const CheckupSchema = new mongoose.Schema({
  woman: { type: mongoose.Schema.Types.ObjectId, ref: 'Woman', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  time: { type: String, default: '10:00 AM' },
  type: { type: String, required: true }, // e.g., 'Routine Antenatal Care', 'Ultrasound', 'Blood Test', 'Immunization', 'Follow-up'
  bloodPressure: { type: String, default: '' },
  weight: { type: Number },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled', 'Overdue', 'Missed'],
    default: 'Upcoming',
  },
  nextFollowUpDate: { type: Date },
  followUpNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Checkup', CheckupSchema);
