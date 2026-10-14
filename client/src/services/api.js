import { mockEmergencyEngine } from './mockEmergencyEngine.js';

const API_BASE =
  import.meta.env?.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:5050/api`
    : '/api');

function getAuthHeader() {
  const token = localStorage.getItem('raksha_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data) return data;
    }
  } catch (err) {
    // Network or proxy error - proceed to mock fallback
  }
  return null;
}

export const api = {
  // --- Auth ---
  demoLogin: async (role = 'patient') => {
    const remote = await safeFetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (remote && remote.success) return remote;

    const demoUsers = {
      patient: { id: 'user-patient-01', name: 'Rahul Sharma', email: 'rahul@raksharoute.in', role: 'patient', phone: '+91 98765 43210' },
      driver: { id: 'user-driver-01', name: 'Rajesh Kumar', email: 'rajesh.driver@raksharoute.in', role: 'driver', phone: '+91 98112 23344', ambulanceId: 'amb-aiims-icu-01' },
      hospital: { id: 'user-hosp-01', name: 'Dr. Priya Nair', email: 'priya@aiims.edu', role: 'hospital', phone: '+91 98991 12233' },
      admin: { id: 'user-admin-01', name: 'Vikramaditya Verma', email: 'admin@raksharoute.in', role: 'admin', phone: '+91 99999 88888' },
    };
    const user = demoUsers[role] || demoUsers.patient;
    return {
      success: true,
      token: 'demo-token-raksharoute',
      user,
      message: `Signed in as ${user.name}`,
    };
  },

  login: async (email, role) => {
    const remote = await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (remote && remote.success) return remote;

    return api.demoLogin(role || 'patient');
  },

  register: async (userData) => {
    const remote = await safeFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (remote && remote.success) return remote;

    return {
      success: true,
      token: 'demo-token-raksharoute',
      user: {
        id: `user-${Date.now().toString(36)}`,
        name: userData.name || 'Emergency User',
        email: userData.email,
        role: userData.role || 'patient',
        phone: userData.phone || '+91 98765 43210',
      },
    };
  },

  getMe: async () => {
    const remote = await safeFetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (remote && remote.success) return remote;

    return api.demoLogin('patient');
  },

  // --- Ambulances ---
  getAmbulances: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const remote = await safeFetch(`${API_BASE}/ambulances?${query}`);
    if (remote && remote.success) return remote;

    return {
      success: true,
      count: mockEmergencyEngine.ambulances.length,
      data: mockEmergencyEngine.ambulances,
    };
  },

  getNearbyAmbulances: async ({ lat, lng, radius, type, hospitalId }) => {
    const query = new URLSearchParams({
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      radius: radius || 15,
      type: type || 'ANY',
      hospitalId: hospitalId || '',
    }).toString();
    const remote = await safeFetch(`${API_BASE}/ambulances/nearby?${query}`);
    if (remote && remote.success && remote.data?.length > 0) return remote;

    const ranked = mockEmergencyEngine.getRankedAmbulances(
      lat || 28.5672,
      lng || 77.2100,
      type,
      hospitalId
    );
    return {
      success: true,
      count: ranked.length,
      radiusKm: radius || 15,
      data: ranked,
    };
  },

  searchDynamicRadius: async ({ lat, lng, requiredType, destinationHospitalId }) => {
    const remote = await safeFetch(`${API_BASE}/ambulances/search-radius`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, requiredType, destinationHospitalId }),
    });
    if (remote && remote.success) return remote;

    const ranked = mockEmergencyEngine.getRankedAmbulances(
      lat || 28.5672,
      lng || 77.2100,
      requiredType,
      destinationHospitalId
    );
    return {
      success: true,
      ambulances: ranked,
      searchRadiusKm: 15,
      totalFound: ranked.length,
      bestMatch: ranked[0] || null,
      tiersAttempted: [
        { radiusKm: 5, message: 'Scanning 5 km radius...', success: true },
        { radiusKm: 10, message: `Matched ${ranked.length} medically capable ambulances.`, success: true },
      ],
    };
  },

  updateAmbulanceLocation: async (id, lat, lng) => {
    const remote = await safeFetch(`${API_BASE}/ambulances/${id}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ lat, lng }),
    });
    if (remote && remote.success) return remote;

    return { success: true };
  },

  updateAmbulanceAvailability: async (id, availability) => {
    const remote = await safeFetch(`${API_BASE}/ambulances/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ availability }),
    });
    if (remote && remote.success) return remote;

    return { success: true };
  },

  addAmbulance: async (data) => {
    const remote = await safeFetch(`${API_BASE}/ambulances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (remote && remote.success) return remote;

    const newAmb = { id: `amb-${Date.now()}`, ...data, availability: 'AVAILABLE' };
    mockEmergencyEngine.ambulances.push(newAmb);
    return { success: true, data: newAmb };
  },

  // --- Hospitals ---
  getHospitals: async (lat = null, lng = null) => {
    const query = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
    const remote = await safeFetch(`${API_BASE}/hospitals${query}`);
    if (remote && remote.success) return remote;

    return {
      success: true,
      count: mockEmergencyEngine.hospitals.length,
      data: mockEmergencyEngine.hospitals,
    };
  },

  getHospital: async (id) => {
    const remote = await safeFetch(`${API_BASE}/hospitals/${id}`);
    if (remote && remote.success) return remote;

    const hosp = mockEmergencyEngine.hospitals.find(h => h.id === id) || mockEmergencyEngine.hospitals[0];
    return { success: true, data: hosp };
  },

  updateHospitalCapacity: async (id, capacityData) => {
    const remote = await safeFetch(`${API_BASE}/hospitals/${id}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(capacityData),
    });
    if (remote && remote.success) return remote;

    return { success: true };
  },

  // --- Bookings & SOS ---
  triggerSos: async (sosPayload) => {
    const remote = await safeFetch(`${API_BASE}/bookings/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(sosPayload),
    });
    if (remote && remote.success && remote.data) return remote;

    // Guaranteed client fallback: immediate assignment & navigation
    const booking = mockEmergencyEngine.createBooking(sosPayload);
    return {
      success: true,
      data: booking,
      searchRadiusKm: 15,
      tiersAttempted: [
        { radiusKm: 5, message: 'Scanning 5 km radius...', success: true },
        { radiusKm: 15, message: `Dispatched ${booking.callSign} (${booking.ambulanceType})`, success: true },
      ],
      matchingExplanation: `Immediate assignment of ${booking.callSign} for emergency response.`,
      matchScore: 98,
    };
  },

  triggerMassEmergency: async (massPayload) => {
    const remote = await safeFetch(`${API_BASE}/bookings/mass-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(massPayload),
    });
    if (remote && remote.success) return remote;

    const b1 = mockEmergencyEngine.createBooking({ ...massPayload, requiredType: 'ICU Ambulance' });
    const b2 = mockEmergencyEngine.createBooking({ ...massPayload, requiredType: 'Basic Ambulance (BLS)' });
    return {
      success: true,
      confirmedCount: 2,
      searchingCount: 1,
      totalRequested: massPayload.totalRequested || 3,
      bookings: [b1, b2],
    };
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const remote = await safeFetch(`${API_BASE}/bookings?${query}`);
    if (remote && remote.success) return remote;

    return {
      success: true,
      count: mockEmergencyEngine.bookings.length,
      data: mockEmergencyEngine.bookings,
    };
  },

  getBooking: async (id) => {
    const remote = await safeFetch(`${API_BASE}/bookings/${id}`);
    if (remote && remote.success) return remote;

    const b = mockEmergencyEngine.getBookingWithSimulatedProgress(id);
    if (b) return { success: true, data: b };
    return { success: false, message: 'Booking not found' };
  },

  updateBookingStatus: async (id, status, note = '') => {
    const remote = await safeFetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, note }),
    });
    if (remote && remote.success) return remote;

    const booking = mockEmergencyEngine.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      booking.timeline = booking.timeline || [];
      booking.timeline.push({ status, timestamp: new Date().toISOString(), note });
      mockEmergencyEngine.saveToStorage();
      return { success: true, data: booking };
    }
    return { success: true };
  },

  cancelBooking: async (id, reason) => {
    const remote = await safeFetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    if (remote && remote.success) return remote;

    const booking = mockEmergencyEngine.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'CANCELLED';
      booking.timeline = booking.timeline || [];
      booking.timeline.push({ status: 'CANCELLED', timestamp: new Date().toISOString(), note: `Cancelled: ${reason}` });
      mockEmergencyEngine.saveToStorage();
      return { success: true, data: booking };
    }
    return { success: true };
  },

  submitReview: async (id, rating, reviewText) => {
    const remote = await safeFetch(`${API_BASE}/bookings/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rating, reviewText }),
    });
    if (remote && remote.success) return remote;

    return { success: true, message: 'Review recorded' };
  },

  // --- Follow Ups ---
  getFollowUps: async (bookingId = '') => {
    const query = bookingId ? `?bookingId=${bookingId}` : '';
    const remote = await safeFetch(`${API_BASE}/followups${query}`);
    if (remote && remote.success) return remote;

    return {
      success: true,
      data: [
        {
          id: 'flw-001',
          bookingId,
          patientName: 'Rahul Sharma',
          status: 'SCHEDULED',
          question: 'How is the patient recovering following the hospital admission?',
          options: ['Patient is stable & recovering', 'Patient needs further assistance', 'Emergency assistance required now'],
        },
      ],
    };
  },

  respondFollowUp: async (id, response, notes = '') => {
    const remote = await safeFetch(`${API_BASE}/followups/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ response, notes }),
    });
    if (remote && remote.success) return remote;

    return { success: true, message: 'Response recorded' };
  },

  // --- Analytics & Demo Reset ---
  getAnalytics: async () => {
    const remote = await safeFetch(`${API_BASE}/analytics`);
    if (remote && remote.success) return remote;

    return {
      success: true,
      data: {
        totalTrips: mockEmergencyEngine.bookings.length + 142,
        activeAmbulances: mockEmergencyEngine.ambulances.length,
        avgResponseTimeMinutes: 4.8,
        patientSatisfactionRating: 4.9,
      },
    };
  },

  getNotifications: async () => {
    return { success: true, count: 0, data: [] };
  },

  resetDemo: async () => {
    const remote = await safeFetch(`${API_BASE}/analytics/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (remote && remote.success) return remote;

    localStorage.removeItem('raksha_mock_bookings');
    mockEmergencyEngine.bookings = [];
    return { success: true, message: 'Demo reset' };
  },
};
