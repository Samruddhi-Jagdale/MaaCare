// controllers/adminController.js
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Woman = require('../models/Woman');
const Checkup = require('../models/Checkup');

// Helper to calculate trimester from pregnancy week
const getTrimester = (week) => {
  if (!week || week < 1) return 'unspecified';
  if (week <= 12) return 'trimester1';
  if (week <= 26) return 'trimester2';
  return 'trimester3';
};

// Dashboard statistics & workload analytics from real database records
const dashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Sync overdue status across all upcoming records
  await Checkup.updateMany(
    { status: 'Upcoming', date: { $lt: startOfToday } },
    { $set: { status: 'Overdue' } }
  );

  // Date range filters for appointments if specified
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }
  const checkupQuery = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

  const totalWomen = await Woman.countDocuments();
  const totalWorkers = await User.countDocuments({ role: 'worker', isActive: { $ne: false } });
  const inactiveWorkers = await User.countDocuments({ role: 'worker', isActive: false });

  const upcomingCheckups = await Checkup.countDocuments({ ...checkupQuery, status: 'Upcoming' });
  const overdueCheckups = await Checkup.countDocuments({ ...checkupQuery, status: 'Overdue' });
  const completedCheckups = await Checkup.countDocuments({ ...checkupQuery, status: 'Completed' });
  const missedCheckups = await Checkup.countDocuments({ ...checkupQuery, status: 'Missed' });
  const cancelledCheckups = await Checkup.countDocuments({ ...checkupQuery, status: 'Cancelled' });
  const totalCheckups = await Checkup.countDocuments(checkupQuery);

  // Trimester distribution across all enrolled mothers
  const allWomenWeeks = await Woman.find().select('pregnancyWeek');
  const trimesterDistribution = {
    trimester1: 0,
    trimester2: 0,
    trimester3: 0,
    unspecified: 0,
  };
  allWomenWeeks.forEach((w) => {
    const t = getTrimester(w.pregnancyWeek);
    trimesterDistribution[t] = (trimesterDistribution[t] || 0) + 1;
  });

  // Recent 6 Months Trend (Real aggregate data)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthsMap = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthsMap[key] = { month: key, newMothers: 0, checkups: 0 };
  }

  const recentWomen = await Woman.find({ createdAt: { $gte: sixMonthsAgo } }).select('createdAt');
  recentWomen.forEach((w) => {
    const m = w.createdAt.toLocaleString('en-US', { month: 'short' });
    if (monthsMap[m]) monthsMap[m].newMothers++;
  });

  const recentCheckups = await Checkup.find({ date: { $gte: sixMonthsAgo } }).select('date');
  recentCheckups.forEach((c) => {
    const m = c.date.toLocaleString('en-US', { month: 'short' });
    if (monthsMap[m]) monthsMap[m].checkups++;
  });

  const trends = Object.values(monthsMap);

  // Workload per Health Worker with completed and pending visits
  const workers = await User.find({ role: 'worker' }).select('name email phone isActive');
  const workload = await Promise.all(
    workers.map(async (worker) => {
      const assignedWomenCount = await Woman.countDocuments({ assignedWorker: worker._id });
      const workerWomen = await Woman.find({ assignedWorker: worker._id }).select('_id');
      const womanIds = workerWomen.map((w) => w._id);

      const pendingAppointments = await Checkup.countDocuments({
        woman: { $in: womanIds },
        status: { $in: ['Upcoming', 'Overdue'] },
      });

      const completedVisits = await Checkup.countDocuments({
        woman: { $in: womanIds },
        status: 'Completed',
      });

      const overdueVisits = await Checkup.countDocuments({
        woman: { $in: womanIds },
        status: 'Overdue',
      });

      return {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        isActive: worker.isActive !== false,
        assignedWomenCount,
        pendingAppointments,
        completedVisits,
        overdueVisits,
      };
    })
  );

  res.json({
    totalWomen,
    totalWorkers,
    inactiveWorkers,
    upcomingCheckups,
    overdueCheckups,
    completedCheckups,
    missedCheckups,
    cancelledCheckups,
    totalCheckups,
    workload,
    trends,
    trimesterDistribution,
  });
});

// ---------- Women CRUD with Search, Filter & Pagination ----------
const getAllWomen = asyncHandler(async (req, res) => {
  const { search, workerId, page, limit } = req.query;

  const query = {};

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { phone: searchRegex }, { address: searchRegex }];
  }

  if (workerId) {
    if (workerId === 'unassigned') {
      query.assignedWorker = null;
    } else {
      query.assignedWorker = workerId;
    }
  }

  // If page/limit requested, return paginated structure; otherwise return raw array
  if (page && limit) {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [women, total] = await Promise.all([
      Woman.find(query)
        .populate('user', 'name email phone')
        .populate('assignedWorker', 'name email phone isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Woman.countDocuments(query),
    ]);

    return res.json({
      women,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  }

  const women = await Woman.find(query)
    .populate('user', 'name email phone')
    .populate('assignedWorker', 'name email phone isActive')
    .sort({ createdAt: -1 });

  res.json(women);
});

const getWomanById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid woman record ID format');
  }

  const woman = await Woman.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('assignedWorker', 'name email phone isActive');

  if (!woman) {
    res.status(404);
    throw new Error('Woman not found');
  }

  const checkups = await Checkup.find({ woman: woman._id }).sort({ date: -1 });
  res.json({ woman, checkups });
});

const createWoman = asyncHandler(async (req, res) => {
  const {
    name,
    userId,
    age,
    phone,
    address,
    pregnancyWeek,
    expectedDelivery,
    expectedDeliveryDate,
    lastMenstrualPeriod,
    bloodGroup,
    assignedWorker,
  } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error('Valid registered user ID is required');
  }

  const userDoc = await User.findById(userId);
  if (!userDoc || userDoc.role !== 'woman') {
    res.status(400);
    throw new Error('Selected user must be a registered pregnant woman');
  }

  // Prevent duplicate Woman profiles for the same User
  const existingProfile = await Woman.findOne({ user: userId });
  if (existingProfile) {
    res.status(400);
    throw new Error(`A clinical pregnancy profile already exists for ${userDoc.name}`);
  }

  // Validate assigned worker if provided
  let validatedWorkerId = null;
  if (assignedWorker && assignedWorker !== 'unassigned') {
    if (!mongoose.Types.ObjectId.isValid(assignedWorker)) {
      res.status(400);
      throw new Error('Invalid assigned health worker ID format');
    }
    const worker = await User.findOne({ _id: assignedWorker, role: 'worker', isActive: { $ne: false } });
    if (!worker) {
      res.status(400);
      throw new Error('Assigned user must be an active registered health worker');
    }
    validatedWorkerId = worker._id;
  }

  const womanName = name || userDoc.name || 'Anonymous';

  const woman = await Woman.create({
    name: womanName,
    user: userId,
    age: Number(age),
    phone: phone ? phone.trim() : (userDoc.phone || ''),
    address: address ? address.trim() : '',
    pregnancyWeek: pregnancyWeek ? Number(pregnancyWeek) : undefined,
    expectedDeliveryDate: expectedDeliveryDate || expectedDelivery ? new Date(expectedDeliveryDate || expectedDelivery) : undefined,
    lastMenstrualPeriod: lastMenstrualPeriod ? new Date(lastMenstrualPeriod) : undefined,
    bloodGroup: bloodGroup || 'B+',
    assignedWorker: validatedWorkerId,
    status: req.body.status || 'Active',
  });

  res.status(201).json(woman);
});

const updateWoman = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid woman record ID format');
  }

  // If assignedWorker is being updated, validate worker
  if (req.body.assignedWorker && req.body.assignedWorker !== 'unassigned') {
    if (!mongoose.Types.ObjectId.isValid(req.body.assignedWorker)) {
      res.status(400);
      throw new Error('Invalid assigned health worker ID format');
    }
    const worker = await User.findOne({ _id: req.body.assignedWorker, role: 'worker', isActive: { $ne: false } });
    if (!worker) {
      res.status(400);
      throw new Error('Assigned user must be an active registered health worker');
    }
  }

  const updated = await Woman.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedWorker', 'name email phone');

  if (!updated) {
    res.status(404);
    throw new Error('Woman not found');
  }

  res.json(updated);
});

const deleteWoman = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid woman record ID format');
  }

  const woman = await Woman.findByIdAndDelete(req.params.id);
  if (!woman) {
    res.status(404);
    throw new Error('Woman not found');
  }
  await Checkup.deleteMany({ woman: req.params.id });
  res.status(204).end();
});

// ---------- Workers ----------
const getAllWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });
  res.json(workers);
});

const createWorker = asyncHandler(async (req, res) => {
  let { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Worker name, email, and initial password are required');
  }

  name = name.trim();
  email = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already in use by another account');
  }

  const worker = await User.create({
    name,
    email,
    phone: phone ? phone.trim() : '',
    password,
    role: 'worker',
    isActive: true,
  });

  res.status(201).json({
    _id: worker._id,
    name: worker.name,
    email: worker.email,
    phone: worker.phone,
    role: worker.role,
    isActive: worker.isActive,
  });
});

const toggleWorkerStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid health worker ID format');
  }

  const worker = await User.findOne({ _id: req.params.id, role: 'worker' });
  if (!worker) {
    res.status(404);
    throw new Error('Health worker not found');
  }

  worker.isActive = !worker.isActive;
  worker.deactivatedAt = worker.isActive ? null : new Date();
  await worker.save();

  res.json({
    _id: worker._id,
    name: worker.name,
    email: worker.email,
    isActive: worker.isActive,
    message: `Worker account ${worker.isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

const assignWomanToWorker = asyncHandler(async (req, res) => {
  const { id, workerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid woman record ID format');
  }

  let targetWorkerId = null;
  if (workerId !== 'unassigned') {
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      res.status(400);
      throw new Error('Invalid health worker ID format');
    }
    const worker = await User.findOne({ _id: workerId, role: 'worker', isActive: { $ne: false } });
    if (!worker) {
      res.status(400);
      throw new Error('Assigned user must be an active registered health worker');
    }
    targetWorkerId = worker._id;
  }

  const woman = await Woman.findByIdAndUpdate(
    id,
    { assignedWorker: targetWorkerId },
    { new: true }
  ).populate('assignedWorker', 'name email phone');

  if (!woman) {
    res.status(404);
    throw new Error('Woman record not found');
  }
  res.json(woman);
});

const getWomenUsers = asyncHandler(async (req, res) => {
  // Exclude mothers who already have an enrolled Woman clinical profile
  const enrolledUserIds = await Woman.distinct('user');
  const users = await User.find({
    role: 'woman',
    _id: { $nin: enrolledUserIds },
    isActive: { $ne: false },
  }).select('-password').sort({ createdAt: -1 });

  res.json(users);
});

// ---------- CSV Export Endpoints ----------
const exportWomenCSV = asyncHandler(async (req, res) => {
  const women = await Woman.find()
    .populate('assignedWorker', 'name phone')
    .sort({ createdAt: -1 });

  let csv = 'Name,Age,Phone,Gestation Week,Expected Delivery Date,Blood Group,Assigned Health Worker,Enrolled Date\n';

  women.forEach((w) => {
    const edd = w.expectedDeliveryDate ? new Date(w.expectedDeliveryDate).toISOString().split('T')[0] : 'N/A';
    const workerName = w.assignedWorker?.name ? `"${w.assignedWorker.name}"` : 'Unassigned';
    const enrolled = w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : 'N/A';
    const safeName = `"${w.name.replace(/"/g, '""')}"`;

    csv += `${safeName},${w.age || ''},${w.phone || ''},${w.pregnancyWeek || ''},${edd},${w.bloodGroup || ''},${workerName},${enrolled}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="maacare_enrolled_mothers.csv"');
  res.status(200).send(csv);
});

const exportCheckupsCSV = asyncHandler(async (req, res) => {
  const checkups = await Checkup.find()
    .populate('woman', 'name phone')
    .sort({ date: -1 });

  let csv = 'Patient Name,Contact,Checkup Date,Time,Type,Blood Pressure,Weight (kg),Status,Next Follow-up\n';

  checkups.forEach((c) => {
    const patientName = c.woman?.name ? `"${c.woman.name.replace(/"/g, '""')}"` : 'N/A';
    const patientPhone = c.woman?.phone || '';
    const date = c.date ? new Date(c.date).toISOString().split('T')[0] : 'N/A';
    const followUp = c.nextFollowUpDate ? new Date(c.nextFollowUpDate).toISOString().split('T')[0] : 'N/A';
    const bp = c.bloodPressure ? `"${c.bloodPressure}"` : '';

    csv += `${patientName},${patientPhone},${date},"${c.time || ''}","${c.type || ''}",${bp},${c.weight || ''},${c.status},${followUp}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="maacare_checkups_report.csv"');
  res.status(200).send(csv);
});

module.exports = {
  dashboardStats,
  getAllWomen,
  getWomanById,
  createWoman,
  updateWoman,
  deleteWoman,
  getAllWorkers,
  createWorker,
  toggleWorkerStatus,
  assignWomanToWorker,
  getWomenUsers,
  exportWomenCSV,
  exportCheckupsCSV,
};
