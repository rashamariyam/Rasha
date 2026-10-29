const express = require('express');
const router = express.Router();
const { GreenCardSlot, Booking } = require('../models/GreenCard');

// GET /api/greencard/slots
router.get('/slots', async (req, res) => {
  try {
    const slots = await GreenCardSlot.find();
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/greencard/slots - add a new slot
router.post('/slots', async (req, res) => {
  try {
    const { title, date, startTime, endTime, capacity } = req.body;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (!date || date < today) {
      return res.status(400).json({ success: false, error: 'Slot date cannot be in the past' });
    }
    const newSlot = new GreenCardSlot({
      id: 'gc_' + Date.now(),
      title,
      date,
      startTime,
      endTime,
      capacity: Number(capacity) || 1,
      bookedIds: []
    });
    await newSlot.save();
    res.status(201).json({ success: true, slot: newSlot });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/greencard/book - book a slot
router.post('/book', async (req, res) => {
  try {
    const { slotId, studentId, studentName } = req.body;
    const slot = await GreenCardSlot.findOne({ id: slotId });
    if (!slot) return res.status(404).json({ success: false, error: 'Slot not found' });

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (slot.date < today) {
      return res.status(400).json({ success: false, error: 'Cannot book a slot for a past date' });
    }

    if (slot.bookedIds.includes(studentId)) {
      return res.status(400).json({ success: false, error: 'You have already booked this slot' });
    }
    if (slot.bookedIds.length >= slot.capacity) {
      return res.status(400).json({ success: false, error: 'This slot is full' });
    }

    slot.bookedIds.push(studentId);
    await slot.save();

    const booking = new Booking({
      id: 'bk_' + Date.now(),
      slotId,
      studentId,
      studentName,
      bookedAt: new Date().toISOString()
    });
    await booking.save();

    res.json({ success: true, slot, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/greencard/cancel - cancel a booking
router.post('/cancel', async (req, res) => {
  try {
    const { slotId, studentId } = req.body;
    const slot = await GreenCardSlot.findOne({ id: slotId });
    if (slot) {
      slot.bookedIds = slot.bookedIds.filter((id) => id !== studentId);
      await slot.save();
    }
    await Booking.findOneAndDelete({ slotId, studentId });
    res.json({ success: true, message: 'Booking canceled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/greencard/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { studentId } : {};
    const bookings = await Booking.find(filter);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
