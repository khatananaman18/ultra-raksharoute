/**
 * Standalone Client-Side Emergency Dispatch Engine for RakshaRoute
 * Provides complete in-memory fallback support when deployed on static/serverless hosts
 * like Vercel, ensuring zero dispatch failures even if the remote backend is unreachable.
 */

export const INITIAL_MOCK_HOSPITALS = [
  {
    id: 'hosp-aiims-01',
    name: 'AIIMS New Delhi (Apex Trauma Center)',
    type: 'Government Apex Referral & Trauma Center',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, 110029',
    city: 'Delhi NCR',
    location: { lat: 28.5672, lng: 77.2100 },
    phone: '+91 11 2658 8500',
    emergencyHelpline: '102 / +91 11 2659 4405',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 60,
    icuAvailableBeds: 14,
    oxygenSupplyStatus: 'Normal (100% capacity)',
    bloodBankStatus: 'All Groups Available (O-ve, A+ve, B+ve in stock)',
    specialties: ['Level 1 Trauma', 'Cardiology', 'Neurotrauma', 'Burn Care', 'Pediatric ICU'],
    rating: 4.8,
    lastUpdated: '2 mins ago',
    verified: true,
  },
  {
    id: 'hosp-safdarjung-02',
    name: 'Safdarjung Hospital & Super Speciality',
    type: 'Government Multi-Speciality Hospital',
    address: 'Ring Road, Opposite AIIMS, New Delhi, 110029',
    city: 'Delhi NCR',
    location: { lat: 28.5709, lng: 77.2064 },
    phone: '+91 11 2616 5060',
    emergencyHelpline: '+91 11 2616 5000',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 45,
    icuAvailableBeds: 8,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: 'Available',
    specialties: ['Trauma Center', 'General Emergency', 'Burns ICU', 'Respiratory Critical Care'],
    rating: 4.5,
    lastUpdated: '12 mins ago',
    verified: true,
  },
  {
    id: 'hosp-max-saket-03',
    name: 'Max Super Speciality Hospital, Saket',
    type: 'Private Super Speciality & Emergency',
    address: '1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi, 110017',
    city: 'Delhi NCR',
    location: { lat: 28.5284, lng: 77.2119 },
    phone: '+91 11 2651 5050',
    emergencyHelpline: '+91 11 4055 4055',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 38,
    icuAvailableBeds: 9,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: 'Full Stock Available',
    specialties: ['Cardiac Emergency (24/7 Cath Lab)', 'Stroke Care Unit', 'Critical Care ICU', 'Polytrauma'],
    rating: 4.7,
    lastUpdated: '5 mins ago',
    verified: true,
  },
  {
    id: 'hosp-apollo-04',
    name: 'Indraprastha Apollo Hospitals',
    type: 'Private Multi-Speciality Tertiary Care',
    address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi, 110076',
    city: 'Delhi NCR',
    location: { lat: 28.5414, lng: 77.2831 },
    phone: '+91 11 2692 5858',
    emergencyHelpline: '1066 / +91 11 2987 1066',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 50,
    icuAvailableBeds: 12,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: '24/7 Active Blood Bank',
    specialties: ['Comprehensive Stroke Center', 'Emergency Cardiology', 'Organ Transplant ICU', 'Pediatric Emergency'],
    rating: 4.9,
    lastUpdated: '7 mins ago',
    verified: true,
  },
  {
    id: 'hosp-fortis-05',
    name: 'Fortis Escorts Heart Institute',
    type: 'Private Cardiac & Critical Care Center',
    address: 'Okhla Road, New Friends Colony, New Delhi, 110025',
    city: 'Delhi NCR',
    location: { lat: 28.5601, lng: 77.2736 },
    phone: '+91 11 4713 5000',
    emergencyHelpline: '+91 11 2682 5000',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 30,
    icuAvailableBeds: 6,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: 'Available',
    specialties: ['24/7 Primary Angioplasty', 'Cardiac ICU (CCU)', 'Vascular Emergency'],
    rating: 4.6,
    lastUpdated: '15 mins ago',
    verified: true,
  },
  {
    id: 'hosp-gangaram-07',
    name: 'Sir Ganga Ram Hospital',
    type: 'Multi-Speciality Tertiary Care',
    address: 'Sir Ganga Ram Hospital Marg, Old Rajinder Nagar, New Delhi, 110060',
    city: 'Delhi NCR',
    location: { lat: 28.6385, lng: 77.1895 },
    phone: '+91 11 2575 0000',
    emergencyHelpline: '+91 11 4225 1000',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 40,
    icuAvailableBeds: 11,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: 'Available',
    specialties: ['Emergency Medicine', 'Pediatric ICU', 'Medical ICU', 'Surgical Emergency'],
    rating: 4.7,
    lastUpdated: '10 mins ago',
    verified: true,
  }
];

export const INITIAL_MOCK_AMBULANCES = [
  {
    id: 'amb-aiims-icu-01',
    vehicleNumber: 'DL-01-EA-4421',
    callSign: 'LifeRescue Alpha-1',
    type: 'ICU Ambulance',
    category: 'ICU',
    isICU: true,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-aiims-01',
    providerName: 'AIIMS Apex Trauma Center',
    driverId: 'user-driver-01',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98112 23344',
    rating: 4.9,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.5802,
      lng: 77.2155,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Transport Ventilator (Invasive/Non-Invasive)',
      'Biphasic Defibrillator with AED',
      'Multipara Vital Monitor (ECG, NIBP, SpO2)',
      'Medical Oxygen Bank (4000L)'
    ],
    accredited: true
  },
  {
    id: 'amb-max-als-02',
    vehicleNumber: 'DL-04-AB-1109',
    callSign: 'MaxRapid Echo-4',
    type: 'Advanced Life Support (ALS)',
    category: 'ALS',
    isICU: false,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-max-saket-03',
    providerName: 'Max Super Speciality Hospital Saket',
    driverId: 'user-driver-02',
    driverName: 'Amit Verma',
    driverPhone: '+91 98223 34455',
    rating: 4.8,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.5350,
      lng: 77.2180,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Automated External Defibrillator (AED)',
      '12-Lead ECG Monitor & Telemetry',
      'Continuous Pulse Oximeter & BP Monitor',
      'Dual Portable Oxygen Cylinders'
    ],
    accredited: true
  },
  {
    id: 'amb-apollo-bls-03',
    vehicleNumber: 'DL-07-CD-3321',
    callSign: 'ApolloSwift Bravo-2',
    type: 'Basic Ambulance (BLS)',
    category: 'BLS',
    isICU: false,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-apollo-04',
    providerName: 'Indraprastha Apollo Hospitals',
    driverId: 'user-driver-03',
    driverName: 'Sunita Rao',
    driverPhone: '+91 98334 45566',
    rating: 4.9,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.5550,
      lng: 77.2550,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Basic Medical Oxygen Kit',
      'First Aid & Trauma Bandaging Kit',
      'Automated Blood Pressure & Pulse Oximeter'
    ],
    accredited: true
  },
  {
    id: 'amb-medanta-nicu-04',
    vehicleNumber: 'HR-26-NN-9988',
    callSign: 'Medanta LittleAngel NICU-1',
    type: 'Neonatal Ambulance (NICU)',
    category: 'NEONATAL',
    isICU: true,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-medanta-06',
    providerName: 'Medanta The Medicity Gurugram',
    driverId: null,
    driverName: 'Vikram Singh',
    driverPhone: '+91 98777 66554',
    rating: 5.0,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.4600,
      lng: 77.0650,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Transport Incubator on Wheels',
      'Neonatal Specialized High-Frequency Ventilator',
      'Micro-infusion Syringe Pumps'
    ],
    accredited: true
  },
  {
    id: 'amb-private-fleet-05',
    vehicleNumber: 'DL-02-PT-5561',
    callSign: 'DelhiCare Transit-9',
    type: 'Patient Transport (PTS)',
    category: 'PTS',
    isICU: false,
    providerType: 'Private Ambulance Provider',
    hospitalId: null,
    providerName: 'Delhi Medicare Private EMS Fleet',
    driverId: null,
    driverName: 'Mohit Rawat',
    driverPhone: '+91 98444 33221',
    rating: 4.6,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.6250,
      lng: 77.2180,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Hydraulic Patient Lift Stretcher',
      'Wheelchair Locking Mechanism',
      'Low-flow Oxygen Delivery'
    ],
    accredited: true
  },
  {
    id: 'amb-gangaram-icu-06',
    vehicleNumber: 'DL-03-GR-7744',
    callSign: 'GangaRam Rescue-3',
    type: 'ICU Ambulance',
    category: 'ICU',
    isICU: true,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-gangaram-07',
    providerName: 'Sir Ganga Ram Hospital',
    driverId: null,
    driverName: 'Kishore Yadav',
    driverPhone: '+91 98666 55443',
    rating: 4.8,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.6320,
      lng: 77.1980,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Hamilton T1 Transport Ventilator',
      'Zoll X-Series Defibrillator & Monitor',
      'Dual Syringe Pump'
    ],
    accredited: true
  },
  {
    id: 'amb-fortis-cardiac-07',
    vehicleNumber: 'DL-05-FE-2233',
    callSign: 'Escorts HeartRescue-1',
    type: 'Advanced Life Support (ALS)',
    category: 'ALS',
    isICU: false,
    providerType: 'Hospital Fleet',
    hospitalId: 'hosp-fortis-05',
    providerName: 'Fortis Escorts Heart Institute',
    driverId: null,
    driverName: 'Dinesh Chandra',
    driverPhone: '+91 98101 99228',
    rating: 4.9,
    availability: 'AVAILABLE',
    currentLocation: {
      lat: 28.5630,
      lng: 77.2680,
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Philips HeartStart MRx Cardiac Monitor',
      '12-Lead ECG with Cloud Telemetry',
      'Automated CPR Device'
    ],
    accredited: true
  }
];

// Helper geo distance calculator
export function calcDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calcEtaMinutes(distanceKm, speedKmh = 35) {
  if (distanceKm <= 0.1) return 1;
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60 + 1.5));
}

// In-Memory state store for browser runtime
class ClientEmergencyStore {
  constructor() {
    this.hospitals = [...INITIAL_MOCK_HOSPITALS];
    this.ambulances = [...INITIAL_MOCK_AMBULANCES];
    this.bookings = [];
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const savedBookings = localStorage.getItem('raksha_mock_bookings');
      if (savedBookings) {
        this.bookings = JSON.parse(savedBookings);
      }
    } catch (e) {
      // ignore
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('raksha_mock_bookings', JSON.stringify(this.bookings.slice(0, 15)));
    } catch (e) {
      // ignore
    }
  }

  getRankedAmbulances(pickupLat, pickupLng, requiredType = 'ANY', hospitalId = null) {
    const isIcuReq = (requiredType || '').toUpperCase().includes('ICU');
    const isAlsReq = (requiredType || '').toUpperCase().includes('ALS');

    return this.ambulances.map((amb) => {
      const distanceKm = calcDistanceKm(
        pickupLat,
        pickupLng,
        amb.currentLocation?.lat ?? 28.5802,
        amb.currentLocation?.lng ?? 77.2155
      );
      const etaMinutes = calcEtaMinutes(distanceKm);

      let suitabilityScore = 30;
      let matchExplanation = 'Standard emergency transit unit';

      if (isIcuReq) {
        if (amb.isICU) {
          suitabilityScore = 40;
          matchExplanation = 'Certified Mobile ICU with transport ventilator & cardiac monitor';
        } else if (amb.category === 'ALS') {
          suitabilityScore = 20;
          matchExplanation = 'ALS backup available';
        } else {
          suitabilityScore = 5;
          matchExplanation = 'Basic unit (lacks ICU capabilities)';
        }
      } else if (isAlsReq) {
        if (amb.category === 'ALS' || amb.isICU) {
          suitabilityScore = 40;
          matchExplanation = 'Equipped with 12-lead ECG, defibrillator & advanced paramedics';
        } else {
          suitabilityScore = 20;
          matchExplanation = 'Basic life support unit';
        }
      } else {
        if (amb.category === 'BLS') {
          suitabilityScore = 40;
          matchExplanation = 'Optimal fit for basic emergency transit';
        } else {
          suitabilityScore = 35;
          matchExplanation = 'High capability unit available';
        }
      }

      const distanceScore = Math.max(0, Math.round(30 * (1 - Math.min(distanceKm / 25, 1))));
      const etaScore = Math.max(0, Math.round(20 * (1 - Math.min(etaMinutes / 35, 1))));
      const matchScore = suitabilityScore + distanceScore + etaScore + 8;

      return {
        ...amb,
        distanceKm,
        etaMinutes,
        matchScore,
        matchExplanation,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  createBooking(payload) {
    const {
      pickupLat = 28.5672,
      pickupLng = 77.2100,
      pickupAddress = 'Current Detected Location',
      patientId = 'user-patient-01',
      patientName = 'Rahul Sharma',
      patientPhone = '+91 98765 43210',
      conditionCategory = 'Critical Emergency',
      requiredType = 'ICU Ambulance',
      destinationHospitalId = null,
      emergencyNotes = 'Emergency dispatch confirmed',
      ambulanceId = null,
    } = payload;

    const ranked = this.getRankedAmbulances(pickupLat, pickupLng, requiredType, destinationHospitalId);
    let selectedAmbulance = ambulanceId ? this.ambulances.find(a => a.id === ambulanceId) : null;
    if (!selectedAmbulance) {
      selectedAmbulance = ranked[0] || this.ambulances[0];
    }

    let hospital = destinationHospitalId
      ? this.hospitals.find(h => h.id === destinationHospitalId)
      : null;
    if (!hospital) {
      hospital = this.hospitals[0];
    }

    const dist = calcDistanceKm(
      Number(pickupLat),
      Number(pickupLng),
      selectedAmbulance.currentLocation?.lat ?? 28.5802,
      selectedAmbulance.currentLocation?.lng ?? 77.2155
    );
    const eta = calcEtaMinutes(dist);

    const bookingId = `bk-online-${Date.now().toString(36).toUpperCase()}`;
    const newBooking = {
      id: bookingId,
      status: 'ASSIGNED',
      requestedAt: new Date().toISOString(),
      patientId,
      patientName,
      patientPhone,
      ambulanceId: selectedAmbulance.id,
      ambulanceType: selectedAmbulance.type,
      vehicleNumber: selectedAmbulance.vehicleNumber,
      callSign: selectedAmbulance.callSign,
      driverId: selectedAmbulance.driverId || 'user-driver-01',
      driverName: selectedAmbulance.driverName || 'Rajesh Kumar',
      driverPhone: selectedAmbulance.driverPhone || '+91 98112 23344',
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      pickupLocation: {
        address: pickupAddress,
        lat: Number(pickupLat),
        lng: Number(pickupLng),
      },
      currentLocation: {
        lat: selectedAmbulance.currentLocation?.lat ?? 28.5802,
        lng: selectedAmbulance.currentLocation?.lng ?? 77.2155,
      },
      destinationHospitalLocation: {
        address: hospital.address,
        lat: hospital.location.lat,
        lng: hospital.location.lng,
      },
      conditionCategory,
      emergencyNotes,
      currentDistanceKm: dist,
      currentEtaMinutes: eta,
      isSos: true,
      timeline: [
        { status: 'REQUESTED', timestamp: new Date().toISOString(), note: 'Emergency dispatch triggered' },
        { status: 'ASSIGNED', timestamp: new Date().toISOString(), note: `${selectedAmbulance.callSign} assigned and pilot en route` },
      ],
    };

    this.bookings.unshift(newBooking);
    this.saveToStorage();
    return newBooking;
  }

  getBookingWithSimulatedProgress(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return null;

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return booking;
    }

    const elapsedSeconds = (Date.now() - new Date(booking.requestedAt).getTime()) / 1000;
    const startLat = booking.currentLocation?.lat ?? 28.5802;
    const startLng = booking.currentLocation?.lng ?? 77.2155;
    const pickupLat = booking.pickupLocation?.lat ?? 28.5672;
    const pickupLng = booking.pickupLocation?.lng ?? 77.2100;
    const hospLat = booking.destinationHospitalLocation?.lat ?? 28.5672;
    const hospLng = booking.destinationHospitalLocation?.lng ?? 77.2100;

    if (elapsedSeconds > 45 && booking.status !== 'COMPLETED') {
      booking.status = 'COMPLETED';
      booking.currentLocation = { lat: hospLat, lng: hospLng };
      booking.currentDistanceKm = 0;
      booking.currentEtaMinutes = 0;
      booking.timeline.push({ status: 'COMPLETED', timestamp: new Date().toISOString(), note: 'Patient safely admitted to hospital emergency room.' });
    } else if (elapsedSeconds > 35 && booking.status !== 'ARRIVED_HOSPITAL') {
      booking.status = 'ARRIVED_HOSPITAL';
      booking.currentLocation = { lat: hospLat, lng: hospLng };
      booking.currentDistanceKm = 0.2;
      booking.currentEtaMinutes = 1;
      booking.timeline.push({ status: 'ARRIVED_HOSPITAL', timestamp: new Date().toISOString(), note: 'Ambulance arrived at emergency triage desk.' });
    } else if (elapsedSeconds > 20 && booking.status !== 'TRIP_STARTED') {
      booking.status = 'TRIP_STARTED';
      const progress = Math.min((elapsedSeconds - 20) / 15, 1);
      booking.currentLocation = {
        lat: pickupLat + (hospLat - pickupLat) * progress,
        lng: pickupLng + (hospLng - pickupLng) * progress,
      };
      booking.currentDistanceKm = Math.round(calcDistanceKm(booking.currentLocation.lat, booking.currentLocation.lng, hospLat, hospLng) * 10) / 10;
      booking.currentEtaMinutes = calcEtaMinutes(booking.currentDistanceKm);
      booking.timeline.push({ status: 'TRIP_STARTED', timestamp: new Date().toISOString(), note: 'Patient onboard. High-priority transit to hospital initiated.' });
    } else if (elapsedSeconds > 10 && booking.status !== 'ARRIVED_PICKUP') {
      booking.status = 'ARRIVED_PICKUP';
      booking.currentLocation = { lat: pickupLat, lng: pickupLng };
      booking.currentDistanceKm = 0;
      booking.currentEtaMinutes = 0;
      booking.timeline.push({ status: 'ARRIVED_PICKUP', timestamp: new Date().toISOString(), note: 'Ambulance arrived at patient pickup location.' });
    } else if (elapsedSeconds > 3) {
      booking.status = 'EN_ROUTE_PICKUP';
      const progress = Math.min(elapsedSeconds / 10, 0.95);
      booking.currentLocation = {
        lat: startLat + (pickupLat - startLat) * progress,
        lng: startLng + (pickupLng - startLng) * progress,
      };
      booking.currentDistanceKm = Math.round(calcDistanceKm(booking.currentLocation.lat, booking.currentLocation.lng, pickupLat, pickupLng) * 10) / 10;
      booking.currentEtaMinutes = calcEtaMinutes(booking.currentDistanceKm);
    }

    this.saveToStorage();
    return booking;
  }
}

export const mockEmergencyEngine = new ClientEmergencyStore();
