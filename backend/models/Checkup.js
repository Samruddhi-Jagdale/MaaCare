// models/Checkup.js
const mongoose = require('mongoose');

const SupplementSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Iron Folic Acid (IFA), Calcium, Vitamin D
  dosage: { type: String, default: '1 tablet' },
  frequency: { type: String, default: 'Once daily' }, // e.g. Daily, Twice daily
  instructions: { type: String, default: 'Take after meals' },
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '' },
  instructions: { type: String, default: '' },
}, { _id: false });

const CheckupSchema = new mongoose.Schema({
  woman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Woman',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  date: { type: Date, required: true },
  time: { type: String, default: '10:00 AM' },
  type: { type: String, required: true }, // e.g., 'Routine Antenatal Care', 'Ultrasound', 'Blood Test', 'Immunization', 'Follow-up'
  
  // Vitals & Clinical Measurements
  bloodPressure: { type: String, default: '' },
  weight: { type: Number },
  hemoglobin: { type: Number }, // g/dL
  bloodSugar: { type: String, default: '' }, // mg/dL
  fetalHeartRate: { type: Number }, // bpm
  fundalHeight: { type: Number }, // cm
  
  // Clinical Observations & Prescriptions
  supplements: [SupplementSchema],
  prescriptions: [PrescriptionSchema],
  dangerSigns: [{ type: String }], // Recorded red flags
  notes: { type: String, default: '' },
  
  // Workflow Status & Follow-ups
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled', 'Overdue', 'Missed'],
    default: 'Upcoming',
    index: true,
  },
  nextFollowUpDate: { type: Date },
  followUpNotes: { type: String, default: '' },
}, { timestamps: true });

// Compound indexes for performant query execution
CheckupSchema.index({ woman: 1, date: -1 });
CheckupSchema.index({ status: 1, date: 1 });

module.exports = mongoose.model('Checkup', CheckupSchema);
