// Feature: smart-diagnosis-center
// Dashboard Routes — active cases, SSE stream, analytics

import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import Case from '../models/Case.js';
import QueueEntry from '../models/QueueEntry.js';
import { addClient, removeClient } from '../services/sseBroadcaster.js';
import {
  getDailyPatientCounts,
  getDailyRevenue,
  getPriorityBreakdown,
} from '../services/analyticsService.js';

const router = Router();

// Priority sort order for dashboard
const PRIORITY_ORDER = { Emergency: 4, High: 3, Medium: 2, Low: 1 };

// GET /cases — all active cases sorted by symptomScore desc
router.get('/cases', authMiddleware, requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const cases = await Case.find({ status: { $in: ['pending', 'active'] } })
      .sort({ symptomScore: -1 })
      .populate('patientId', 'name')
      .populate('assignedDoctorId', 'name')
      .lean();

    // Attach queue positions
    const queueEntries = await QueueEntry.find().sort({ symptomScore: -1, submittedAt: 1 }).lean();
    const positionMap = new Map();
    queueEntries.forEach((entry, index) => {
      positionMap.set(entry.caseId.toString(), index + 1);
    });

    const data = cases.map((c) => ({
      ...c,
      queuePosition: positionMap.get(c._id.toString()) ?? null,
    }));

    res.json({ success: true, data, message: 'Active cases retrieved' });
  } catch (err) {
    next(err);
  }
});

// GET /stream — SSE stream for dashboard updates
router.get('/stream', authMiddleware, requireRole('doctor', 'admin'), (req, res) => {
  addClient(req.user.id, req.user.role, res);
  req.on('close', () => removeClient(req.user.id));
});

// GET /analytics — analytics data for admin
router.get('/analytics', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const consultationFee = Number(process.env.CONSULTATION_FEE) || 100;

    const [dailyPatientCounts, dailyRevenue, priorityBreakdown] = await Promise.all([
      getDailyPatientCounts(startDate, endDate),
      getDailyRevenue(startDate, endDate, consultationFee),
      getPriorityBreakdown(endDate || new Date()),
    ]);

    res.json({
      success: true,
      data: { dailyPatientCounts, dailyRevenue, priorityBreakdown },
      message: 'Analytics retrieved',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
