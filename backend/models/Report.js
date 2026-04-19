import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: {
    type: String,
    required: true,
    enum: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
