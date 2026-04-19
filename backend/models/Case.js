import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptomDescription: { type: String, required: true, minlength: 10 },
    aiAnalysis: {
      summary: String,
      urgencyLevel: String,
      nextSteps: String,
      analyzedAt: Date,
    },
    symptomScore: { type: Number, enum: [25, 50, 75, 100], required: true },
    priorityLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], required: true },
    assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    labName: { type: String, enum: ['urgent-care-lab', 'general-lab'] },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    emergencyAlert: { type: Boolean, default: false },
    emergencyAlertAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Case = mongoose.model('Case', caseSchema);
export default Case;
