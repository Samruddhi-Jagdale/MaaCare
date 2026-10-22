// models/Woman.js
const mongoose = require('mongoose');

const WomanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  pregnancyWeek: { type: Number },
  expectedDeliveryDate: { type: Date },
  bloodGroup: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to auth user
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // health worker
}, { timestamps: true });

module.exports = mongoose.model('Woman', WomanSchema);
