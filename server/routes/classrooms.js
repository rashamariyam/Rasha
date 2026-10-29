const express = require('express');
const router = express.Router();
const { Classroom, ClassroomSchedule } = require('../models/Classroom');

// GET /api/classrooms
router.get('/', async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json({ success: true, classrooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/classrooms
router.post('/', async (req, res) => {
  try {
    const { roomNumber, building, capacity, floor } = req.body;
    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum < 1 || capNum > 1000 || !Number.isInteger(capNum)) {
      return res.status(400).json({ success: false, error: 'Capacity must be an integer between 1 and 1000' });
    }
    const floorNum = Number(floor);
    if (isNaN(floorNum) || floorNum < 0 || floorNum > 50 || !Number.isInteger(floorNum)) {
      return res.status(400).json({ success: false, error: 'Floor must be an integer between 0 and 50' });
    }
    const classroom = new Classroom({
      id: 'cr_' + Date.now(),
      roomNumber,
      building,
      capacity: Number(capacity) || 30,
      floor: Number(floor) || 1
    });
    await classroom.save();
    res.status(201).json({ success: true, classroom });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/classrooms/schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await ClassroomSchedule.find();
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/classrooms/schedules
router.post('/schedules', async (req, res) => {
  try {
    const { classroomId, date, startTime, endTime, purpose, bookedBy } = req.body;
    const schedule = new ClassroomSchedule({
      id: 'cs_' + Date.now(),
      classroomId,
      date,
      startTime,
      endTime,
      purpose,
      bookedBy
    });
    await schedule.save();
    res.status(201).json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
