const mongoose = require('mongoose');

const AuthCredentialSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, lowercase: true },
  collegeId: { type: String },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
});

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // matches frontend uid
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ['student', 'teacher', 'hod', 'admin'], required: true },
    department: { type: String, required: true },
    course: { type: String },
    semester: { type: Number },
    year: { type: Number },
    rollNo: { type: String, trim: true },
    phone: { type: String },
    accountStatus: {
      type: String,
      enum: ['active', 'pending', 'rejected', 'disabled'],
      default: 'pending',
    },
    isDemo: { type: Boolean, default: false },
    credential: { type: AuthCredentialSchema },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
