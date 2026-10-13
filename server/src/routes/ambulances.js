import express from 'express';
import { db } from '../db/store.js';
import { executeDynamicRadiusSearch } from '../algorithms/dynamicRadius.js';
import { rankAmbulances } from '../algorithms/matchingEngine.js';

const router = express.Router();

// List all ambulances
router.get('/', (req, res) => {
  const { hospitalId, availability, category } = req.query;
  let list = db.getAllAmbulances();

  if (hospitalId) {
    list = list.filter(a => a.hospitalId === hospitalId);
  }
  if (availability) {
    list = list.filter(a => a.availability === availability.toUpperCase());
  }
  if (category) {
    list = list.filter(a => a.category === category.toUpperCase());
  }

  res.json({ success: true, count: list.length, data: list });
});

// Nearby ambulances with ranking
router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat) || 28.6139;
  const lng = parseFloat(req.query.lng) || 77.2090;
  const radius = parseFloat(req.query.radius) || 15;
  const requiredType = req.query.type || 'ANY';
  const destinationHospitalId = req.query.hospitalId || null;

  let available = db.getAllAmbulances().filter(a => a.availability === 'AVAILABLE');
  if (available.length === 0) {
    available = db.getAllAmbulances();
  }

  const ranked = rankAmbulances({
    pickupLat: lat,
    pickupLng: lng,
    ambulances: available,
    requiredType,
    destinationHospitalId,
    maxRadiusKm: radius,
  });

  let withinRadius = ranked.filter(a => a.distanceKm <= radius);
  if (withinRadius.length === 0) {
    withinRadius = ranked.slice(0, 5);
  }

  res.json({
    success: true,
    count: withinRadius.length,
    radiusKm: radius,
    data: withinRadius,
  });
});

// Dynamic progressive search radius (5km -> 10km -> 20km -> 30km)
router.post('/search-radius', (req, res) => {
  const {
    lat = 28.6139,
    lng = 77.2090,
    requiredType = 'ANY',
    destinationHospitalId = null,
  } = req.body;

  let available = db.getAllAmbulances().filter(a => a.availability === 'AVAILABLE');
  if (available.length === 0) {
    available = db.getAllAmbulances();
  }

  const result = executeDynamicRadiusSearch({
    pickupLat: Number(lat),
    pickupLng: Number(lng),
    availableAmbulances: available,
    requiredType,
    destinationHospitalId,
  });

  res.json({
    success: true,
    ...result,
  });
});

// Update location (GPS broadcast)
router.patch('/:id/location', (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ success: false, message: 'Lat and Lng are required' });
  }

  const updated = db.updateAmbulanceLocation(id, lat, lng);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Ambulance not found' });
  }

  // Socket broadcast
  if (req.io) {
    req.io.emit('driver:location:update', {
      ambulanceId: id,
      lat: Number(lat),
      lng: Number(lng),
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ success: true, data: updated });
});

// Update availability status (AVAILABLE, BUSY, OFFLINE)
router.patch('/:id/availability', (req, res) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (!['AVAILABLE', 'BUSY', 'OFFLINE'].includes(availability)) {
    return res.status(400).json({ success: false, message: 'Invalid availability status' });
  }

  const updated = db.updateAmbulanceAvailability(id, availability);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Ambulance not found' });
  }

  if (req.io) {
    req.io.emit('ambulance:status:update', { ambulanceId: id, availability });
  }

  res.json({ success: true, data: updated });
});

// Register new ambulance
router.post('/', (req, res) => {
  const {
    vehicleNumber,
    callSign,
    type,
    category,
    hospitalId,
    providerName,
    driverName,
    driverPhone,
    equipment,
    isICU,
  } = req.body;

  if (!vehicleNumber) {
    return res.status(400).json({ success: false, message: 'Vehicle number is required' });
  }

  const created = db.addAmbulance({
    vehicleNumber,
    callSign: callSign || `RapidUnit-${vehicleNumber.slice(-4)}`,
    type: type || 'Basic Ambulance',
    category: category || 'BLS',
    isICU: Boolean(isICU || category === 'ICU'),
    hospitalId: hospitalId || null,
    providerName: providerName || 'Private Fleet Partner',
    driverName: driverName || 'Assigned Driver',
    driverPhone: driverPhone || '+91 99999 11111',
    equipment: equipment || ['Basic First Aid', 'Oxygen Tank'],
  });

  res.status(201).json({ success: true, data: created });
});

// Delete/Decommission ambulance
router.delete('/:id', (req, res) => {
  const removed = db.removeAmbulance(req.params.id);
  if (!removed) {
    return res.status(404).json({ success: false, message: 'Ambulance not found' });
  }
  res.json({ success: true, message: 'Ambulance decommissioned', data: removed });
});

export default router;
