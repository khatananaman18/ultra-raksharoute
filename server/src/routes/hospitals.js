import express from 'express';
import { db } from '../db/store.js';
import { calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';

const router = express.Router();

// List hospitals, optionally sorted by distance to patient coordinates
router.get('/', (req, res) => {
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng) : null;

  let list = db.getAllHospitals().map(h => {
    const ambulances = db.getAmbulancesByHospitalId(h.id);
    const availableAmbulanceCount = ambulances.filter(a => a.availability === 'AVAILABLE').length;

    let distanceKm = null;
    let etaMinutes = null;

    if (lat && lng && h.location) {
      distanceKm = calculateDistanceKm(lat, lng, h.location.lat, h.location.lng);
      etaMinutes = calculateEtaMinutes(distanceKm);
    }

    return {
      ...h,
      ambulanceCount: ambulances.length,
      availableAmbulanceCount,
      distanceKm,
      etaMinutes,
    };
  });

  if (lat && lng) {
    list.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
  }

  res.json({ success: true, count: list.length, data: list });
});

// Single hospital details
router.get('/:id', (req, res) => {
  const hospital = db.getHospitalById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  const ambulances = db.getAmbulancesByHospitalId(hospital.id);
  res.json({
    success: true,
    data: {
      ...hospital,
      ambulances,
    },
  });
});

// Update hospital emergency capacity
router.patch('/:id/capacity', (req, res) => {
  const { id } = req.params;
  const {
    icuAvailableBeds,
    icuTotalBeds,
    emergencyDepartmentStatus,
    oxygenSupplyStatus,
    bloodBankStatus,
  } = req.body;

  const updates = {};
  if (icuAvailableBeds !== undefined) updates.icuAvailableBeds = Number(icuAvailableBeds);
  if (icuTotalBeds !== undefined) updates.icuTotalBeds = Number(icuTotalBeds);
  if (emergencyDepartmentStatus !== undefined) updates.emergencyDepartmentStatus = emergencyDepartmentStatus;
  if (oxygenSupplyStatus !== undefined) updates.oxygenSupplyStatus = oxygenSupplyStatus;
  if (bloodBankStatus !== undefined) updates.bloodBankStatus = bloodBankStatus;

  const updated = db.updateHospitalCapacity(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  // Socket broadcast
  if (req.io) {
    req.io.emit('hospital:capacity:update', updated);
  }

  res.json({ success: true, message: 'Hospital emergency capacity updated', data: updated });
});

export default router;
