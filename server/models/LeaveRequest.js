const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    department: { type: String, required: true },
    leaveType: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    documentName: { type: String },
    documentUrl: { type: String },
    documentType: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    teacherApproved: { type: Boolean, default: false },
    hodApproved: { type: Boolean, default: false },
    decidedBy: { type: String },
    decidedAt: { type: String },
    decisionNote: { type: String },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
