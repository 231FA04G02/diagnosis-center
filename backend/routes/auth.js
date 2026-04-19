import { Router } from 'express';
import * as authService from '../services/authService.js';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const data = await authService.register(name, email, password, role);
    res.status(201).json({ success: true, data, message: 'Registration successful' });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ success: true, data, message: 'Login successful' });
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ success: false, data: null, message: err.message });
    }
    next(err);
  }
});

// GET /api/auth/me — get current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -fcmTokens').lean();
    if (!user) return res.status(404).json({ success: false, data: null, message: 'User not found' });
    res.json({ success: true, data: user, message: 'Profile retrieved' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/profile — update name
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, data: null, message: 'Name must be at least 2 characters' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select('-passwordHash -fcmTokens').lean();
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/avatar — upload profile photo (base64)
router.patch('/avatar', authMiddleware, async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar || !avatar.startsWith('data:image/')) {
      return res.status(400).json({ success: false, data: null, message: 'Invalid image data' });
    }
    // Limit size to ~2MB base64
    if (avatar.length > 2 * 1024 * 1024 * 1.37) {
      return res.status(400).json({ success: false, data: null, message: 'Image too large (max 2MB)' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select('-passwordHash -fcmTokens').lean();
    res.json({ success: true, data: { avatar: user.avatar }, message: 'Avatar updated' });
  } catch (err) {
    next(err);
  }
});

export default router;
