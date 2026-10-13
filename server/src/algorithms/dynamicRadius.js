import { rankAmbulances } from './matchingEngine.js';

const RADIUS_TIERS = [5, 10, 20, 30];

/**
 * Executes dynamic progressive radius expansion search for ambulances.
 * Starts at 5km, expands to 10km, 20km, and 30km until suitable ambulances are found.
 *
 * @param {Object} params
 * @param {number} params.pickupLat
 * @param {number} params.pickupLng
 * @param {Array} params.availableAmbulances - pool of all online ambulances
 * @param {string} params.requiredType - required ambulance type (e.g., ICU, ALS, BLS)
 * @param {string} params.destinationHospitalId - optional destination hospital
 * @returns {Object} Search result with ranked ambulances, final radius, and search log
 */
export function executeDynamicRadiusSearch({
  pickupLat,
  pickupLng,
  availableAmbulances,
  requiredType = 'ANY',
  destinationHospitalId = null,
}) {
  const searchLog = [];
  let matchingAmbulances = [];
  let successfulRadius = null;

  for (const radius of RADIUS_TIERS) {
    searchLog.push({
      radiusKm: radius,
      timestamp: new Date().toISOString(),
      message: `Scanning available emergency fleets within ${radius} km radius...`,
    });

    const ranked = rankAmbulances({
      pickupLat,
      pickupLng,
      ambulances: availableAmbulances,
      requiredType,
      destinationHospitalId,
      maxRadiusKm: radius,
    });

    // Filter to those physically inside this radius tier
    const candidates = ranked.filter(amb => amb.distanceKm <= radius);

    // If searching for ICU, check if at least one ICU/ALS is present
    const isIcuReq = requiredType.toUpperCase().includes('ICU');
    const validMatches = isIcuReq
      ? candidates.filter(a => a.isICU || a.category === 'ALS')
      : candidates;

    if (validMatches.length > 0) {
      matchingAmbulances = validMatches;
      successfulRadius = radius;
      searchLog.push({
        radiusKm: radius,
        timestamp: new Date().toISOString(),
        message: `Found ${validMatches.length} suitable ambulance${validMatches.length > 1 ? 's' : ''} within ${radius} km.`,
        success: true,
      });
      break;
    } else {
      searchLog.push({
        radiusKm: radius,
        timestamp: new Date().toISOString(),
        message: `No immediate match in ${radius} km. Dynamically expanding dispatch perimeter...`,
        success: false,
      });
    }
  }

  // If even 30km had no exact matches, return whatever is available sorted by distance
  if (matchingAmbulances.length === 0 && availableAmbulances.length > 0) {
    const allRanked = rankAmbulances({
      pickupLat,
      pickupLng,
      ambulances: availableAmbulances,
      requiredType,
      destinationHospitalId,
      maxRadiusKm: 50,
    });
    matchingAmbulances = allRanked;
    successfulRadius = 50;
    searchLog.push({
      radiusKm: 50,
      timestamp: new Date().toISOString(),
      message: `Expanded to extended regional grid (50 km). ${allRanked.length} unit(s) found.`,
      success: true,
    });
  }

  return {
    ambulances: matchingAmbulances,
    searchRadiusKm: successfulRadius || 30,
    tiersAttempted: searchLog,
    totalFound: matchingAmbulances.length,
    bestMatch: matchingAmbulances[0] || null,
  };
}
