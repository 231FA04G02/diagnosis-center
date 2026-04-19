import mongoose from 'mongoose';

const emergencyLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  triggeredAt: { type: Date, default: Date.now },
  notifiedDoctors: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
});

const EmergencyLog = mongoose.model('EmergencyLog', emergencyLogSchema);
export default EmergencyLog;
