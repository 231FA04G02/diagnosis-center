// Feature: smart-diagnosis-center
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import * as queueService from '../services/queueService.js';
import * as sseBroadcaster from '../services/sseBroadcaster.js';
import QueueEntry from '../models/QueueEntry.js';

const router = Router();

// GET /api/queue/position — patient: get own queue position
router.get('/position', authMiddleware, requireRole('patient'), async (req, res, next) => {
  try {
    const data = await queueService.getPosition(req.user.id);
    return res.status(200).json({
      success: true,
      data: data ?? { position: null, estimatedWaitMinutes: null },
      message: 'Queue position retrieved',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queue/all — doctor/admin: get full queue
router.get('/all', authMiddleware, requireRole('doctor', 'admin'), async (req, res, next) => {
  try {
    const entries = await QueueEntry.find()
      .sort({ symptomScore: -1, submittedAt: 1 })
      .populate('patientId', 'name email');
    return res.status(200).json({
      success: true,
      data: entries,
      message: 'Queue retrieved',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queue/stream — patient: SSE stream for queue updates
router.get('/stream', authMiddleware, requireRole('patient'), (req, res) => {
  sseBroadcaster.addClient(req.user.id, 'patient', res);
  req.on('close', () => sseBroadcaster.removeClient(req.user.id));
});

export default router;
