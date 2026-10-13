import { INITIAL_HOSPITALS, INITIAL_USERS, INITIAL_AMBULANCES, INITIAL_BOOKINGS, INITIAL_FOLLOWUPS } from './seedData.js';
import { calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';

class InMemoryStore {
  constructor() {
    this.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.ambulances = JSON.parse(JSON.stringify(INITIAL_AMBULANCES));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.followUps = JSON.parse(JSON.stringify(INITIAL_FOLLOWUPS));
    this.notifications = [];
  }

  // --- Hospitals ---
  getAllHospitals() {
    return this.hospitals;
  }

  getHospitalById(id) {
    return this.hospitals.find(h => h.id === id) || null;
  }

  updateHospitalCapacity(id, updates) {
    const hospital = this.getHospitalById(id);
    if (!hospital) return null;

    Object.assign(hospital, updates, {
      lastUpdated: new Date().toISOString()
    });
    return hospital;
  }

  // --- Ambulances ---
  getAllAmbulances() {
    return this.ambulances;
  }

  getAmbulanceById(id) {
    return this.ambulances.find(a => a.id === id) || null;
  }

  getAmbulancesByHospitalId(hospitalId) {
    return this.ambulances.filter(a => a.hospitalId === hospitalId);
  }

  getAmbulanceByDriverId(driverId) {
    return this.ambulances.find(a => a.driverId === driverId) || null;
  }

  updateAmbulanceLocation(id, lat, lng) {
    const ambulance = this.getAmbulanceById(id);
    if (!ambulance) return null;

    ambulance.currentLocation = {
      lat: Number(lat),
      lng: Number(lng),
      lastUpdated: new Date().toISOString()
    };
    return ambulance;
  }

  updateAmbulanceAvailability(id, availability) {
    const ambulance = this.getAmbulanceById(id);
    if (!ambulance) return null;
    ambulance.availability = availability; // AVAILABLE, BUSY, OFFLINE
    return ambulance;
  }

  addAmbulance(ambulanceData) {
    const id = `amb-custom-${Date.now().toString(36)}`;
    const newAmbulance = {
      id,
      rating: 5.0,
      availability: 'AVAILABLE',
      accredited: true,
      currentLocation: {
        lat: ambulanceData.lat || 28.5672,
        lng: ambulanceData.lng || 77.2100,
        lastUpdated: new Date().toISOString()
      },
      ...ambulanceData
    };
    this.ambulances.push(newAmbulance);
    return newAmbulance;
  }

  removeAmbulance(id) {
    const index = this.ambulances.findIndex(a => a.id === id);
    if (index !== -1) {
      return this.ambulances.splice(index, 1)[0];
    }
    return null;
  }

  /**
   * Geospatial search for nearby ambulances within radius
   */
  findNearbyAmbulances(lat, lng, radiusKm = 10, requiredType = null, requireICU = false) {
    return this.ambulances
      .map(amb => {
        const distance = calculateDistanceKm(
          lat,
          lng,
          amb.currentLocation.lat,
          amb.currentLocation.lng
        );
        const etaMinutes = calculateEtaMinutes(distance);
        return {
          ...amb,
          distanceKm: distance,
          etaMinutes
        };
      })
      .filter(amb => {
        // Must be in radius
        if (amb.distanceKm > radiusKm) return false;

        // Check availability (default show available, but also report busy if needed)
        // For matching, we strictly consider AVAILABLE
        if (amb.availability !== 'AVAILABLE') return false;

        // Requirement filters
        if (requireICU && !amb.isICU) return false;

        if (requiredType && requiredType !== 'ANY') {
          // Normalize matching
          const req = requiredType.toUpperCase();
          if (req.includes('ICU') && !amb.isICU) return false;
          if (req.includes('ALS') && amb.category !== 'ALS' && !amb.isICU) return false;
        }

        return true;
      });
  }

  // --- Users ---
  getUserById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(userData) {
    const id = `user-${userData.role || 'patient'}-${Date.now().toString(36)}`;
    const newUser = {
      id,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- Bookings ---
  getAllBookings() {
    return this.bookings;
  }

  getBookingById(id) {
    return this.bookings.find(b => b.id === id) || null;
  }

  getActiveBookingForPatient(patientId) {
    return this.bookings.find(
      b => b.patientId === patientId && !['COMPLETED', 'CANCELLED'].includes(b.status)
    ) || null;
  }

  getActiveBookingForDriver(driverId) {
    return this.bookings.find(
      b => b.driverId === driverId && !['COMPLETED', 'CANCELLED'].includes(b.status)
    ) || null;
  }

  createBooking(bookingData) {
    const id = `bk-${Date.now().toString(36).toUpperCase()}`;
    const newBooking = {
      id,
      status: 'REQUESTED',
      requestedAt: new Date().toISOString(),
      timeline: [
        { status: 'REQUESTED', timestamp: new Date().toISOString(), note: 'Emergency request received at RakshaRoute dispatch' }
      ],
      ...bookingData
    };
    this.bookings.unshift(newBooking);

    // If ambulance assigned, mark ambulance as BUSY
    if (newBooking.ambulanceId) {
      this.updateAmbulanceAvailability(newBooking.ambulanceId, 'BUSY');
    }

    return newBooking;
  }

  updateBookingStatus(id, status, extraData = {}) {
    const booking = this.getBookingById(id);
    if (!booking) return null;

    booking.status = status;
    booking.timeline = booking.timeline || [];
    booking.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: extraData.note || `Status transitioned to ${status}`
    });

    Object.assign(booking, extraData);

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      booking.completedAt = new Date().toISOString();
      if (booking.ambulanceId) {
        this.updateAmbulanceAvailability(booking.ambulanceId, 'AVAILABLE');
      }
    }

    return booking;
  }

  addBookingReview(id, rating, reviewText) {
    const booking = this.getBookingById(id);
    if (!booking) return null;
    booking.rating = Number(rating);
    booking.reviewText = reviewText;
    booking.reviewedAt = new Date().toISOString();
    return booking;
  }

  // --- Follow Ups ---
  getAllFollowUps() {
    return this.followUps;
  }

  createFollowUp(data) {
    const id = `flw-${Date.now().toString(36)}`;
    const newFollowUp = {
      id,
      scheduledAt: new Date().toISOString(),
      status: 'SCHEDULED',
      ...data
    };
    this.followUps.push(newFollowUp);
    return newFollowUp;
  }

  updateFollowUp(id, updates) {
    const item = this.followUps.find(f => f.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }

  // --- Notifications ---
  addNotification(notification) {
    const item = {
      id: `notif-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    this.notifications.unshift(item);
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
    return item;
  }

  getNotifications(userId = null, role = null) {
    return this.notifications.filter(n => {
      if (userId && n.userId === userId) return true;
      if (role && n.targetRole === role) return true;
      if (!n.userId && !n.targetRole) return true;
      return false;
    });
  }

  // --- Analytics ---
  getAnalytics() {
    const totalAmbulances = this.ambulances.length;
    const availableAmbulances = this.ambulances.filter(a => a.availability === 'AVAILABLE').length;
    const busyAmbulances = this.ambulances.filter(a => a.availability === 'BUSY').length;
    const offlineAmbulances = this.ambulances.filter(a => a.availability === 'OFFLINE').length;

    const activeEmergencies = this.bookings.filter(b =>
      !['COMPLETED', 'CANCELLED'].includes(b.status)
    ).length;

    const completedTrips = this.bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledTrips = this.bookings.filter(b => b.status === 'CANCELLED').length;

    const totalIcuBeds = this.hospitals.reduce((acc, h) => acc + (h.icuTotalBeds || 0), 0);
    const availableIcuBeds = this.hospitals.reduce((acc, h) => acc + (h.icuAvailableBeds || 0), 0);

    return {
      fleet: {
        total: totalAmbulances,
        available: availableAmbulances,
        busy: busyAmbulances,
        offline: offlineAmbulances,
        utilizationRate: totalAmbulances > 0 ? Math.round((busyAmbulances / totalAmbulances) * 100) : 0
      },
      emergencies: {
        active: activeEmergencies,
        completed: completedTrips,
        cancelled: cancelledTrips,
        avgResponseTimeMinutes: 7.2 // Benchmark average
      },
      hospitals: {
        totalPartnerHospitals: this.hospitals.length,
        totalIcuBeds,
        availableIcuBeds,
        icuOccupancyRate: totalIcuBeds > 0 ? Math.round(((totalIcuBeds - availableIcuBeds) / totalIcuBeds) * 100) : 0
      }
    };
  }
}

export const db = new InMemoryStore();
