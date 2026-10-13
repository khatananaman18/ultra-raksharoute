/**
 * Realistic seed data for RakshaRoute Platform
 * Covers Delhi NCR healthcare network with hospital capacities,
 * diverse ambulance fleets (ICU, ALS, BLS, Neonatal, PTS), and verified drivers.
 */

export const INITIAL_HOSPITALS = [
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
    lastUpdated: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
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
    lastUpdated: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
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
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
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
    lastUpdated: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
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
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: 'hosp-medanta-06',
    name: 'Medanta — The Medicity',
    type: 'Multi-Super Speciality Hospital & Trauma',
    address: 'CH Bakhtawar Singh Rd, Sector 38, Gurugram, Haryana 122001',
    city: 'Delhi NCR',
    location: { lat: 28.4394, lng: 77.0427 },
    phone: '+91 124 414 1414',
    emergencyHelpline: '+91 124 483 4567',
    emergencyDepartmentStatus: 'Open 24/7',
    icuTotalBeds: 80,
    icuAvailableBeds: 22,
    oxygenSupplyStatus: 'Normal',
    bloodBankStatus: 'Comprehensive Blood Bank Active',
    specialties: ['Level 1 Polytrauma', 'Extracorporeal Membrane Oxygenation (ECMO)', 'Neuro Critical Care', 'Air Ambulance Hub'],
    rating: 4.8,
    lastUpdated: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
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
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    verified: true,
  }
];

export const INITIAL_USERS = [
  {
    id: 'user-patient-01',
    name: 'Rahul Sharma',
    email: 'rahul@raksharoute.in',
    phone: '+91 98765 43210',
    role: 'patient',
    passwordHash: '$2a$10$wE99V9kU.1qQ1h3L7vLh4u9t.M9yY6n3V0BvL4xO1bM.y7m5eR8ye', // demo: password123
    emergencyContacts: [
      { name: 'Sunita Sharma (Mother)', phone: '+91 98765 43211', relationship: 'Mother' },
      { name: 'Ankit Sharma (Brother)', phone: '+91 98765 43212', relationship: 'Brother' }
    ],
    medicalPreferences: {
      bloodGroup: 'B+',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      preferredHospitalId: 'hosp-aiims-01'
    },
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'user-driver-01',
    name: 'Rajesh Kumar',
    email: 'rajesh.driver@raksharoute.in',
    phone: '+91 98112 23344',
    role: 'driver',
    licenseNumber: 'DL-0420180099412',
    yearsOfExperience: 8,
    rating: 4.9,
    tripsCompleted: 412,
    ambulanceId: 'amb-aiims-icu-01',
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'user-driver-02',
    name: 'Amit Verma',
    email: 'amit.driver@raksharoute.in',
    phone: '+91 98223 34455',
    role: 'driver',
    licenseNumber: 'DL-0820200088192',
    yearsOfExperience: 5,
    rating: 4.8,
    tripsCompleted: 289,
    ambulanceId: 'amb-max-als-02',
    createdAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'user-driver-03',
    name: 'Sunita Rao',
    email: 'sunita.driver@raksharoute.in',
    phone: '+91 98334 45566',
    role: 'driver',
    licenseNumber: 'DL-1120190012874',
    yearsOfExperience: 6,
    rating: 4.9,
    tripsCompleted: 340,
    ambulanceId: 'amb-apollo-bls-03',
    createdAt: new Date('2026-02-10').toISOString()
  },
  {
    id: 'user-hosp-01',
    name: 'Dr. Priya Nair',
    email: 'priya@aiims.edu',
    phone: '+91 98991 12233',
    role: 'hospital',
    organizationName: 'AIIMS New Delhi Emergency Services',
    hospitalId: 'hosp-aiims-01',
    designation: 'Head of Trauma Dispatch & Emergency Medicine',
    createdAt: new Date('2026-01-05').toISOString()
  },
  {
    id: 'user-admin-01',
    name: 'Vikramaditya Verma',
    email: 'admin@raksharoute.in',
    phone: '+91 99999 88888',
    role: 'admin',
    organizationName: 'RakshaRoute Central Command',
    designation: 'National Operations Lead',
    createdAt: new Date('2026-01-01').toISOString()
  }
];

export const INITIAL_AMBULANCES = [
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
    availability: 'AVAILABLE', // AVAILABLE, BUSY, OFFLINE
    currentLocation: {
      lat: 28.5802,
      lng: 77.2155, // Near South Extension / Defence Colony (~2.2 km from AIIMS)
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Transport Ventilator (Invasive/Non-Invasive)',
      'Biphasic Defibrillator with AED',
      'Multipara Vital Monitor (ECG, NIBP, SpO2, EtCO2)',
      'Syringe Infusion Pumps (x3)',
      'Medical Oxygen Bank (4000L)',
      'Suction Apparatus',
      'Spine Board & Scoop Stretcher',
      'Emergency Resuscitation Drug Kit'
    ],
    crew: ['1 Critical Care Paramedic', '1 Emergency Medical Tech (EMT)', '1 Certified Pilot/Driver'],
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
      lng: 77.2180, // Near Hauz Khas / Saket border
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Automated External Defibrillator (AED)',
      '12-Lead ECG Monitor & Telemetry',
      'Continuous Pulse Oximeter & BP Monitor',
      'Dual Portable Oxygen Cylinders',
      'Bag Valve Mask & Intubation Airway Set',
      'Collapsible Ambulance Cot',
      'Cervical Collars & Immobilization Splints'
    ],
    crew: ['1 Advanced Life Support Paramedic', '1 Emergency Driver'],
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
      lng: 77.2550, // Near Kalkaji / Nehru Place
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Basic Medical Oxygen Kit (Flowmeter & Masks)',
      'First Aid & Trauma Bandaging Kit',
      'Automated Blood Pressure & Pulse Oximeter',
      'Foldable Patient Stretcher',
      'Wheelchair Mount',
      'Antiseptic & Burn Dressing Pack'
    ],
    crew: ['1 Basic EMT Responder', '1 Driver'],
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
      lng: 77.0650, // Near DLF Cyber City / NH-48 Gurugram
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Incubator on Wheels (Temperature & Humidity Control)',
      'Neonatal Specialized High-Frequency Ventilator',
      'Micro-infusion Syringe Pumps',
      'Phototherapy Light Unit',
      'Neonatal Resuscitation Kit & Suction',
      'Continuous Baby Heart Rate & SpO2 Monitor'
    ],
    crew: ['1 Neonatal Specialist Nurse / Pediatric Fellow', '1 EMT Pilot'],
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
      lng: 77.2180, // Near Connaught Place / Barakhamba
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Hydraulic Patient Lift Stretcher',
      'Wheelchair Locking Mechanism',
      'Low-flow Oxygen Delivery',
      'Vital Signs Monitor',
      'Comfort AC Cabin & Sanitization Station'
    ],
    crew: ['1 Patient Attendant', '1 Driver'],
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
      lng: 77.1980, // Near Pusa Road / Karol Bagh
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Hamilton T1 Transport Ventilator',
      'Zoll X-Series Defibrillator & Monitor',
      'Dual Syringe Pump',
      'Central Medical Gas Pipeline System',
      'Suction Pump',
      'Spine Board & Vacuum Mattress'
    ],
    crew: ['1 Critical Care Nurse', '1 Paramedic', '1 Driver'],
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
      lng: 77.2680, // Near New Friends Colony / Ashram Flyover
      lastUpdated: new Date().toISOString()
    },
    equipment: [
      'Philips HeartStart MRx Cardiac Monitor',
      '12-Lead ECG with Cloud Tele-Transmission to CCU',
      'Automated CPR Device',
      'Emergency Thrombolytic Drug Bank',
      'Dual High Flow Oxygen Tanks'
    ],
    crew: ['1 Cardiac Care Specialist EMT', '1 Driver'],
    accredited: true
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'bk-2026-901',
    patientId: 'user-patient-01',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    ambulanceId: 'amb-aiims-icu-01',
    driverId: 'user-driver-01',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98112 23344',
    ambulanceType: 'ICU Ambulance',
    vehicleNumber: 'DL-01-EA-4421',
    hospitalId: 'hosp-aiims-01',
    hospitalName: 'AIIMS New Delhi (Apex Trauma Center)',
    pickupLocation: {
      address: 'Near M-Block Market, Greater Kailash 1, New Delhi',
      lat: 28.5525,
      lng: 77.2345
    },
    destinationHospitalLocation: {
      lat: 28.5672,
      lng: 77.2100
    },
    status: 'COMPLETED', // REQUESTED, ASSIGNED, EN_ROUTE_PICKUP, ARRIVED_PICKUP, TRIP_STARTED, ARRIVED_HOSPITAL, COMPLETED, CANCELLED
    conditionCategory: 'Critical / Cardiac',
    emergencyNotes: 'Severe chest discomfort and shortness of breath',
    requestedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    completedAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    reviewText: 'Arrived in under 7 minutes! The paramedic started oxygen and continuous monitoring immediately. Saved valuable time.',
    followUp: {
      scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      conditionCategory: 'Critical / Cardiac',
      status: 'SCHEDULED', // SCHEDULED, SENT, RESPONDED
      patientResponse: null
    }
  }
];

export const INITIAL_FOLLOWUPS = [
  {
    id: 'flw-001',
    bookingId: 'bk-2026-901',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    ambulanceType: 'ICU Ambulance',
    hospitalName: 'AIIMS New Delhi',
    conditionCategory: 'Critical / Cardiac',
    scheduledTimingHours: 48,
    scheduledAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 13 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    question: 'How is the patient doing following the emergency admission?',
    options: ['Patient is stable & recovering', 'Patient needs further assistance', 'Emergency assistance required now']
  }
];
