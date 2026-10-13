import { db } from '../db/store.js';
import { generateRouteWaypoints, calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';
import { scheduleFollowUpForBooking } from './notificationService.js';

class SimulationService {
  constructor() {
    this.activeSimulations = new Map(); // bookingId -> interval/timeout handlers
    this.io = null;
  }

  setSocketServer(io) {
    this.io = io;
  }

  /**
   * Starts an automated end-to-end trip simulation for a booking.
   * Smoothly animates GPS coordinates and steps through lifecycle:
   * REQUESTED -> ASSIGNED -> EN_ROUTE_PICKUP -> ARRIVED_PICKUP -> TRIP_STARTED -> ARRIVED_HOSPITAL -> COMPLETED
   */
  startBookingSimulation(bookingId) {
    // Clear any existing simulation for this booking
    this.stopSimulation(bookingId);

    const booking = db.getBookingById(bookingId);
    if (!booking || !booking.ambulanceId) return;

    const ambulance = db.getAmbulanceById(booking.ambulanceId);
    if (!ambulance) return;

    const simState = {
      bookingId,
      ambulanceId: ambulance.id,
      phase: 'TO_PICKUP', // TO_PICKUP, AT_PICKUP, TO_HOSPITAL, COMPLETED
      waypoints: [],
      currentStep: 0,
      intervalId: null,
      timeoutId: null,
    };

    this.activeSimulations.set(bookingId, simState);

    // Step 1: Simulate Driver Acceptance after 2.5 seconds
    simState.timeoutId = setTimeout(() => {
      this.handleDriverAccepted(bookingId);
    }, 2500);
  }

  handleDriverAccepted(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking || booking.status === 'CANCELLED') return;

    db.updateBookingStatus(bookingId, 'ASSIGNED', {
      note: 'Driver Rajesh Kumar accepted emergency dispatch request.',
    });
    this.broadcastBookingUpdate(bookingId);

    // After 2 seconds, begin driving to patient
    setTimeout(() => {
      const b = db.getBookingById(bookingId);
      if (!b || b.status === 'CANCELLED') return;

      db.updateBookingStatus(bookingId, 'EN_ROUTE_PICKUP', {
        note: 'Ambulance is en route to patient pickup location.',
      });
      this.broadcastBookingUpdate(bookingId);

      this.startMovingAmbulanceToPickup(bookingId);
    }, 2000);
  }

  startMovingAmbulanceToPickup(bookingId) {
    const booking = db.getBookingById(bookingId);
    const ambulance = db.getAmbulanceById(booking.ambulanceId);
    if (!booking || !ambulance) return;

    const start = {
      lat: ambulance.currentLocation.lat,
      lng: ambulance.currentLocation.lng,
    };
    const end = {
      lat: booking.pickupLocation.lat,
      lng: booking.pickupLocation.lng,
    };

    const waypoints = generateRouteWaypoints(start, end, 10);
    const simState = this.activeSimulations.get(bookingId);
    if (!simState) return;

    simState.waypoints = waypoints;
    simState.currentStep = 0;
    simState.phase = 'TO_PICKUP';

    simState.intervalId = setInterval(() => {
      const currentB = db.getBookingById(bookingId);
      if (!currentB || currentB.status === 'CANCELLED') {
        this.stopSimulation(bookingId);
        return;
      }

      simState.currentStep++;
      if (simState.currentStep < waypoints.length) {
        const point = waypoints[simState.currentStep];
        db.updateAmbulanceLocation(ambulance.id, point.lat, point.lng);

        const distRemaining = calculateDistanceKm(point.lat, point.lng, end.lat, end.lng);
        const eta = calculateEtaMinutes(distRemaining);

        currentB.currentDistanceKm = distRemaining;
        currentB.currentEtaMinutes = eta;

        this.broadcastLocationUpdate(ambulance.id, point.lat, point.lng);
        this.broadcastBookingUpdate(bookingId);
      } else {
        // Ambulance arrived at patient
        clearInterval(simState.intervalId);
        db.updateAmbulanceLocation(ambulance.id, end.lat, end.lng);
        db.updateBookingStatus(bookingId, 'ARRIVED_PICKUP', {
          note: 'Ambulance has arrived at patient location. Paramedics assessing.',
          currentDistanceKm: 0,
          currentEtaMinutes: 0,
        });
        this.broadcastBookingUpdate(bookingId);

        // After 4 seconds at scene, embark to hospital
        setTimeout(() => {
          this.startTripToHospital(bookingId);
        }, 4000);
      }
    }, 2500);
  }

  startTripToHospital(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking || booking.status === 'CANCELLED') return;

    const ambulance = db.getAmbulanceById(booking.ambulanceId);
    db.updateBookingStatus(bookingId, 'TRIP_STARTED', {
      note: 'Patient onboard. High-priority transit to hospital destination initiated.',
    });
    this.broadcastBookingUpdate(bookingId);

    const start = {
      lat: booking.pickupLocation.lat,
      lng: booking.pickupLocation.lng,
    };
    const end = {
      lat: booking.destinationHospitalLocation.lat,
      lng: booking.destinationHospitalLocation.lng,
    };

    const waypoints = generateRouteWaypoints(start, end, 10);
    const simState = this.activeSimulations.get(bookingId);
    if (!simState) return;

    simState.waypoints = waypoints;
    simState.currentStep = 0;
    simState.phase = 'TO_HOSPITAL';

    simState.intervalId = setInterval(() => {
      const currentB = db.getBookingById(bookingId);
      if (!currentB || currentB.status === 'CANCELLED') {
        this.stopSimulation(bookingId);
        return;
      }

      simState.currentStep++;
      if (simState.currentStep < waypoints.length) {
        const point = waypoints[simState.currentStep];
        db.updateAmbulanceLocation(ambulance.id, point.lat, point.lng);

        const distRemaining = calculateDistanceKm(point.lat, point.lng, end.lat, end.lng);
        const eta = calculateEtaMinutes(distRemaining);

        currentB.currentDistanceKm = distRemaining;
        currentB.currentEtaMinutes = eta;

        this.broadcastLocationUpdate(ambulance.id, point.lat, point.lng);
        this.broadcastBookingUpdate(bookingId);
      } else {
        // Reached hospital
        clearInterval(simState.intervalId);
        db.updateAmbulanceLocation(ambulance.id, end.lat, end.lng);
        db.updateBookingStatus(bookingId, 'ARRIVED_HOSPITAL', {
          note: 'Arrived at Hospital Emergency Department. Handover in progress.',
          currentDistanceKm: 0,
          currentEtaMinutes: 0,
        });
        this.broadcastBookingUpdate(bookingId);

        // After 3 seconds, complete trip
        setTimeout(() => {
          this.completeBooking(bookingId);
        }, 3000);
      }
    }, 2500);
  }

  completeBooking(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    db.updateBookingStatus(bookingId, 'COMPLETED', {
      note: 'Patient safely handed over to hospital trauma team. Emergency trip completed.',
    });
    this.broadcastBookingUpdate(bookingId);

    // Schedule automated post-trip follow-up reminder
    scheduleFollowUpForBooking(booking, this.io);

    this.stopSimulation(bookingId);
  }

  stopSimulation(bookingId) {
    const simState = this.activeSimulations.get(bookingId);
    if (simState) {
      if (simState.intervalId) clearInterval(simState.intervalId);
      if (simState.timeoutId) clearTimeout(simState.timeoutId);
      this.activeSimulations.delete(bookingId);
    }
  }

  broadcastBookingUpdate(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (this.io && booking) {
      this.io.emit('booking:updated', booking);
      this.io.to(`booking:${bookingId}`).emit('booking:status:change', booking);
    }
  }

  broadcastLocationUpdate(ambulanceId, lat, lng) {
    if (this.io) {
      this.io.emit('driver:location:update', {
        ambulanceId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const simulationService = new SimulationService();
