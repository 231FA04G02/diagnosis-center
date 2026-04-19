// Feature: smart-diagnosis-center
// Notification Routes — FCM token registration

import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { registerToken } from '../services/notificationService.js';

const router = Router();

// POST /token — register FCM device token for the authenticated user
router.post('/token', authMiddleware, async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, data: null, message: 'fcmToken is required' });
    }
    await registerToken(req.user.id, fcmToken);
    res.status(200).json({ success: true, data: null, message: 'FCM token registered' });
  } catch (err) {
    next(err);
  }
});

export default router;
