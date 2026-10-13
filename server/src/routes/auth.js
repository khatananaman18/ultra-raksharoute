import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import { config } from '../config.js';
import { authenticate } from '../utils/authMiddleware.js';

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

// 1-Click Demo Login (Supports instant persona switching)
router.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'patient', 'driver', 'hospital', 'admin'

  let targetUser = null;
  if (role === 'driver') {
    targetUser = db.getUserById('user-driver-01');
  } else if (role === 'hospital') {
    targetUser = db.getUserById('user-hosp-01');
  } else if (role === 'admin') {
    targetUser = db.getUserById('user-admin-01');
  } else {
    // Default to patient
    targetUser = db.getUserById('user-patient-01');
  }

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Demo persona not found' });
  }

  const token = generateToken(targetUser);
  return res.json({
    success: true,
    token,
    user: targetUser,
    message: `Logged in as demo ${targetUser.role} (${targetUser.name})`,
  });
});

// Standard Login
router.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user && role) {
    // Match by role if existing
    const users = db.users.filter(u => u.role === role);
    user = users[0];
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
  }

  const token = generateToken(user);
  return res.json({
    success: true,
    token,
    user,
  });
});

// Register
router.post('/register', (req, res) => {
  const { name, email, phone, role, organizationName, licenseNumber, emergencyContacts } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const newUser = db.createUser({
    name,
    email,
    phone: phone || '+91 99999 00000',
    role: role || 'patient',
    organizationName: organizationName || null,
    licenseNumber: licenseNumber || null,
    emergencyContacts: emergencyContacts || [
      { name: 'Primary Emergency Contact', phone: '+91 98765 00001', relationship: 'Family' }
    ],
  });

  const token = generateToken(newUser);
  return res.status(201).json({
    success: true,
    token,
    user: newUser,
  });
});

// Get current profile
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
