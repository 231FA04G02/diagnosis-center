import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
    fcmTokens: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    activeHighCases: { type: Number, default: 0 },
    avatar: { type: String, default: null }, // base64 data URL or file path
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
