import express from 'express';
import { db } from '../db/store.js';

const router = express.Router();

// Get followups
router.get('/', (req, res) => {
  const { bookingId } = req.query;
  let items = db.getAllFollowUps();

  if (bookingId) {
    items = items.filter(f => f.bookingId === bookingId);
  }

  res.json({ success: true, count: items.length, data: items });
});

// Patient response to follow-up check-in
router.post('/:id/respond', (req, res) => {
  const { response, notes } = req.body;
  if (!response) {
    return res.status(400).json({ success: false, message: 'Response choice is required' });
  }

  const updated = db.updateFollowUp(req.params.id, {
    status: 'RESPONDED',
    patientResponse: response,
    responseNotes: notes || '',
    respondedAt: new Date().toISOString(),
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Follow-up not found' });
  }

  // If patient replied "Emergency assistance required now", flag an alert!
  if (response.toLowerCase().includes('emergency assistance required') && req.io) {
    req.io.emit('emergency:alert', {
      type: 'PATIENT_FOLLOWUP_ALARM',
      followUpId: updated.id,
      patientName: updated.patientName,
      message: `Critical alert: Patient ${updated.patientName} reported needing urgent emergency help in post-trip follow-up.`,
    });
  }

  res.json({ success: true, message: 'Status recorded successfully', data: updated });
});

export default router;
