const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'leaveease_secret_jwt_key_fallback';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate token helper
const generateToken = (user, rememberMe = false) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : JWT_EXPIRES_IN }
  );
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, targetRole, rememberMe } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identifier and password are required' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { rollNo: new RegExp(`^${identifier.trim()}$`, 'i') }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email address or college ID.' });
    }

    if (targetRole && user.role !== targetRole) {
      return res.status(403).json({
        success: false,
        error: `This account is registered as a ${user.role}. Please log in via the ${user.role.toUpperCase()} portal.`
      });
    }

    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Your account is awaiting administrator verification before access is granted.'
      });
    }
    if (user.accountStatus === 'disabled') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been disabled. Please contact the college administrator.'
      });
    }
    if (user.accountStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        error: 'Your account registration was rejected. Please contact the administrator.'
      });
    }

    // Verify password with bcrypt or credential hash
    let isValid = false;
    if (user.credential && user.credential.passwordHash) {
      isValid = await bcrypt.compare(password, user.credential.passwordHash);
      // Fallback check if plain hash or salt matched
      if (!isValid && user.credential.passwordHash === password) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    const token = generateToken(user, rememberMe);
    const userObj = user.toObject();
    delete userObj.credential;

    return res.json({ success: true, token, user: userObj });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during authentication' });
  }
});

// POST /api/auth/register-student
router.post('/register-student', async (req, res) => {
  try {
    const { name, email, rollNo, department, course, semester, phone, password } = req.body;
    if (!name || !email || !rollNo || !password) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
      }
    }

    if (semester !== undefined) {
      const semNum = Number(semester);
      if (isNaN(semNum) || semNum < 1 || semNum > 8) {
        return res.status(400).json({ success: false, error: 'Semester must be a valid number between 1 and 8' });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRollNo = rollNo.trim().toUpperCase();

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const existingRoll = await User.findOne({ rollNo: cleanRollNo });
    if (existingRoll) {
      return res.status(409).json({ success: false, error: 'An account with this student ID / Register number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUserId = 'u_stu_' + Date.now();

    const newUser = new User({
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: 'student',
      department,
      course,
      semester: Number(semester) || 1,
      year: Math.ceil((Number(semester) || 1) / 2),
      rollNo: cleanRollNo,
      phone: phone ? phone.trim() : undefined,
      accountStatus: 'active',
      isDemo: false,
      credential: {
        userId: newUserId,
        email: cleanEmail,
        collegeId: cleanRollNo,
        passwordHash,
        salt,
      }
    });

    await newUser.save();
    const token = generateToken(newUser);
    const userObj = newUser.toObject();
    delete userObj.credential;

    return res.status(201).json({ success: true, token, user: userObj });
  } catch (err) {
    console.error('Register student error:', err);
    return res.status(500).json({ success: false, error: 'Server error during student registration' });
  }
});

// POST /api/auth/register-teacher
router.post('/register-teacher', async (req, res) => {
  try {
    const { name, email, rollNo, department, phone, password, inviteCode } = req.body;
    if (!name || !email || !rollNo || !password) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = rollNo.trim().toUpperCase();

    const existing = await User.findOne({ $or: [{ email: cleanEmail }, { rollNo: cleanEmpId }] });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this official email or Employee ID already exists.' });
    }

    const isVerified = inviteCode && inviteCode.trim().toUpperCase() === 'FACULTY2025';
    const status = isVerified ? 'active' : 'pending';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUserId = 'u_tch_' + Date.now();

    const newUser = new User({
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: 'teacher',
      department,
      rollNo: cleanEmpId,
      phone: phone ? phone.trim() : undefined,
      accountStatus: status,
      isDemo: false,
      credential: {
        userId: newUserId,
        email: cleanEmail,
        collegeId: cleanEmpId,
        passwordHash,
        salt,
      }
    });

    await newUser.save();
    const token = generateToken(newUser);
    const userObj = newUser.toObject();
    delete userObj.credential;

    return res.status(201).json({
      success: true,
      status,
      token: status === 'active' ? token : null,
      user: userObj
    });
  } catch (err) {
    console.error('Register teacher error:', err);
    return res.status(500).json({ success: false, error: 'Server error during teacher registration' });
  }
});

module.exports = router;
