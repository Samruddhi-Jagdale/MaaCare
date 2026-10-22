// controllers/womanController.js
const asyncHandler = require('express-async-handler');
const Woman = require('../models/Woman');
const Checkup = require('../models/Checkup');

// @desc    Get profile, pregnancy record, assigned worker, and appointment timeline for the logged-in pregnant woman
// @route   GET /api/woman/profile
// @access  Private (Woman)
const getMyRecord = asyncHandler(async (req, res) => {
  // Find pregnancy details linked to this user account
  const woman = await Woman.findOne({ user: req.user._id })
    .populate('assignedWorker', 'name email phone isActive');

  let checkups = [];
  if (woman) {
    // Automatically update overdue status for this woman's appointments
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    await Checkup.updateMany(
      { woman: woman._id, status: 'Upcoming', date: { $lt: startOfToday } },
      { $set: { status: 'Overdue' } }
    );

    checkups = await Checkup.find({ woman: woman._id }).sort({ date: -1 });
  }

  // Identify next upcoming appointment and any overdue follow-up alerts
  const upcomingAppointments = checkups.filter((c) => c.status === 'Upcoming');
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[upcomingAppointments.length - 1] : null;
  const overdueAppointments = checkups.filter((c) => c.status === 'Overdue');

  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
    pregnancyDetails: woman,
    checkups,
    nextAppointment,
    overdueCount: overdueAppointments.length,
  });
});

module.exports = {
  getMyRecord,
};
