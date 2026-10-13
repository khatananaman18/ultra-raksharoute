import express from 'express';
import { db } from '../db/store.js';
import { INITIAL_HOSPITALS, INITIAL_AMBULANCES, INITIAL_BOOKINGS, INITIAL_FOLLOWUPS, INITIAL_USERS } from '../db/seedData.js';
import { simulationService } from '../services/simulationService.js';

const router = express.Router();

// System KPIs
router.get('/', (req, res) => {
  const stats = db.getAnalytics();
  res.json({
    success: true,
    data: stats,
  });
});

// Notifications
router.get('/notifications', (req, res) => {
  const { userId, role } = req.query;
  const list = db.getNotifications(userId, role);
  res.json({ success: true, count: list.length, data: list });
});

// Reset Demo Environment
router.post('/reset-demo', (req, res) => {
  simulationService.stopAllSimulations();
  db.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
  db.ambulances = JSON.parse(JSON.stringify(INITIAL_AMBULANCES));
  db.users = JSON.parse(JSON.stringify(INITIAL_USERS));
  db.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
  db.followUps = JSON.parse(JSON.stringify(INITIAL_FOLLOWUPS));
  db.notifications = [];

  if (req.io) {
    req.io.emit('demo:reset', { message: 'Demo environment reset to initial state' });
  }

  res.json({ success: true, message: 'Platform demo state reset to initial seeds' });
});

export default router;
