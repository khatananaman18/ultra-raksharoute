const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('raksha_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // --- Auth ---
  demoLogin: async (role = 'patient') => {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  login: async (email, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // --- Ambulances ---
  getAmbulances: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ambulances?${query}`);
    return handleResponse(res);
  },

  getNearbyAmbulances: async ({ lat, lng, radius, type, hospitalId }) => {
    const query = new URLSearchParams({
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      radius: radius || 15,
      type: type || 'ANY',
      hospitalId: hospitalId || '',
    }).toString();
    const res = await fetch(`${API_BASE}/ambulances/nearby?${query}`);
    return handleResponse(res);
  },

  searchDynamicRadius: async ({ lat, lng, requiredType, destinationHospitalId }) => {
    const res = await fetch(`${API_BASE}/ambulances/search-radius`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, requiredType, destinationHospitalId }),
    });
    return handleResponse(res);
  },

  updateAmbulanceLocation: async (id, lat, lng) => {
    const res = await fetch(`${API_BASE}/ambulances/${id}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ lat, lng }),
    });
    return handleResponse(res);
  },

  updateAmbulanceAvailability: async (id, availability) => {
    const res = await fetch(`${API_BASE}/ambulances/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ availability }),
    });
    return handleResponse(res);
  },

  addAmbulance: async (data) => {
    const res = await fetch(`${API_BASE}/ambulances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // --- Hospitals ---
  getHospitals: async (lat = null, lng = null) => {
    const query = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
    const res = await fetch(`${API_BASE}/hospitals${query}`);
    return handleResponse(res);
  },

  getHospital: async (id) => {
    const res = await fetch(`${API_BASE}/hospitals/${id}`);
    return handleResponse(res);
  },

  updateHospitalCapacity: async (id, capacityData) => {
    const res = await fetch(`${API_BASE}/hospitals/${id}/capacity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(capacityData),
    });
    return handleResponse(res);
  },

  // --- Bookings & SOS ---
  triggerSos: async (sosPayload) => {
    const res = await fetch(`${API_BASE}/bookings/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(sosPayload),
    });
    return handleResponse(res);
  },

  triggerMassEmergency: async (massPayload) => {
    const res = await fetch(`${API_BASE}/bookings/mass-emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(massPayload),
    });
    return handleResponse(res);
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}`);
    return handleResponse(res);
  },

  getBooking: async (id) => {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    return handleResponse(res);
  },

  updateBookingStatus: async (id, status, note = '') => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, note }),
    });
    return handleResponse(res);
  },

  cancelBooking: async (id, reason) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  submitReview: async (id, rating, reviewText) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ rating, reviewText }),
    });
    return handleResponse(res);
  },

  // --- Follow Ups ---
  getFollowUps: async (bookingId = '') => {
    const query = bookingId ? `?bookingId=${bookingId}` : '';
    const res = await fetch(`${API_BASE}/followups${query}`);
    return handleResponse(res);
  },

  respondFollowUp: async (id, response, notes = '') => {
    const res = await fetch(`${API_BASE}/followups/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ response, notes }),
    });
    return handleResponse(res);
  },

  // --- Analytics & Demo Reset ---
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse(res);
  },

  getNotifications: async (userId = '', role = '') => {
    const res = await fetch(`${API_BASE}/analytics/notifications?userId=${userId}&role=${role}`);
    return handleResponse(res);
  },

  resetDemo: async () => {
    const res = await fetch(`${API_BASE}/analytics/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },
};
