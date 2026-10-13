/**
 * Geographic utility functions for RakshaRoute
 * Accurate distance calculation, ETA estimation, bearing, and waypoint generation.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates Great Circle distance between two points using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 100) / 100;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates approximate ETA in minutes.
 * Ambulances with emergency siren average ~35 km/h in Indian urban traffic,
 * with a 2-minute baseline preparation/turnaround time.
 * @param {number} distanceKm
 * @param {number} speedKmh - Default 35 km/h
 * @returns {number} ETA in minutes (minimum 1 minute)
 */
export function calculateEtaMinutes(distanceKm, speedKmh = 35) {
  if (distanceKm <= 0.1) return 1;
  const transitTimeMinutes = (distanceKm / speedKmh) * 60;
  const dispatchTurnaround = 1.5; // Turnaround / signal leeway
  return Math.max(1, Math.round(transitTimeMinutes + dispatchTurnaround));
}

/**
 * Calculates bearing from start to end coordinate in degrees (0-360).
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);
  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x =
    Math.cos(rLat1) * Math.sin(rLat2) -
    Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Interpolates waypoints between start and end coordinate.
 * Adds slight natural road deviations for realistic simulation.
 * @param {{lat: number, lng: number}} start
 * @param {{lat: number, lng: number}} end
 * @param {number} steps - Number of intermediate steps
 * @returns {Array<{lat: number, lng: number}>}
 */
export function generateRouteWaypoints(start, end, steps = 15) {
  const waypoints = [];
  waypoints.push({ lat: start.lat, lng: start.lng });

  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    // Base linear interpolation
    let lat = start.lat + (end.lat - start.lat) * fraction;
    let lng = start.lng + (end.lng - start.lng) * fraction;

    // Add small realistic curvature (simulating urban road turns)
    const curveDeviation = Math.sin(fraction * Math.PI) * 0.0015;
    lat += curveDeviation * (i % 2 === 0 ? 1 : -0.7);
    lng += curveDeviation * 0.5;

    waypoints.push({
      lat: Math.round(lat * 100000) / 100000,
      lng: Math.round(lng * 100000) / 100000,
    });
  }

  waypoints.push({ lat: end.lat, lng: end.lng });
  return waypoints;
}
