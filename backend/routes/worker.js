// routes/worker.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAssignedWomen,
  getWomanDetails,
  addCheckup,
  updateCheckup,
  getWorkerAppointments,
} = require('../controllers/workerController');

const router = express.Router();

// Apply authentication and role-based authorization for health workers
router.use(protect, authorize('worker'));

router.get('/women', getAssignedWomen);
router.get('/women/:id', getWomanDetails);
router.get('/appointments', getWorkerAppointments);
router.post('/checkups', addCheckup);
router.put('/checkups/:id', updateCheckup);

module.exports = router;
