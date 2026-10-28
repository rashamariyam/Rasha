const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNumber: { type: String, required: true },
  building: { type: String, required: true },
  capacity: { type: Number, required: true },
  floor: { type: Number, required: true },
});

const ClassroomScheduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  classroomId: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  purpose: { type: String, required: true },
  bookedBy: { type: String, required: true },
});

const Classroom = mongoose.model('Classroom', ClassroomSchema);
const ClassroomSchedule = mongoose.model('ClassroomSchedule', ClassroomScheduleSchema);

module.exports = { Classroom, ClassroomSchedule };
