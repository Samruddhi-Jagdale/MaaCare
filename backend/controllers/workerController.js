// controllers/workerController.js
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Woman = require('../models/Woman');
const Checkup = require('../models/Checkup');
const { createNotification } = require('../services/notificationService');

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
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid patient ID format');
  }

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
  const {
    womanId,
    date,
    time,
    type,
    bloodPressure,
    weight,
    hemoglobin,
    bloodSugar,
    fetalHeartRate,
    fundalHeight,
    supplements,
    prescriptions,
    dangerSigns,
    notes,
    status,
    nextFollowUpDate,
  } = req.body;

  if (!womanId || !mongoose.Types.ObjectId.isValid(womanId)) {
    res.status(400);
    throw new Error('Valid patient ID is required');
  }

  if (!date || !type) {
    res.status(400);
    throw new Error('Appointment date and type are required');
  }

  // Security check: ensure worker is assigned to this woman
  const woman = await Woman.findOne({ _id: womanId, assignedWorker: req.user._id });
  if (!woman) {
    res.status(403);
    throw new Error('You are not authorized to manage appointments for this patient');
  }

  const checkupDate = new Date(date);
  if (isNaN(checkupDate.getTime())) {
    res.status(400);
    throw new Error('Invalid appointment date format');
  }

  // Duplicate booking prevention: check if another upcoming checkup on the same calendar day exists
  const dayStart = new Date(checkupDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(checkupDate);
  dayEnd.setHours(23, 59, 59, 999);

  const existingUpcoming = await Checkup.findOne({
    woman: womanId,
    status: 'Upcoming',
    type: type.trim(),
    date: { $gte: dayStart, $lte: dayEnd },
  });

  if (existingUpcoming) {
    res.status(400);
    throw new Error(`An upcoming '${type.trim()}' appointment is already scheduled for this patient on this date.`);
  }

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
    weight: weight !== undefined && weight !== '' ? Number(weight) : undefined,
    hemoglobin: hemoglobin !== undefined && hemoglobin !== '' ? Number(hemoglobin) : undefined,
    bloodSugar: bloodSugar ? bloodSugar.trim() : '',
    fetalHeartRate: fetalHeartRate !== undefined && fetalHeartRate !== '' ? Number(fetalHeartRate) : undefined,
    fundalHeight: fundalHeight !== undefined && fundalHeight !== '' ? Number(fundalHeight) : undefined,
    supplements: Array.isArray(supplements) ? supplements : [],
    prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
    dangerSigns: Array.isArray(dangerSigns) ? dangerSigns : [],
    notes: notes ? notes.trim() : '',
    status: initialStatus,
    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
  });

  // Trigger in-app notification for the pregnant woman if linked to a user
  try {
    if (woman.user) {
      await createNotification({
        recipient: woman.user,
        title: 'New Appointment Scheduled',
        message: `Your ${type} appointment has been scheduled for ${checkupDate.toLocaleDateString()} at ${time || '10:00 AM'}.`,
        type: 'appointment_scheduled',
        referenceId: checkup._id,
        referenceModel: 'Checkup',
      });
    }
  } catch (notifErr) {
    console.error('Failed to dispatch notification:', notifErr.message);
  }

  res.status(201).json(checkup);
});

// @desc    Update / Reschedule / Complete / Cancel appointment & record digital health details
// @route   PUT /api/worker/checkups/:id
// @access  Private (Worker)
const updateCheckup = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid appointment record ID format');
  }

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

  const {
    date,
    time,
    type,
    bloodPressure,
    weight,
    hemoglobin,
    bloodSugar,
    fetalHeartRate,
    fundalHeight,
    supplements,
    prescriptions,
    dangerSigns,
    notes,
    status,
    nextFollowUpDate,
    followUpNotes,
  } = req.body;

  const previousStatus = checkup.status;

  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400);
      throw new Error('Invalid appointment date format');
    }
    checkup.date = parsedDate;
  }
  if (time) checkup.time = time;
  if (type) checkup.type = type.trim();
  if (bloodPressure !== undefined) checkup.bloodPressure = bloodPressure.trim();
  if (weight !== undefined) checkup.weight = weight !== '' ? Number(weight) : undefined;
  if (hemoglobin !== undefined) checkup.hemoglobin = hemoglobin !== '' ? Number(hemoglobin) : undefined;
  if (bloodSugar !== undefined) checkup.bloodSugar = bloodSugar.trim();
  if (fetalHeartRate !== undefined) checkup.fetalHeartRate = fetalHeartRate !== '' ? Number(fetalHeartRate) : undefined;
  if (fundalHeight !== undefined) checkup.fundalHeight = fundalHeight !== '' ? Number(fundalHeight) : undefined;
  if (supplements !== undefined && Array.isArray(supplements)) checkup.supplements = supplements;
  if (prescriptions !== undefined && Array.isArray(prescriptions)) checkup.prescriptions = prescriptions;
  if (dangerSigns !== undefined && Array.isArray(dangerSigns)) checkup.dangerSigns = dangerSigns;
  if (notes !== undefined) checkup.notes = notes.trim();
  if (status) checkup.status = status;
  if (nextFollowUpDate !== undefined) {
    checkup.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : undefined;
  }
  if (followUpNotes !== undefined) checkup.followUpNotes = followUpNotes.trim();

  // If status is Upcoming or Overdue, re-evaluate based on date
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

  // Send status update notification
  try {
    if (woman.user && status && status !== previousStatus) {
      let notifTitle = 'Appointment Update';
      let notifType = 'appointment_rescheduled';
      if (status === 'Completed') {
        notifTitle = 'Checkup Completed & Records Updated';
        notifType = 'checkup_completed';
      } else if (status === 'Cancelled') {
        notifTitle = 'Appointment Cancelled';
        notifType = 'general';
      } else if (status === 'Missed') {
        notifTitle = 'Missed Appointment Notice';
        notifType = 'overdue_alert';
      }

      await createNotification({
        recipient: woman.user,
        title: notifTitle,
        message: `Your checkup scheduled for ${new Date(checkup.date).toLocaleDateString()} status is now ${status}. ${followUpNotes || ''}`,
        type: notifType,
        referenceId: checkup._id,
        referenceModel: 'Checkup',
      });
    }
  } catch (notifErr) {
    console.error('Failed to dispatch status notification:', notifErr.message);
  }

  res.json(updatedCheckup);
});

// @desc    Get all appointments and follow-ups for worker's assigned patients
// @route   GET /api/worker/appointments
// @access  Private (Worker)
const getWorkerAppointments = asyncHandler(async (req, res) => {
  const women = await Woman.find({ assignedWorker: req.user._id });
  const womanIds = women.map((w) => w._id);

  if (womanIds.length === 0) {
    return res.json({ upcoming: [], overdue: [], completed: [], missed: [], cancelled: [], all: [] });
  }

  await syncOverdueStatus(womanIds);

  const all = await Checkup.find({ woman: { $in: womanIds } })
    .populate('woman', 'name age phone address pregnancyWeek bloodGroup expectedDeliveryDate')
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
