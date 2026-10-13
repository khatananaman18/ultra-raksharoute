import express from 'express';
import { db } from '../db/store.js';
import { executeDynamicRadiusSearch } from '../algorithms/dynamicRadius.js';
import { simulationService } from '../services/simulationService.js';
import { calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';
import { dispatchNotification } from '../services/notificationService.js';

const router = express.Router();

// 1-TAP EMERGENCY SOS DISPATCH
router.post('/sos', (req, res) => {
  const {
    pickupLat = 28.5672,
    pickupLng = 77.2100,
    pickupAddress = 'Current Detected Location (GPS Accurate)',
    patientId = 'user-patient-01',
    patientName = 'Rahul Sharma',
    patientPhone = '+91 98765 43210',
    conditionCategory = 'Critical Emergency',
    requiredType = 'ICU Ambulance',
    destinationHospitalId = null,
    emergencyNotes = 'Emergency SOS triggered via 1-tap fast button',
  } = req.body;

  // 1. Dynamic Radius Search to find the best suitable ambulance
  const availableAmbulances = db.getAllAmbulances().filter(a => a.availability === 'AVAILABLE');
  const searchResult = executeDynamicRadiusSearch({
    pickupLat: Number(pickupLat),
    pickupLng: Number(pickupLng),
    availableAmbulances,
    requiredType,
    destinationHospitalId,
  });

  if (searchResult.ambulances.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No available ambulances found nearby. Expanding to regional dispatch grid.',
      searchResult,
    });
  }

  const selectedAmbulance = searchResult.bestMatch;

  // 2. Select Hospital: If user didn't specify, auto-pick nearest hospital with open Emergency Dept
  let hospital = null;
  if (destinationHospitalId) {
    hospital = db.getHospitalById(destinationHospitalId);
  }
  if (!hospital) {
    // Pick nearest hospital with open Emergency
    const hospitals = db.getAllHospitals().filter(h => h.emergencyDepartmentStatus === 'Open 24/7');
    hospitals.sort((a, b) => {
      const distA = calculateDistanceKm(pickupLat, pickupLng, a.location.lat, a.location.lng);
      const distB = calculateDistanceKm(pickupLat, pickupLng, b.location.lat, b.location.lng);
      return distA - distB;
    });
    hospital = hospitals[0] || db.getAllHospitals()[0];
  }

  const initialDistance = calculateDistanceKm(
    pickupLat,
    pickupLng,
    selectedAmbulance.currentLocation.lat,
    selectedAmbulance.currentLocation.lng
  );
  const initialEta = calculateEtaMinutes(initialDistance);

  // 3. Create Booking Record
  const newBooking = db.createBooking({
    patientId,
    patientName,
    patientPhone,
    ambulanceId: selectedAmbulance.id,
    ambulanceType: selectedAmbulance.type,
    vehicleNumber: selectedAmbulance.vehicleNumber,
    callSign: selectedAmbulance.callSign,
    driverId: selectedAmbulance.driverId,
    driverName: selectedAmbulance.driverName,
    driverPhone: selectedAmbulance.driverPhone,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    pickupLocation: {
      address: pickupAddress,
      lat: Number(pickupLat),
      lng: Number(pickupLng),
    },
    destinationHospitalLocation: {
      address: hospital.address,
      lat: hospital.location.lat,
      lng: hospital.location.lng,
    },
    conditionCategory,
    emergencyNotes,
    currentDistanceKm: initialDistance,
    currentEtaMinutes: initialEta,
    isSos: true,
  });

  // 4. Trigger Real-time Sockets & Notifications
  if (req.io) {
    req.io.emit('emergency:sos:created', newBooking);
    req.io.emit('booking:created', newBooking);
    dispatchNotification({
      targetRole: 'driver',
      type: 'EMERGENCY_REQUEST',
      title: '🚨 PRIORITY EMERGENCY DISPATCH',
      message: `Emergency SOS from ${pickupAddress}. Patient: ${patientName}. Type: ${requiredType}.`,
      data: { bookingId: newBooking.id },
      io: req.io,
    });
  }

  // 5. Start automated demo simulation
  simulationService.startBookingSimulation(newBooking.id);

  return res.status(201).json({
    success: true,
    data: newBooking,
    searchRadiusKm: searchResult.searchRadiusKm,
    tiersAttempted: searchResult.tiersAttempted,
    matchingExplanation: selectedAmbulance.matchExplanation,
    matchScore: selectedAmbulance.matchScore,
  });
});

// MASS EMERGENCY MODE
router.post('/mass-emergency', (req, res) => {
  const {
    incidentName = 'Major Incident / Disaster Response',
    pickupLat = 28.5672,
    pickupLng = 77.2100,
    pickupAddress = 'Incident Ground Zero, Ring Road Delhi',
    totalRequested = 5,
    icuRequested = 2,
    blsRequested = 3,
    notes = 'Multi-casualty incident. Multiple ambulances dispatched.',
    requesterName = 'Emergency Incident Commander',
  } = req.body;

  const availableAmbulances = db.getAllAmbulances().filter(a => a.availability === 'AVAILABLE');
  const icuUnits = availableAmbulances.filter(a => a.isICU);
  const blsUnits = availableAmbulances.filter(a => !a.isICU);

  const assigned = [];
  // Assign ICU units
  for (let i = 0; i < Math.min(icuRequested, icuUnits.length); i++) {
    assigned.push(icuUnits[i]);
  }
  // Assign BLS units
  for (let i = 0; i < Math.min(blsRequested, blsUnits.length); i++) {
    assigned.push(blsUnits[i]);
  }

  const defaultHospital = db.getAllHospitals()[0];
  const massBookings = assigned.map(amb => {
    const booking = db.createBooking({
      patientId: 'incident-cmd-01',
      patientName: `${incidentName} (Unit ${amb.callSign})`,
      patientPhone: '+91 112 / 108',
      ambulanceId: amb.id,
      ambulanceType: amb.type,
      vehicleNumber: amb.vehicleNumber,
      callSign: amb.callSign,
      driverId: amb.driverId,
      driverName: amb.driverName,
      driverPhone: amb.driverPhone,
      hospitalId: defaultHospital.id,
      hospitalName: defaultHospital.name,
      pickupLocation: {
        address: pickupAddress,
        lat: Number(pickupLat),
        lng: Number(pickupLng),
      },
      destinationHospitalLocation: {
        address: defaultHospital.address,
        lat: defaultHospital.location.lat,
        lng: defaultHospital.location.lng,
      },
      conditionCategory: 'Mass Emergency Response',
      emergencyNotes: notes,
      isMassEmergency: true,
    });

    simulationService.startBookingSimulation(booking.id);
    return booking;
  });

  const confirmedCount = massBookings.length;
  const searchingCount = Math.max(0, totalRequested - confirmedCount);

  if (req.io) {
    req.io.emit('mass:emergency:declared', {
      incidentName,
      totalRequested,
      confirmedCount,
      searchingCount,
      bookings: massBookings,
    });
  }

  res.status(201).json({
    success: true,
    incidentName,
    totalRequested,
    confirmedCount,
    searchingCount,
    bookings: massBookings,
  });
});

// List Bookings
router.get('/', (req, res) => {
  const { patientId, driverId, hospitalId, status } = req.query;
  let list = db.getAllBookings();

  if (patientId) list = list.filter(b => b.patientId === patientId);
  if (driverId) list = list.filter(b => b.driverId === driverId);
  if (hospitalId) list = list.filter(b => b.hospitalId === hospitalId);
  if (status) list = list.filter(b => b.status === status);

  res.json({ success: true, count: list.length, data: list });
});

// Get Single Booking
router.get('/:id', (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
});

// Update Status manually (e.g. by driver or dispatcher)
router.patch('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const updated = db.updateBookingStatus(req.params.id, status, { note });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (req.io) {
    req.io.emit('booking:updated', updated);
    req.io.to(`booking:${updated.id}`).emit('booking:status:change', updated);
  }

  res.json({ success: true, data: updated });
});

// Cancel Booking
router.post('/:id/cancel', (req, res) => {
  const { reason = 'Cancelled by user' } = req.body;
  simulationService.stopSimulation(req.params.id);

  const updated = db.updateBookingStatus(req.params.id, 'CANCELLED', {
    cancellationReason: reason,
    note: `Trip cancelled: ${reason}`,
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (req.io) {
    req.io.emit('booking:updated', updated);
    req.io.to(`booking:${updated.id}`).emit('booking:cancelled', updated);
  }

  res.json({ success: true, message: 'Booking cancelled', data: updated });
});

// Add Review & Rating
router.post('/:id/review', (req, res) => {
  const { rating, reviewText } = req.body;
  if (!rating) {
    return res.status(400).json({ success: false, message: 'Rating is required' });
  }

  const updated = db.addBookingReview(req.params.id, rating, reviewText);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  res.json({ success: true, message: 'Thank you for your review', data: updated });
});

export default router;
