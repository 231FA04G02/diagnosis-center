// Feature: smart-diagnosis-center
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import Case from '../models/Case.js';
import Appointment from '../models/Appointment.js';
import {
  createAppointment,
  cancelAppointment,
  getPatientAppointments,
} from '../services/appointmentService.js';

const router = Router();

// POST / — patient creates appointment from a case
router.post('/', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) {
      return res.status(400).json({ success: false, data: null, message: 'caseId is required' });
    }

    const patientCase = await Case.findById(caseId).lean();
    if (!patientCase) {
      return res.status(404).json({ success: false, data: null, message: 'Case not found' });
    }

    const appointment = await createAppointment(caseId, req.user.id, patientCase.priorityLevel);
    return res.status(201).json({ success: true, data: appointment, message: 'Appointment created' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message });
  }
});

// GET / — patient gets own appointments
router.get('/', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const appointments = await getPatientAppointments(req.user.id);
    return res.status(200).json({ success: true, data: appointments, message: 'Appointments retrieved' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message });
  }
});

// DELETE /:id — patient cancels appointment
router.delete('/:id', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const appointment = await cancelAppointment(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: appointment, message: 'Appointment cancelled' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message });
  }
});

// GET /all — doctor/admin gets all appointments
router.get('/all', authMiddleware, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .lean();
    return res.status(200).json({ success: true, data: appointments, message: 'All appointments retrieved' });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, message: err.message });
  }
});

// PATCH /:id/status — doctor/admin updates appointment status
router.patch('/:id/status', authMiddleware, requireRole('doctor', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, data: null, message: 'Appointment not found' });
    }
    return res.status(200).json({ success: true, data: appointment, message: 'Appointment status updated' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message });
  }
});

export default router;
