import { db } from '../db/store.js';

// Configurable timing thresholds (hours)
export const FOLLOW_UP_CONFIG = {
  BASIC: {
    hours: 12,
    label: 'Basic / Non-Critical',
    question: 'How is the patient doing following their transport?',
    defaultIntervalHours: 12,
  },
  MODERATE: {
    hours: 24,
    label: 'Moderate Emergency',
    question: 'How is the patient responding to emergency care at the hospital?',
    defaultIntervalHours: 24,
  },
  CRITICAL: {
    hours: 48,
    label: 'ICU / Critical Care Category',
    question: 'How is the patient doing now in Intensive Care / Trauma Recovery?',
    defaultIntervalHours: 48,
  },
};

/**
 * Automatically schedules a post-trip follow-up notification based on patient condition
 */
export function scheduleFollowUpForBooking(booking, io = null) {
  if (!booking) return null;

  const condition = (booking.conditionCategory || '').toUpperCase();
  let timingConfig = FOLLOW_UP_CONFIG.BASIC;

  if (condition.includes('CRITICAL') || condition.includes('ICU') || booking.ambulanceType?.includes('ICU')) {
    timingConfig = FOLLOW_UP_CONFIG.CRITICAL;
  } else if (condition.includes('MODERATE') || condition.includes('ALS') || booking.ambulanceType?.includes('ALS')) {
    timingConfig = FOLLOW_UP_CONFIG.MODERATE;
  }

  // Calculate target due date
  const dueAt = new Date(Date.now() + timingConfig.defaultIntervalHours * 60 * 60 * 1000).toISOString();

  const followUpItem = db.createFollowUp({
    bookingId: booking.id,
    patientId: booking.patientId,
    patientName: booking.patientName,
    patientPhone: booking.patientPhone,
    ambulanceType: booking.ambulanceType,
    hospitalName: booking.hospitalName,
    conditionCategory: timingConfig.label,
    scheduledTimingHours: timingConfig.defaultIntervalHours,
    dueAt,
    question: timingConfig.question,
    options: [
      'Patient is stable & recovering well',
      'Patient needs further medical assistance / consultation',
      'Urgent emergency assistance required now',
    ],
  });

  // Also dispatch in-app notification to patient
  const notif = db.addNotification({
    userId: booking.patientId,
    targetRole: 'patient',
    type: 'FOLLOW_UP_SCHEDULED',
    title: 'Post-Emergency Care Follow-Up Scheduled',
    message: `RakshaRoute has scheduled a health status check-in for ${booking.patientName} in ${timingConfig.defaultIntervalHours} hours.`,
    data: { followUpId: followUpItem.id, bookingId: booking.id },
  });

  if (io) {
    io.emit('notification:new', notif);
    io.emit('followup:created', followUpItem);
  }

  return followUpItem;
}

/**
 * Dispatches targeted notifications to relevant participants
 */
export function dispatchNotification({
  userId = null,
  targetRole = null,
  type,
  title,
  message,
  data = {},
  io = null,
}) {
  const notif = db.addNotification({
    userId,
    targetRole,
    type,
    title,
    message,
    data,
  });

  if (io) {
    io.emit('notification:new', notif);
  }

  return notif;
}
