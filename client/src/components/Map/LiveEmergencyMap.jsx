import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Ambulance as AmbulanceIcon,
  Hospital as HospitalIcon,
  Maximize2,
  Layers,
  Compass
} from 'lucide-react';

// Fix Leaflet default icon paths if any default markers are used
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Custom HTML/SVG Markers ---

// 1. Patient Incident Beacon
const createPatientIcon = (pulseColor = '#F43F5E') =>
  L.divIcon({
    className: 'custom-patient-beacon',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(244, 63, 94, 0.25);
          animation: pulse-ring-anim 1.6s ease-out infinite;
        "></div>
        <div style="
          position: relative;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #E11D48;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 11px;
        ">
          📍
        </div>
      </div>
      <style>
        @keyframes pulse-ring-anim {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

// 2. Ambulance Marker (Moving Unit or Standby)
const createAmbulanceIcon = ({
  callSign = 'EMS',
  isAssigned = false,
  isICU = false,
  etaMinutes = null,
}) =>
  L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        pointer-events: auto;
      ">
        <div style="
          padding: 3px 8px;
          border-radius: 9999px;
          background: ${isAssigned ? '#D97706' : isICU ? '#E11D48' : '#0284C7'};
          color: white;
          font-size: 10px;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          margin-bottom: 2px;
          ${isAssigned ? 'animation: bounce-siren 1s infinite alternate;' : ''}
        ">
          <span>🚑</span>
          <span>${callSign}</span>
          ${etaMinutes ? `<span style="background: rgba(0,0,0,0.3); padding: 1px 4px; border-radius: 4px; font-size: 9px;">${etaMinutes}m</span>` : ''}
        </div>
        <div style="
          width: 14px;
          height: 14px;
          background: ${isAssigned ? '#F59E0B' : isICU ? '#F43F5E' : '#38BDF8'};
          border: 2px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        "></div>
      </div>
      <style>
        @keyframes bounce-siren {
          0% { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }
      </style>
    `,
    iconSize: [60, 40],
    iconAnchor: [30, 40],
  });

// 3. Hospital Destination Marker
const createHospitalIcon = (name = 'Hospital', isDestination = false) =>
  L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
        pointer-events: auto;
      ">
        <div style="
          padding: 2px 7px;
          border-radius: 6px;
          background: ${isDestination ? '#059669' : '#0F172A'};
          color: white;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 1.5px solid ${isDestination ? '#34D399' : '#334155'};
          white-space: nowrap;
          margin-bottom: 2px;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${name}
        </div>
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #059669;
          border: 2px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">
          🏥
        </div>
      </div>
    `,
    iconSize: [60, 44],
    iconAnchor: [30, 44],
  });

// Map Controller for auto-resizing, fitting bounds, and recentering
function MapController({ bounds, center, activeViewMode }) {
  const map = useMap();

  // Invalidate size immediately and with small delays to solve grey tile glitches
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  // Fit bounds when markers change or when bounds mode is selected
  useEffect(() => {
    if (bounds && bounds.length > 1) {
      try {
        const leafletBounds = L.latLngBounds(bounds);
        if (leafletBounds.isValid()) {
          map.fitBounds(leafletBounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
            duration: 1.0,
          });
        }
      } catch (e) {
        // Fallback
      }
    } else if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 1.0 });
    }
  }, [bounds, center, map]);

  return null;
}

export default function LiveEmergencyMap({
  patientLocation,
  ambulances = [],
  hospitals = [],
  activeAmbulance = null,
  destinationHospital = null,
  routeCoordinates = [],
  className = 'h-96 w-full',
}) {
  // Tile Layer Presets
  const [tileMode, setTileMode] = useState('dark'); // 'dark', 'street', 'voyager'

  // Extract coordinates safely supporting different formats
  const patLat = patientLocation?.location?.lat ?? patientLocation?.lat ?? 28.5672;
  const patLng = patientLocation?.location?.lng ?? patientLocation?.lng ?? 77.2100;

  const ambLat = activeAmbulance?.currentLocation?.lat ?? activeAmbulance?.lat ?? null;
  const ambLng = activeAmbulance?.currentLocation?.lng ?? activeAmbulance?.lng ?? null;

  const destLat =
    destinationHospital?.location?.lat ??
    destinationHospital?.lat ??
    null;
  const destLng =
    destinationHospital?.location?.lng ??
    destinationHospital?.lng ??
    null;

  // Build Route Polyline Points
  const polylinePoints = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      return routeCoordinates.map((p) => [p.lat, p.lng]);
    }

    const points = [];
    if (ambLat && ambLng) {
      points.push([ambLat, ambLng]);
    }
    if (patLat && patLng) {
      points.push([patLat, patLng]);
    }
    if (destLat && destLng) {
      points.push([destLat, destLng]);
    }
    return points;
  }, [ambLat, ambLng, patLat, patLng, destLat, destLng, routeCoordinates]);

  // Build Collective Bounds for auto-fit framing
  const mapBounds = useMemo(() => {
    const list = [];
    if (patLat && patLng) list.push([patLat, patLng]);
    if (ambLat && ambLng) list.push([ambLat, ambLng]);
    if (destLat && destLng) list.push([destLat, destLng]);

    // Also include other ambulances and hospitals if no active single trip
    if (!activeAmbulance && ambulances.length > 0) {
      ambulances.slice(0, 5).forEach((a) => {
        if (a.currentLocation?.lat && a.currentLocation?.lng) {
          list.push([a.currentLocation.lat, a.currentLocation.lng]);
        }
      });
    }

    return list.length >= 2 ? list : null;
  }, [patLat, patLng, ambLat, ambLng, destLat, destLng, ambulances, activeAmbulance]);

  // Initial center fallback
  const initialCenter = [patLat, patLng];

  // Tile URL configuration
  const tileConfig = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${className}`}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ minHeight: '100%', height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={tileConfig[tileMode].attribution}
          url={tileConfig[tileMode].url}
          maxZoom={19}
        />

        {/* Dynamic bounds and auto-resize engine */}
        <MapController
          bounds={mapBounds}
          center={ambLat && ambLng ? [ambLat, ambLng] : initialCenter}
        />

        {/* 1. Patient Pickup Marker */}
        {patLat && patLng && (
          <Marker position={[patLat, patLng]} icon={createPatientIcon()}>
            <Popup className="emergency-popup">
              <div className="p-1.5 text-slate-100 min-w-[180px]">
                <p className="font-black text-xs text-rose-400 uppercase tracking-wide flex items-center gap-1">
                  <span>📍</span>
                  <span>Patient Pickup Location</span>
                </p>
                <p className="text-xs font-semibold text-slate-200 mt-1">
                  {patientLocation?.address || 'Incident Pickup Site'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  GPS: {patLat.toFixed(4)}, {patLng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Active Moving / Assigned Ambulance Marker */}
        {ambLat && ambLng && (
          <Marker
            position={[ambLat, ambLng]}
            icon={createAmbulanceIcon({
              callSign: activeAmbulance.callSign || activeAmbulance.vehicleNumber || 'Dispatch',
              isAssigned: true,
              isICU: activeAmbulance.isICU || activeAmbulance.type?.includes('ICU'),
              etaMinutes: activeAmbulance.currentEtaMinutes || activeAmbulance.etaMinutes || null,
            })}
          >
            <Popup>
              <div className="p-1.5 text-slate-100 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-400">
                    {activeAmbulance.callSign || activeAmbulance.vehicleNumber}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                    EN ROUTE
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-300 mt-1">
                  {activeAmbulance.type || 'Emergency Ambulance'}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Pilot: {activeAmbulance.driverName || 'Rajesh Kumar'}</span>
                  <span className="text-amber-400 font-bold">★ 4.9</span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Nearby Fleet Ambulances (Standby units not currently active) */}
        {ambulances
          .filter((a) => !activeAmbulance || a.id !== activeAmbulance.id)
          .map((amb) => {
            const aLat = amb.currentLocation?.lat ?? amb.lat;
            const aLng = amb.currentLocation?.lng ?? amb.lng;
            if (!aLat || !aLng) return null;

            return (
              <Marker
                key={amb.id}
                position={[aLat, aLng]}
                icon={createAmbulanceIcon({
                  callSign: amb.callSign || amb.vehicleNumber,
                  isAssigned: false,
                  isICU: amb.isICU || amb.category === 'ICU',
                  etaMinutes: amb.etaMinutes || null,
                })}
              >
                <Popup>
                  <div className="p-1.5 text-slate-100 min-w-[190px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{amb.callSign || amb.vehicleNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        amb.isICU ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {amb.category || 'EMS'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{amb.providerName}</p>
                    {amb.distanceKm !== undefined && (
                      <div className="mt-2 pt-1 border-t border-slate-800 text-xs flex justify-between font-semibold">
                        <span className="text-slate-400">{amb.distanceKm} km away</span>
                        <span className="text-rose-400">ETA {amb.etaMinutes}m</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 4. Dedicated Destination Hospital Marker (Guaranteed display!) */}
        {destLat && destLng && (
          <Marker
            position={[destLat, destLng]}
            icon={createHospitalIcon(
              destinationHospital.name || destinationHospital.hospitalName || 'Destination Hospital',
              true
            )}
          >
            <Popup>
              <div className="p-1.5 text-slate-100 min-w-[210px]">
                <p className="font-bold text-xs text-emerald-400">
                  {destinationHospital.name || destinationHospital.hospitalName || 'Destination Hospital'}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {destinationHospital.address || 'Emergency Trauma Center'}
                </p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">
                  ● Level 1 Emergency Intake Ready
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5. All Other Network Partner Hospitals */}
        {hospitals
          .filter(
            (h) =>
              !destLat ||
              (h.location?.lat !== destLat && h.location?.lng !== destLng)
          )
          .map((hosp) => {
            const hLat = hosp.location?.lat ?? hosp.lat;
            const hLng = hosp.location?.lng ?? hosp.lng;
            if (!hLat || !hLng) return null;

            return (
              <Marker
                key={hosp.id}
                position={[hLat, hLng]}
                icon={createHospitalIcon(hosp.name, false)}
              >
                <Popup>
                  <div className="p-1.5 text-slate-100 min-w-[200px]">
                    <p className="font-bold text-xs text-white">{hosp.name}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{hosp.emergencyDepartmentStatus}</p>
                    <div className="mt-1 text-xs bg-slate-900 border border-slate-800 p-1.5 rounded font-semibold flex justify-between text-emerald-400">
                      <span>Available ICU Beds:</span>
                      <span>{hosp.icuAvailableBeds} / {hosp.icuTotalBeds}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 6. Route Polyline (Dashed glowing path) */}
        {polylinePoints.length > 1 && (
          <>
            {/* Outer glow stroke */}
            <Polyline
              positions={polylinePoints}
              pathOptions={{
                color: '#BE123C',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Core dashed line */}
            <Polyline
              positions={polylinePoints}
              pathOptions={{
                color: '#F43F5E',
                weight: 4,
                opacity: 0.95,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Map Control Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-xl">
        <button
          type="button"
          onClick={() => setTileMode(tileMode === 'dark' ? 'street' : 'dark')}
          className="px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
          title="Toggle Map Style"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>{tileMode === 'dark' ? 'Street View' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Map Legend (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-xl text-[11px] shadow-xl text-slate-200 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Patient Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>En Route Ambulance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Destination Hospital</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-rose-500"></span>
          <span>Emergency Route</span>
        </div>
      </div>
    </div>
  );
}
