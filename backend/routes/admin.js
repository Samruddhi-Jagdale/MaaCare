// routes/admin.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateWomanCreate, validateWorkerCreate } = require('../middleware/validationMiddleware');
const {
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
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('admin'));

// Dashboard statistics & workload analytics
router.get('/stats', dashboardStats);

// Export CSV reports
router.get('/export/women', exportWomenCSV);
router.get('/export/checkups', exportCheckupsCSV);

// Women management
router.get('/women', getAllWomen);
router.get('/women-users', getWomenUsers);
router.get('/women/:id', getWomanById);
router.post('/women', validateWomanCreate, createWoman);
router.put('/women/:id', updateWoman);
router.delete('/women/:id', deleteWoman);
router.post('/women/:id/assign/:workerId', assignWomanToWorker);

// Health workers management (workers are users with role 'worker')
router.get('/workers', getAllWorkers);
router.post('/workers', validateWorkerCreate, createWorker);
router.patch('/workers/:id/toggle-status', toggleWorkerStatus);

module.exports = router;
