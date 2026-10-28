const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { 'credential.passwordHash': 0, 'credential.salt': 0 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:id/status - approve, reject, or disable user account
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'rejected', 'disabled', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid account status' });
    }

    const user = await User.findOneAndUpdate(
      { id },
      { accountStatus: status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findOneAndDelete({ id });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
