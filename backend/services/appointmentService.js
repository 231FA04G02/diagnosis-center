// Feature: smart-diagnosis-center
import Appointment from '../models/Appointment.js';
import Case from '../models/Case.js';
import User from '../models/User.js';

let roundRobinIndex = 0;

/**
 * Assign a lab based on priority level.
 * Emergency/High → 'urgent-care-lab', Medium/Low → 'general-lab'
 *
 * @param {string} priorityLevel
 * @returns {'urgent-care-lab'|'general-lab'}
 */
export function assignLab(priorityLevel) {
  return priorityLevel === 'Emergency' || priorityLevel === 'High'
    ? 'urgent-care-lab'
    : 'general-lab';
}

/**
 * Assign a doctor based on priority level.
 * Emergency/High: available doctor with minimum activeHighCases.
 * Medium/Low: round-robin across available doctors.
 *
 * @param {string} priorityLevel
 * @returns {Promise<object|null>}
 */
export async function assignDoctor(priorityLevel) {
  const availableDoctors = await User.find({ role: 'doctor', isAvailable: true }).lean();
  if (!availableDoctors.length) return null;

  if (priorityLevel === 'Emergency' || priorityLevel === 'High') {
    return availableDoctors.reduce((min, doc) =>
      doc.activeHighCases < min.activeHighCases ? doc : min
    );
  }

  // Round-robin for Medium/Low
  const doctor = availableDoctors[roundRobinIndex % availableDoctors.length];
  roundRobinIndex = (roundRobinIndex + 1) % availableDoctors.length;
  return doctor;
}

/**
 * Create an appointment for a case.
 *
 * @param {string} caseId
 * @param {string} patientId
 * @param {string} priorityLevel
 * @returns {Promise<object>} Created Appointment document
 */
export async function createAppointment(caseId, patientId, priorityLevel) {
  const doctor = await assignDoctor(priorityLevel);
  const lab = assignLab(priorityLevel);

  // Estimate queue position for appointment time
  const queueCount = await Appointment.countDocuments({ status: 'scheduled' });
  const appointmentTime = new Date(Date.now() + 15 * 60 * 1000 * (queueCount + 1));

  const appointment = await Appointment.create({
    caseId,
    patientId,
    doctorId: doctor ? doctor._id : null,
    labName: lab,
    appointmentTime,
    status: 'scheduled',
  });

  // Update the Case document
  await Case.findByIdAndUpdate(caseId, {
    assignedDoctorId: doctor ? doctor._id : null,
    labName: lab,
    status: 'active',
  });

  // Increment activeHighCases for Emergency/High doctor
  if ((priorityLevel === 'Emergency' || priorityLevel === 'High') && doctor) {
    await User.findByIdAndUpdate(doctor._id, { $inc: { activeHighCases: 1 } });
  }

  return appointment;
}

/**
 * Cancel an appointment. Throws if cancellation is within 60 minutes.
 *
 * @param {string} appointmentId
 * @param {string} patientId
 * @returns {Promise<object>} Updated Appointment document
 */
export async function cancelAppointment(appointmentId, patientId) {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.status = 404;
    throw err;
  }

  if (String(appointment.patientId) !== String(patientId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const minutesUntil = (appointment.appointmentTime - Date.now()) / 60000;
  if (minutesUntil < 60) {
    const err = new Error('Cannot cancel appointment within 60 minutes of scheduled time');
    err.status = 400;
    throw err;
  }

  appointment.status = 'cancelled';
  await appointment.save();
  return appointment;
}

/**
 * Get all appointments for a patient, sorted ascending by appointmentTime.
 *
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function getPatientAppointments(patientId) {
  return Appointment.find({ patientId })
    .sort({ appointmentTime: 1 })
    .populate('doctorId', 'name email')
    .lean();
}
