// Feature: smart-diagnosis-center
// Report Routes — upload and download medical reports

import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import upload from '../middleware/upload.js';
import { uploadReport, downloadReport } from '../services/reportService.js';

const router = Router();

// POST / — doctor uploads a report (multipart/form-data)
router.post(
  '/',
  authMiddleware,
  requireRole('doctor'),
  upload.single('report'),
  async (req, res, next) => {
    try {
      const { caseId, patientId } = req.body;
      const report = await uploadReport(req.file, caseId, req.user.id, patientId);
      res.status(201).json({ success: true, data: report, message: 'Report uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /:id — patient/doctor/admin downloads a report as PDF
router.get(
  '/:id',
  authMiddleware,
  requireRole('patient', 'doctor', 'admin'),
  async (req, res, next) => {
    try {
      const buffer = await downloadReport(req.params.id, req.user.id, req.user.role);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.pdf"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
