// models/Woman.js
const mongoose = require('mongoose');

const WomanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  pregnancyWeek: { type: Number },
  expectedDeliveryDate: { type: Date },
  lastMenstrualPeriod: { type: Date },
  bloodGroup: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'High Risk', 'Transferred'],
    default: 'Active',
  },
}, { timestamps: true });

WomanSchema.index({ assignedWorker: 1 });

module.exports = mongoose.model('Woman', WomanSchema);
