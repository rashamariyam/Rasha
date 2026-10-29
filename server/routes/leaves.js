const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/leaves - get leaves (optional filter by studentId or department)
router.get('/', async (req, res) => {
  try {
    const { studentId, department, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (department) filter.department = department;
    if (status) filter.status = status;

    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, leaves });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/leaves - submit new leave application
router.post('/', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      rollNo,
      department,
      leaveType,
      startDate,
      endDate,
      reason,
      documentName,
      documentUrl,
      documentType
    } = req.body;

    const id = 'lv_' + Date.now();
    const createdAt = new Date().toISOString();

    const newLeave = new LeaveRequest({
      id,
      studentId,
      studentName,
      rollNo,
      department,
      leaveType,
      startDate,
      endDate,
      reason,
      documentName,
      documentUrl,
      documentType,
      status: 'pending',
      teacherApproved: false,
      hodApproved: false,
      createdAt
    });

    await newLeave.save();

    // Create notifications for teachers of the department
    const teachers = await User.find({ role: 'teacher', department, accountStatus: 'active' });
    const notifications = teachers.map((t) => ({
      id: 'nt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: t.id,
      title: 'New Leave Request',
      message: `${studentName} submitted a ${leaveType} request.`,
      type: 'info',
      read: false,
      createdAt
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, leave: newLeave });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/leaves/:id/decide - approve or reject leave
router.patch('/:id/decide', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, note, role, deciderName } = req.body;

    const leave = await LeaveRequest.findOne({ id });
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    let status = leave.status;
    let teacherApproved = leave.teacherApproved;
    let hodApproved = leave.hodApproved;

    if (role === 'teacher') {
      teacherApproved = approved;
      if (!approved) status = 'rejected';
      else if (leave.hodApproved) status = 'approved';
      else status = 'pending';
    } else if (role === 'hod' || role === 'admin') {
      hodApproved = approved;
      if (!approved) status = 'rejected';
      else if (teacherApproved) status = 'approved';
      else status = 'pending';
    }

    leave.status = status;
    leave.teacherApproved = teacherApproved;
    leave.hodApproved = hodApproved;
    leave.decidedBy = deciderName || 'Reviewer';
    leave.decidedAt = new Date().toISOString();
    if (note) leave.decisionNote = note;

    await leave.save();

    // Notify student
    const notifMsg = approved
      ? `Your ${leave.leaveType} request has been ${status === 'approved' ? 'approved' : 'partially approved'} by ${leave.decidedBy}.`
      : `Your ${leave.leaveType} request has been rejected by ${leave.decidedBy}.`;

    const notification = new Notification({
      id: 'nt_' + Date.now(),
      userId: leave.studentId,
      title: `Leave ${status === 'rejected' ? 'Rejected' : 'Updated'}`,
      message: notifMsg,
      type: approved ? 'success' : 'error',
      read: false,
      createdAt: new Date().toISOString()
    });
    await notification.save();

    res.json({ success: true, leave });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
