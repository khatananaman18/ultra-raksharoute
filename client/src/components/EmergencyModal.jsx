import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { INDIAN_CITY_PRESETS, AMBULANCE_TYPES } from '../services/constants';
import {
  X,
  MapPin,
  Ambulance,
  Hospital,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Shield,
  LocateFixed
} from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose, onBookingCreated, hospitals = [] }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [pickupOption, setPickupOption] = useState('preset'); // 'gps', 'preset', 'manual'
  const [selectedPreset, setSelectedPreset] = useState(INDIAN_CITY_PRESETS[1]); // Default AIIMS/South Ext
  const [manualAddress, setManualAddress] = useState('');
  const [requiredType, setRequiredType] = useState('ICU Ambulance');
  const [hospitalSelectionMode, setHospitalSelectionMode] = useState('auto'); // 'auto', 'manual'
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchPhaseText, setSearchPhaseText] = useState('');

  if (!isOpen) return null;

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      addToast({ title: 'GPS Unavailable', message: 'Geolocation not supported by browser. Using Delhi NCR preset.', type: 'info' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedPreset({
          name: 'Current Precise GPS Coordinates',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `Detected GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        });
        setPickupOption('gps');
        addToast({ title: 'Location Acquired', message: 'Exact GPS location locked.', type: 'success' });
      },
      () => {
        addToast({
          title: 'GPS Permission Denied',
          message: 'Defaulting to Delhi NCR central hub.',
          type: 'info',
        });
      },
      { timeout: 8000 }
    );
  };

  const handleTriggerSos = async () => {
    setIsSearching(true);
    setSearchPhaseText('Scanning dynamic perimeter for best available ambulance...');

    try {
      const payload = {
        pickupLat: selectedPreset.lat,
        pickupLng: selectedPreset.lng,
        pickupAddress: pickupOption === 'manual' && manualAddress ? manualAddress : selectedPreset.address,
        patientId: user?.id || 'user-patient-01',
        patientName: user?.name || 'Rahul Sharma',
        patientPhone: user?.phone || '+91 98765 43210',
        conditionCategory: requiredType.includes('ICU') ? 'Critical / ICU Category' : 'Emergency Assistance',
        requiredType,
        destinationHospitalId: hospitalSelectionMode === 'manual' && selectedHospitalId ? selectedHospitalId : null,
        emergencyNotes: emergencyNotes || 'Emergency dispatch triggered via fast modal',
      };

      const res = await api.triggerSos(payload);
      if (res.success && res.data) {
        addToast({
          title: 'Ambulance Dispatched!',
          message: `${res.data.ambulanceType} (${res.data.callSign}) has accepted and is en route.`,
          type: 'emergency',
        });
        onBookingCreated(res.data);
        onClose();
      } else {
        throw new Error(res.message || 'Dispatch failed');
      }
    } catch (err) {
      addToast({
        title: 'Dispatch Failed',
        message: err.message || 'Unable to connect with nearby fleets',
        type: 'emergency',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
              <Ambulance className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Emergency Ambulance Dispatch</span>
                <span className="text-[10px] bg-rose-600/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  FAST 1-TAP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Minimum steps required • Real-time intelligent fleet matching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Location Detection & Tell Location Manually */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>1. Patient Pickup Location</span>
              </label>

              {pickupOption === 'manual' ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ✓ Manual Pickup Active
                </span>
              ) : (
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
                  ● GPS Mode
                </span>
              )}
            </div>

            {/* Mode Segmented Controls */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={handleDetectGps}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  pickupOption === 'gps' || pickupOption === 'preset'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Auto-Detect GPS</span>
              </button>

              <button
                type="button"
                onClick={() => setPickupOption('manual')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  pickupOption === 'manual'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>✍️ Tell Location Manually</span>
              </button>
            </div>

            {/* Manual Location Form View */}
            {pickupOption === 'manual' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Enter Exact Patient Address / Landmark / House No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Tower B, Near Metro Pillar 142, South Extension Part 1"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Or Quick-Select Popular Landmark / Hub:
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { name: 'Connaught Place Inner Circle', lat: 28.6315, lng: 77.2167 },
                      { name: 'AIIMS Apex Trauma Gate 1', lat: 28.5672, lng: 77.2100 },
                      { name: 'Select CITYWALK Mall, Saket', lat: 28.5284, lng: 77.2185 },
                      { name: 'DLF Cyber Hub, Gurugram', lat: 28.4900, lng: 77.0900 },
                      { name: 'Noida Sector 18 Metro', lat: 28.5700, lng: 77.3200 },
                      { name: 'Hauz Khas Village Main Gate', lat: 28.5535, lng: 77.1945 },
                      { name: 'Karol Bagh Market Gate 2', lat: 28.6520, lng: 77.1900 },
                    ].map((landmark, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setManualAddress(landmark.name);
                          setSelectedPreset({
                            name: landmark.name,
                            lat: landmark.lat,
                            lng: landmark.lng,
                            address: landmark.name,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg border transition ${
                          manualAddress === landmark.name
                            ? 'bg-rose-600 text-white border-rose-500 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        📍 {landmark.name}
                      </button>
                    ))}
                  </div>
                </div>

                {manualAddress && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Manual location confirmed: <strong className="text-white">{manualAddress}</strong>. The ambulance driver will navigate directly to this address.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* GPS Presets View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in">
                {INDIAN_CITY_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setPickupOption('preset');
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedPreset.name === preset.name
                        ? 'bg-rose-600/15 border-rose-500 text-white font-medium shadow-md'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-bold text-slate-100">{preset.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{preset.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Ambulance Requirement */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>2. Select Medical Equipment Requirement</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AMBULANCE_TYPES.map((type) => {
                const isSelected = requiredType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRequiredType(type.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400/20 text-white'
                        : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{type.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        type.isICU ? 'bg-rose-500/20 text-rose-300' : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {type.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Destination Hospital */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Hospital className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Destination Hospital Selection</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setHospitalSelectionMode('auto')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  hospitalSelectionMode === 'auto'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                ⚡ Auto-Recommend Nearest Capable Hospital
              </button>
              <button
                type="button"
                onClick={() => setHospitalSelectionMode('manual')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  hospitalSelectionMode === 'manual'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🏥 Choose Preferred Hospital Manually
              </button>
            </div>

            {hospitalSelectionMode === 'manual' && (
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select hospital from verified network...</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.emergencyDepartmentStatus} ({h.icuAvailableBeds} ICU beds available)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Emergency Note / Triage Brief */}
          <div>
            <input
              type="text"
              placeholder="Brief emergency symptom note (e.g., severe chest pain, unconscious, trauma)"
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Footer / Emergency Action CTA */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Intelligent Dynamic Radius Dispatch (5-30 km)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSearching}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTriggerSos}
              disabled={isSearching}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">{searchPhaseText}</span>
                </>
              ) : (
                <>
                  <span>🚨 CONFIRM & DISPATCH AMBULANCE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
