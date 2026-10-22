// controllers/adminController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Woman = require('../models/Woman');
const Checkup = require('../models/Checkup');

// Dashboard statistics & workload analytics from real database records
const dashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Sync overdue status across all upcoming records
  await Checkup.updateMany(
    { status: 'Upcoming', date: { $lt: startOfToday } },
    { $set: { status: 'Overdue' } }
  );

  const totalWomen = await Woman.countDocuments();
  const totalWorkers = await User.countDocuments({ role: 'worker', isActive: { $ne: false } });
  const inactiveWorkers = await User.countDocuments({ role: 'worker', isActive: false });
  
  const upcomingCheckups = await Checkup.countDocuments({ status: 'Upcoming' });
  const overdueCheckups = await Checkup.countDocuments({ status: 'Overdue' });
  const completedCheckups = await Checkup.countDocuments({ status: 'Completed' });
  const missedCheckups = await Checkup.countDocuments({ status: 'Missed' });
  const cancelledCheckups = await Checkup.countDocuments({ status: 'Cancelled' });
  const totalCheckups = await Checkup.countDocuments();

  // Workload per Health Worker
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
      return {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        isActive: worker.isActive !== false,
        assignedWomenCount,
        pendingAppointments,
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
  });
});

// ---------- Women CRUD ----------
const getAllWomen = asyncHandler(async (req, res) => {
  const women = await Woman.find()
    .populate('user', 'name email phone')
    .populate('assignedWorker', 'name email phone isActive')
    .sort({ createdAt: -1 });
  res.json(women);
});

const getWomanById = asyncHandler(async (req, res) => {
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
  const { name, userId, age, phone, address, pregnancyWeek, expectedDelivery, expectedDeliveryDate, bloodGroup, assignedWorker } = req.body;
  
  let womanName = name;
  if (!womanName && userId) {
    const userDoc = await User.findById(userId);
    if (userDoc) womanName = userDoc.name;
  }

  const woman = await Woman.create({
    name: womanName || 'Anonymous',
    user: userId,
    age: Number(age),
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    pregnancyWeek: pregnancyWeek ? Number(pregnancyWeek) : undefined,
    expectedDeliveryDate: expectedDeliveryDate || expectedDelivery ? new Date(expectedDeliveryDate || expectedDelivery) : undefined,
    bloodGroup: bloodGroup || 'B+',
    assignedWorker: assignedWorker || null,
  });
  res.status(201).json(woman);
});

const updateWoman = asyncHandler(async (req, res) => {
  const updated = await Woman.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedWorker', 'name email phone');
  if (!updated) {
    res.status(404);
    throw new Error('Woman not found');
  }
  res.json(updated);
});

const deleteWoman = asyncHandler(async (req, res) => {
  const woman = await Woman.findByIdAndDelete(req.params.id);
  if (!woman) {
    res.status(404);
    throw new Error('Woman not found');
  }
  // Also clean up appointments associated with this record to keep DB consistent
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

// Deactivate or reactivate health worker account
const toggleWorkerStatus = asyncHandler(async (req, res) => {
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

// Assign a pregnant woman to a health worker
const assignWomanToWorker = asyncHandler(async (req, res) => {
  const { id, workerId } = req.params; // id = woman id
  const woman = await Woman.findByIdAndUpdate(
    id,
    { assignedWorker: workerId === 'unassigned' ? null : workerId },
    { new: true }
  ).populate('assignedWorker', 'name email phone');

  if (!woman) {
    res.status(404);
    throw new Error('Woman not found');
  }
  res.json(woman);
});

// Get registered user accounts with role 'woman' (for linking to pregnancy profile)
const getWomenUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'woman' }).select('-password').sort({ createdAt: -1 });
  res.json(users);
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
};
