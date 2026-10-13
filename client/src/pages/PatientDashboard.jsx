import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { INDIAN_CITY_PRESETS, AMBULANCE_TYPES, EMERGENCY_NUMBERS } from '../services/constants';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Ambulance,
  Hospital,
  MapPin,
  Clock,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
  XCircle,
  Activity,
  HeartPulse,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function PatientDashboard({ onOpenSosModal, activeBooking, setActiveBooking }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useNotification();

  // Location state
  const [currentLocation, setCurrentLocation] = useState(INDIAN_CITY_PRESETS[1]); // Default AIIMS
  const [manualAddress, setManualAddress] = useState('');
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState('ICU Ambulance');

  // Network data
  const [nearbyAmbulances, setNearbyAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isSearchingRadius, setIsSearchingRadius] = useState(false);
  const [searchAuditLogs, setSearchAuditLogs] = useState([]);
  const [searchRadiusKm, setSearchRadiusKm] = useState(15);

  // Review & Rating Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewComments, setReviewComments] = useState('');

  // Post-Trip Follow-Up survey
  const [followUpItem, setFollowUpItem] = useState(null);
  const [followUpResponse, setFollowUpResponse] = useState('');

  // 1. Load initial hospitals and nearby ambulances
  useEffect(() => {
    loadData();
  }, [currentLocation]);

  const loadData = async () => {
    try {
      const [hospRes, ambRes] = await Promise.all([
        api.getHospitals(currentLocation.lat, currentLocation.lng),
        api.getNearbyAmbulances({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          radius: searchRadiusKm,
          type: selectedAmbulanceType,
        }),
      ]);

      if (hospRes.success) {
        setHospitals(hospRes.data);
        if (!selectedHospital && hospRes.data.length > 0) {
          setSelectedHospital(hospRes.data[0]); // default nearest capable
        }
      }

      if (ambRes.success) {
        setNearbyAmbulances(ambRes.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  // 2. Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    // Driver live location updates
    const handleLocationUpdate = ({ ambulanceId, lat, lng }) => {
      // Update in nearby ambulances list
      setNearbyAmbulances((prev) =>
        prev.map((a) => (a.id === ambulanceId ? { ...a, currentLocation: { lat, lng } } : a))
      );

      // Update in active booking if matches
      if (activeBooking && activeBooking.ambulanceId === ambulanceId) {
        setActiveBooking((prev) => ({
          ...prev,
          currentLocation: { lat, lng },
        }));
      }
    };

    // Booking status changes
    const handleBookingUpdate = (updatedBooking) => {
      if (activeBooking && activeBooking.id === updatedBooking.id) {
        setActiveBooking(updatedBooking);

        if (updatedBooking.status === 'COMPLETED') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          setShowReviewModal(true);
          addToast({
            title: 'Trip Completed',
            message: 'Patient safely arrived at hospital emergency trauma desk.',
            type: 'success',
          });
        }
      }
    };

    // Hospital capacity updates
    const handleHospitalUpdate = (updatedHosp) => {
      setHospitals((prev) =>
        prev.map((h) => (h.id === updatedHosp.id ? { ...h, ...updatedHosp } : h))
      );
    };

    // Follow up created
    const handleFollowUpCreated = (item) => {
      if (activeBooking && item.bookingId === activeBooking.id) {
        setFollowUpItem(item);
      }
    };

    socket.on('driver:location:update', handleLocationUpdate);
    socket.on('booking:updated', handleBookingUpdate);
    socket.on('hospital:capacity:update', handleHospitalUpdate);
    socket.on('followup:created', handleFollowUpCreated);

    return () => {
      socket.off('driver:location:update', handleLocationUpdate);
      socket.off('booking:updated', handleBookingUpdate);
      socket.off('hospital:capacity:update', handleHospitalUpdate);
      socket.off('followup:created', handleFollowUpCreated);
    };
  }, [socket, activeBooking]);

  // 3. Dynamic Search Radius Trigger
  const handleDynamicSearch = async () => {
    setIsSearchingRadius(true);
    setSearchAuditLogs([]);
    try {
      const res = await api.searchDynamicRadius({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        requiredType: selectedAmbulanceType,
        destinationHospitalId: selectedHospital?.id,
      });

      if (res.success) {
        setNearbyAmbulances(res.ambulances);
        setSearchAuditLogs(res.tiersAttempted || []);
        setSearchRadiusKm(res.searchRadiusKm);
        addToast({
          title: `Grid Scan Complete (${res.searchRadiusKm} km)`,
          message: `Identified ${res.totalFound} medically capable ambulances.`,
          type: 'info',
        });
      }
    } catch (e) {
      addToast({ title: 'Search Error', message: e.message, type: 'emergency' });
    } finally {
      setIsSearchingRadius(false);
    }
  };

  // 4. Quick SOS Dispatch from Dashboard
  const handleDirectDispatch = async (ambulance) => {
    try {
      const payload = {
        pickupLat: currentLocation.lat,
        pickupLng: currentLocation.lng,
        pickupAddress: manualAddress || currentLocation.address,
        patientId: user?.id || 'user-patient-01',
        patientName: user?.name || 'Rahul Sharma',
        patientPhone: user?.phone || '+91 98765 43210',
        conditionCategory: ambulance.isICU ? 'Critical / ICU Emergency' : 'Standard Emergency',
        requiredType: ambulance.type,
        destinationHospitalId: selectedHospital?.id || null,
        emergencyNotes: `Direct dispatch of ${ambulance.callSign}`,
      };

      const res = await api.triggerSos(payload);
      if (res.success) {
        setActiveBooking(res.data);
        addToast({
          title: 'Ambulance Dispatched',
          message: `${res.data.ambulanceType} (${res.data.callSign}) has been assigned.`,
          type: 'emergency',
        });
      }
    } catch (e) {
      addToast({ title: 'Dispatch Error', message: e.message, type: 'emergency' });
    }
  };

  // 5. Cancel Booking
  const handleCancelBooking = async () => {
    if (!activeBooking) return;
    try {
      await api.cancelBooking(activeBooking.id, 'Cancelled by patient');
      setActiveBooking(null);
      addToast({ title: 'Request Cancelled', message: 'Ambulance dispatch cancelled.', type: 'info' });
      loadData();
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'emergency' });
    }
  };

  // 6. Submit Review
  const handleSubmitReview = async () => {
    if (!activeBooking) return;
    try {
      await api.submitReview(activeBooking.id, ratingStars, reviewComments);
      addToast({ title: 'Review Submitted', message: 'Thank you for your rating!', type: 'success' });
      setShowReviewModal(false);
    } catch (e) {
      addToast({ title: 'Review Error', message: e.message, type: 'emergency' });
    }
  };

  // 7. Submit Follow-up response
  const handleFollowUpSubmit = async () => {
    if (!followUpItem || !followUpResponse) return;
    try {
      await api.respondFollowUp(followUpItem.id, followUpResponse);
      addToast({ title: 'Status Recorded', message: 'Post-trip health update logged.', type: 'success' });
      setFollowUpItem(null);
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'emergency' });
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 5: HOW CAN WE HELP YOU & EMERGENCY SOS */}
      {!activeBooking && (
        <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/70 border border-rose-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-center lg:justify-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Immediate Medical Dispatch</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                How can we help you right now?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                When seconds matter, tap the SOS button to instantly discover and dispatch the closest suitable ICU or ALS ambulance.
              </p>
            </div>

            {/* Giant SOS Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={onOpenSosModal}
                className="w-44 h-44 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-4 border-rose-400/40 text-white shadow-2xl shadow-rose-950 flex flex-col items-center justify-center gap-1 transform transition hover:scale-105 active:scale-95 group relative"
              >
                <div className="absolute inset-0 rounded-full border border-rose-400/30 animate-ping pointer-events-none"></div>
                <span className="text-4xl group-hover:rotate-12 transition">🚨</span>
                <span className="text-lg font-black tracking-wider uppercase mt-1">EMERGENCY</span>
                <span className="text-xs font-bold text-rose-200 tracking-widest uppercase">SOS DISPATCH</span>
              </button>
              <span className="text-[11px] text-slate-400 font-semibold mt-3">1-Tap Fast GPS Routing</span>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE DISPATCH TRACKING VIEW (If booking exists) */}
      {activeBooking && (
        <div className="bg-slate-900 border-2 border-rose-600/50 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Ambulance className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{activeBooking.ambulanceType}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                    {activeBooking.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Callsign: <strong className="text-white">{activeBooking.callSign}</strong> ({activeBooking.vehicleNumber}) • Destination: {activeBooking.hospitalName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Estimated Arrival (ETA)</p>
                <p className="text-2xl font-black text-rose-400">
                  {activeBooking.currentEtaMinutes !== undefined ? `${activeBooking.currentEtaMinutes} min` : '5 min'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeBooking.currentDistanceKm !== undefined ? `${activeBooking.currentDistanceKm} km remaining` : '2.8 km away'}
                </p>
              </div>

              <button
                onClick={handleCancelBooking}
                className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 rounded-xl text-xs font-semibold transition"
              >
                Cancel Request
              </button>
            </div>
          </div>

          {/* Map showing live moving ambulance to patient pickup and hospital */}
          <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-800">
            <LiveEmergencyMap
              patientLocation={activeBooking.pickupLocation}
              ambulances={nearbyAmbulances}
              activeAmbulance={{
                id: activeBooking.ambulanceId,
                currentLocation: activeBooking.currentLocation || { lat: 28.5750, lng: 77.2130 },
              }}
              destinationHospital={{
                location: activeBooking.destinationHospitalLocation,
              }}
              className="h-full w-full"
            />
          </div>

          {/* Telemetry Bar & Pilot Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Assigned Ambulance Pilot</p>
                <p className="font-bold text-sm text-white">{activeBooking.driverName || 'Rajesh Kumar'}</p>
                <p className="text-[11px] text-slate-500">Certified Emergency Responder</p>
              </div>
              <a
                href={`tel:${activeBooking.driverPhone || '9811223344'}`}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition flex items-center justify-center"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Emergency Status Timeline</p>
              <p className="font-bold text-sm text-rose-400 capitalize">
                {activeBooking.status.toLowerCase().replace(/_/g, ' ')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {activeBooking.timeline?.[activeBooking.timeline.length - 1]?.note || 'In transit'}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Destination Hospital Emergency</p>
              <p className="font-bold text-sm text-white truncate">{activeBooking.hospitalName}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">● Level 1 Trauma Center Ready</p>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION & AMBULANCE DISCOVERY INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Location & Matching Options (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Current Pickup Location</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">GPS Ready</span>
            </div>

            <div className="space-y-2">
              {INDIAN_CITY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentLocation(preset)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs transition ${
                    currentLocation.name === preset.name
                      ? 'bg-rose-600/15 border-rose-500 text-white font-semibold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold">{preset.name}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{preset.address}</p>
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                placeholder="Or type manual landmark / building..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Ambulance Requirement Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Required Ambulance Category</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {AMBULANCE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedAmbulanceType(t.id)}
                  className={`p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                    selectedAmbulanceType === t.id
                      ? 'bg-sky-600/20 border-sky-400 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="text-xs text-white font-bold">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.badge}</p>
                  </div>
                  {t.isICU && (
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold">
                      ICU Critical
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dynamic Radius Trigger */}
            <button
              onClick={handleDynamicSearch}
              disabled={isSearchingRadius}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Search className={`w-3.5 h-3.5 ${isSearchingRadius ? 'animate-spin' : ''}`} />
              <span>{isSearchingRadius ? 'Expanding Dynamic Radius...' : `Scan Dynamic Radius (${searchRadiusKm} km)`}</span>
            </button>

            {/* Search Audit Logs */}
            {searchAuditLogs.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                <p className="font-bold text-slate-400">Dynamic Dispatch Audit:</p>
                {searchAuditLogs.map((log, i) => (
                  <p key={i} className={`flex items-center gap-1.5 ${log.success ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                    <span>{log.success ? '✓' : '•'}</span>
                    <span>{log.message}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ranked Nearby Ambulances & Live Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Fleet Grid</span>
              </h3>
              <span className="text-xs text-slate-400">
                {nearbyAmbulances.length} Active Ambulances Nearby
              </span>
            </div>

            <div className="h-72 w-full rounded-2xl overflow-hidden">
              <LiveEmergencyMap
                patientLocation={currentLocation}
                ambulances={nearbyAmbulances}
                hospitals={hospitals}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Ranked Available Ambulances Cards (Section 6: Matching Algorithm) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">
                Intelligently Ranked Available Ambulances
              </h3>
              <span className="text-xs text-slate-400">Prioritizing Medical Match Score</span>
            </div>

            {nearbyAmbulances.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                <p className="font-bold text-white text-sm">No ambulances found within {searchRadiusKm} km</p>
                <p>Try clicking "Scan Dynamic Radius" above to automatically expand to 30+ km regional coverage.</p>
              </div>
            ) : (
              nearbyAmbulances.map((amb, idx) => (
                <div
                  key={amb.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-white">{amb.callSign || amb.vehicleNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        amb.isICU
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {amb.category}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>TOP MEDICAL MATCH</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{amb.providerName}</p>

                    <p className="text-[11px] text-slate-400 italic">
                      {amb.matchExplanation || 'Equipped for rapid emergency transit'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{amb.distanceKm} km away</span>
                      </span>
                      <span className="flex items-center gap-1 text-rose-400 font-black">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ETA {amb.etaMinutes} min</span>
                      </span>
                      <span className="text-amber-400 font-bold">★ {amb.rating || 4.9}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                    {amb.matchScore && (
                      <span className="text-[11px] text-slate-400 sm:text-right hidden sm:block">
                        Score: <strong className="text-emerald-400">{amb.matchScore}/100</strong>
                      </span>
                    )}
                    <button
                      onClick={() => handleDirectDispatch(amb)}
                      className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Select Ambulance</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HOSPITAL SELECTION CARDS (Section 10) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Partner Hospital Emergency Capacities
                </h3>
                <p className="text-xs text-slate-400">Live verified ICU bed & emergency department status</p>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full font-bold">
                ● Live Updates
              </span>
            </div>

            <div className="space-y-3">
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedHospital?.id === hosp.id
                      ? 'bg-slate-800/80 border-emerald-500/80'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{hosp.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {hosp.emergencyDepartmentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{hosp.address}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                      <span className="text-emerald-400 font-bold">
                        ICU Beds: {hosp.icuAvailableBeds} Available
                      </span>
                      <span>•</span>
                      <span>{hosp.availableAmbulanceCount || 4} Ambulances Stationed</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedHospital(hosp);
                      addToast({ title: 'Hospital Selected', message: `Destination set to ${hosp.name}`, type: 'success' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedHospital?.id === hosp.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {selectedHospital?.id === hosp.id ? '✓ Selected' : 'Choose Hospital'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POST-TRIP REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                ★
              </div>
              <h3 className="text-lg font-bold text-white">How was your emergency transport?</h3>
              <p className="text-xs text-slate-400">
                Your feedback helps verify paramedic response times and ambulance care standards.
              </p>
            </div>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className={`text-2xl transition ${
                    star <= ratingStars ? 'text-amber-400 scale-110' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share details about paramedic response speed, care quality, or hospital transfer..."
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-24 resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-400 font-semibold hover:bg-slate-800"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-TRIP SCHEDULED HEALTH FOLLOW-UP BANNER (Section 12) */}
      {followUpItem && (
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border border-sky-800/60 rounded-3xl p-6 shadow-xl space-y-4 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <HeartPulse className="w-6 h-6 text-sky-400 animate-pulse" />
            <div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                POST-TRIP CARE CHECK-IN
              </span>
              <h4 className="text-base font-bold text-white mt-1">{followUpItem.question}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {followUpItem.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => setFollowUpResponse(opt)}
                className={`p-3 rounded-xl border text-xs text-left transition ${
                  followUpResponse === opt
                    ? 'bg-sky-600/30 border-sky-400 text-white font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleFollowUpSubmit}
              disabled={!followUpResponse}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition disabled:opacity-40"
            >
              Confirm Patient Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
