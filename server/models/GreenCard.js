const mongoose = require('mongoose');

const GreenCardSlotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  capacity: { type: Number, required: true },
  bookedIds: [{ type: String }],
});

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slotId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  bookedAt: { type: String, required: true },
});

const GreenCardSlot = mongoose.model('GreenCardSlot', GreenCardSlotSchema);
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = { GreenCardSlot, Booking };
