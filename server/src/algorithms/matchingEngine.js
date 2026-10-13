import { calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';

/**
 * Intelligent Ambulance Matching Engine
 * Scores available ambulances using:
 * Match Score = Suitability (40) + Distance (30) + ETA (20) + Hospital/Reputation (10)
 *
 * Crucial Rule: Prioritizes medical suitability and emergency requirements
 * over mere physical proximity.
 */
export function rankAmbulances({
  pickupLat,
  pickupLng,
  ambulances,
  requiredType = 'ANY',
  destinationHospitalId = null,
  maxRadiusKm = 25
}) {
  const isIcuRequired =
    requiredType.toUpperCase().includes('ICU') ||
    requiredType.toUpperCase().includes('VENTILATOR') ||
    requiredType.toUpperCase().includes('CRITICAL');

  const isAlsRequired = requiredType.toUpperCase().includes('ALS');
  const isNeonatalRequired = requiredType.toUpperCase().includes('NEONATAL');

  const scoredList = ambulances.map(amb => {
    const distanceKm = calculateDistanceKm(
      pickupLat,
      pickupLng,
      amb.currentLocation.lat,
      amb.currentLocation.lng
    );
    const etaMinutes = calculateEtaMinutes(distanceKm);

    // 1. Medical Suitability Score (0 - 40 points)
    let suitabilityScore = 0;
    let suitabilityNote = '';

    if (isNeonatalRequired) {
      if (amb.category === 'NEONATAL') {
        suitabilityScore = 40;
        suitabilityNote = 'Specialized Neonatal transport with incubator & NICU team';
      } else {
        suitabilityScore = 5;
        suitabilityNote = 'Emergency fallback (lacks infant incubator)';
      }
    } else if (isIcuRequired) {
      if (amb.isICU) {
        suitabilityScore = 40;
        suitabilityNote = 'Certified Mobile ICU with transport ventilator & multipara monitor';
      } else if (amb.category === 'ALS') {
        suitabilityScore = 15;
        suitabilityNote = 'ALS backup available (lacks transport ventilator)';
      } else {
        suitabilityScore = 0;
        suitabilityNote = 'Not recommended: Basic unit unsuitable for critical ICU needs';
      }
    } else if (isAlsRequired) {
      if (amb.category === 'ALS' || amb.isICU) {
        suitabilityScore = 40;
        suitabilityNote = 'Equipped with defibrillator, cardiac monitor & ACLS paramedic';
      } else {
        suitabilityScore = 15;
        suitabilityNote = 'Basic life support fallback';
      }
    } else {
      // General emergency or BLS requested
      if (amb.category === 'BLS') {
        suitabilityScore = 40;
        suitabilityNote = 'Optimal fit for basic emergency transit (conserves ICU units)';
      } else if (amb.category === 'ALS' || amb.isICU) {
        suitabilityScore = 36;
        suitabilityNote = 'High-capability unit available for deployment';
      } else {
        suitabilityScore = 30;
        suitabilityNote = 'Patient transport unit';
      }
    }

    // 2. Distance Score (0 - 30 points)
    const distanceFraction = Math.min(distanceKm / maxRadiusKm, 1);
    const distanceScore = Math.max(0, Math.round(30 * (1 - distanceFraction)));

    // 3. ETA Score (0 - 20 points)
    const etaFraction = Math.min(etaMinutes / 40, 1);
    const etaScore = Math.max(0, Math.round(20 * (1 - etaFraction)));

    // 4. Hospital Compatibility & Rating (0 - 10 points)
    let hospitalScore = 0;
    if (destinationHospitalId && amb.hospitalId === destinationHospitalId) {
      hospitalScore += 6; // Direct hospital fleet tie-in
    } else if (amb.hospitalId) {
      hospitalScore += 3;
    }
    const ratingScore = Math.min(4, Math.round(((amb.rating || 4.5) / 5) * 4));
    const reputationScore = hospitalScore + ratingScore;

    // Total Match Score (0 - 100)
    let totalScore = suitabilityScore + distanceScore + etaScore + reputationScore;

    // Medical veto: If critical ICU required but unit is completely unsuitable, cap score
    if (isIcuRequired && !amb.isICU && amb.category !== 'ALS') {
      totalScore = Math.min(totalScore, 20);
    }

    return {
      ...amb,
      distanceKm,
      etaMinutes,
      matchScore: Math.round(totalScore),
      scoreBreakdown: {
        suitability: suitabilityScore,
        distance: distanceScore,
        eta: etaScore,
        reputation: reputationScore,
      },
      matchExplanation: suitabilityNote,
      isExactMedicalMatch: isIcuRequired ? amb.isICU : true,
    };
  });

  // Sort descending by match score, then ascending by distance
  return scoredList.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distanceKm - b.distanceKm;
  });
}
