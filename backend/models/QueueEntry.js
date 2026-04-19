import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priorityLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], required: true },
  symptomScore: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const QueueEntry = mongoose.model('QueueEntry', queueEntrySchema);
export default QueueEntry;
