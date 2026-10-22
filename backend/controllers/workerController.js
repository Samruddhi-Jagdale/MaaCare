// controllers/workerController.js
const asyncHandler = require('express-async-handler');
const Woman = require('../models/Woman');
const Checkup = require('../models/Checkup');

// Helper to auto-mark overdue appointments whose scheduled date is in the past and still 'Upcoming'
const syncOverdueStatus = async (womanIds) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await Checkup.updateMany(
    {
      woman: { $in: womanIds },
      status: 'Upcoming',
      date: { $lt: startOfToday },
    },
    { $set: { status: 'Overdue' } }
  );
};

// @desc    Get pregnant women assigned to logged-in health worker
// @route   GET /api/worker/women
// @access  Private (Worker)
const getAssignedWomen = asyncHandler(async (req, res) => {
  const women = await Woman.find({ assignedWorker: req.user._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  // Sync any overdue appointments for these women
  const womanIds = women.map((w) => w._id);
  if (womanIds.length > 0) {
    await syncOverdueStatus(womanIds);
  }

  res.json(women);
});

// @desc    Get single woman details with checkup history (Worker can only access their assigned patients)
// @route   GET /api/worker/women/:id
// @access  Private (Worker)
const getWomanDetails = asyncHandler(async (req, res) => {
  const woman = await Woman.findOne({
    _id: req.params.id,
    assignedWorker: req.user._id,
  })
    .populate('user', 'name email phone')
    .populate('assignedWorker', 'name email phone');

  if (!woman) {
    res.status(404);
    throw new Error('Assigned pregnant woman not found or unauthorized access');
  }

  // Sync overdue status
  await syncOverdueStatus([woman._id]);

  const checkups = await Checkup.find({ woman: woman._id }).sort({ date: -1 });
  res.json({ woman, checkups });
});

// @desc    Schedule new appointment for an assigned woman
// @route   POST /api/worker/checkups
// @access  Private (Worker)
const addCheckup = asyncHandler(async (req, res) => {
  const { womanId, date, time, type, bloodPressure, weight, notes, status, nextFollowUpDate } = req.body;

  if (!womanId || !date || !type) {
    res.status(400);
    throw new Error('Woman ID, date, and appointment type are required');
  }

  // Security check: ensure worker is assigned to this woman
  const woman = await Woman.findOne({ _id: womanId, assignedWorker: req.user._id });
  if (!woman) {
    res.status(403);
    throw new Error('You are not authorized to manage appointments for this patient');
  }

  const checkupDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let initialStatus = status || 'Upcoming';
  if (initialStatus === 'Upcoming' && checkupDate < now) {
    initialStatus = 'Overdue';
  }

  const checkup = await Checkup.create({
    woman: womanId,
    createdBy: req.user._id,
    date: checkupDate,
    time: time || '10:00 AM',
    type: type.trim(),
    bloodPressure: bloodPressure ? bloodPressure.trim() : '',
    weight: weight ? Number(weight) : undefined,
    notes: notes ? notes.trim() : '',
    status: initialStatus,
    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
  });

  res.status(201).json(checkup);
});

// @desc    Update / Reschedule / Complete / Cancel appointment
// @route   PUT /api/worker/checkups/:id
// @access  Private (Worker)
const updateCheckup = asyncHandler(async (req, res) => {
  const checkup = await Checkup.findById(req.params.id);
  if (!checkup) {
    res.status(404);
    throw new Error('Appointment record not found');
  }

  // Ensure worker is assigned to this woman
  const woman = await Woman.findOne({ _id: checkup.woman, assignedWorker: req.user._id });
  if (!woman) {
    res.status(403);
    throw new Error('Unauthorized to modify this patient appointment');
  }

  const { date, time, type, bloodPressure, weight, notes, status, nextFollowUpDate, followUpNotes } = req.body;

  if (date) checkup.date = new Date(date);
  if (time) checkup.time = time;
  if (type) checkup.type = type.trim();
  if (bloodPressure !== undefined) checkup.bloodPressure = bloodPressure.trim();
  if (weight !== undefined) checkup.weight = weight ? Number(weight) : undefined;
  if (notes !== undefined) checkup.notes = notes.trim();
  if (status) checkup.status = status;
  if (nextFollowUpDate !== undefined) {
    checkup.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : undefined;
  }
  if (followUpNotes !== undefined) checkup.followUpNotes = followUpNotes.trim();

  // If status was Overdue or Upcoming, re-evaluate if date changed
  if (checkup.status === 'Upcoming' || checkup.status === 'Overdue') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (new Date(checkup.date) < startOfToday) {
      checkup.status = 'Overdue';
    } else {
      checkup.status = 'Upcoming';
    }
  }

  const updatedCheckup = await checkup.save();
  res.json(updatedCheckup);
});

// @desc    Get all appointments and follow-ups for worker's assigned patients
// @route   GET /api/worker/appointments
// @access  Private (Worker)
const getWorkerAppointments = asyncHandler(async (req, res) => {
  const women = await Woman.find({ assignedWorker: req.user._id });
  const womanIds = women.map((w) => w._id);

  if (womanIds.length === 0) {
    return res.json({ upcoming: [], overdue: [], completed: [], all: [] });
  }

  await syncOverdueStatus(womanIds);

  const all = await Checkup.find({ woman: { $in: womanIds } })
    .populate('woman', 'name age phone address pregnancyWeek bloodGroup')
    .sort({ date: 1 });

  const upcoming = all.filter((c) => c.status === 'Upcoming');
  const overdue = all.filter((c) => c.status === 'Overdue');
  const completed = all.filter((c) => c.status === 'Completed');
  const missed = all.filter((c) => c.status === 'Missed');
  const cancelled = all.filter((c) => c.status === 'Cancelled');

  res.json({ upcoming, overdue, completed, missed, cancelled, all });
});

module.exports = {
  getAssignedWomen,
  getWomanDetails,
  addCheckup,
  updateCheckup,
  getWorkerAppointments,
};
