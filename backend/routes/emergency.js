// Feature: smart-diagnosis-center
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import Case from '../models/Case.js';
import User from '../models/User.js';
import EmergencyLog from '../models/EmergencyLog.js';
import * as queueService from '../services/queueService.js';
import * as notificationService from '../services/notificationService.js';
import * as sseBroadcaster from '../services/sseBroadcaster.js';

const router = Router();

// POST /alert — patient triggers emergency alert
router.post('/alert', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const patientId = req.user.id;

    // Find the patient's most recent active/pending case
    const patientCase = await Case.findOne({
      patientId,
      status: { $in: ['active', 'pending'] },
    }).sort({ submittedAt: -1 });

    if (!patientCase) {
      return res.status(404).json({ success: false, data: null, message: 'No active case found' });
    }

    // Escalate case to Emergency
    patientCase.symptomScore = 100;
    patientCase.priorityLevel = 'Emergency';
    patientCase.emergencyAlert = true;
    patientCase.emergencyAlertAt = new Date();
    await patientCase.save();

    // Move to front of queue
    await queueService.moveToFront(patientCase._id);

    // Create emergency log
    const triggeredAt = new Date();
    await EmergencyLog.create({ patientId, caseId: patientCase._id, triggeredAt });

    // Get patient info for notifications
    const patient = await User.findById(patientId).lean();
    const patientName = patient ? patient.name : 'Unknown';

    // Send push notification to all doctors
    notificationService.sendToRole(
      'doctor',
      'Emergency Alert',
      `Patient ${patientName} needs immediate help`,
      { caseId: String(patientCase._id) }
    ).catch(() => {}); // fire-and-forget

    // Broadcast SSE to doctors and admins
    const eventData = { patientName, caseId: patientCase._id, triggeredAt };
    sseBroadcaster.broadcastToRole('doctor', 'emergency', eventData);
    sseBroadcaster.broadcastToRole('admin', 'emergency', eventData);

    return res.status(200).json({
      success: true,
      data: { caseId: patientCase._id },
      message: 'Emergency alert triggered',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message });
  }
});

export default router;
