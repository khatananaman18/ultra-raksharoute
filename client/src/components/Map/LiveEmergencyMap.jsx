import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Marker HTML Generators
const createPatientIcon = () =>
  L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="pulse-ring"></div>
        <div class="w-7 h-7 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xs shadow-rose-900/50">
          📍
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createAmbulanceIcon = (isAssigned = false, isICU = false) =>
  L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div class="flex items-center justify-center transform transition-transform duration-300 hover:scale-125">
        <div class="px-2 py-1 rounded-lg ${
          isAssigned
            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 animate-bounce'
            : isICU
            ? 'bg-rose-600 text-white ring-2 ring-rose-400/40'
            : 'bg-sky-600 text-white ring-2 ring-sky-400/40'
        } font-bold text-xs shadow-xl flex items-center gap-1">
          <span>🚑</span>
          <span class="text-[10px] tracking-tight">${isICU ? 'ICU' : 'EMS'}</span>
        </div>
      </div>
    `,
    iconSize: [44, 26],
    iconAnchor: [22, 13],
  });

const createHospitalIcon = () =>
  L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div class="flex items-center justify-center">
        <div class="w-8 h-8 bg-emerald-600 border-2 border-white rounded-xl shadow-lg flex items-center justify-center text-white text-sm font-extrabold shadow-emerald-950/60">
          🏥
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

// Auto-recenter component
function RecenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 1.2 });
    }
  }, [center, map]);
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
  const defaultCenter = [
    patientLocation?.lat || 28.5672,
    patientLocation?.lng || 77.2100,
  ];

  const mapCenter = activeAmbulance?.currentLocation
    ? [activeAmbulance.currentLocation.lat, activeAmbulance.currentLocation.lng]
    : defaultCenter;

  // Generate route polyline points if not explicitly passed
  let polylinePoints = [];
  if (routeCoordinates && routeCoordinates.length > 0) {
    polylinePoints = routeCoordinates.map(p => [p.lat, p.lng]);
  } else if (activeAmbulance && patientLocation) {
    polylinePoints = [
      [activeAmbulance.currentLocation.lat, activeAmbulance.currentLocation.lng],
      [patientLocation.lat, patientLocation.lng],
    ];
    if (destinationHospital?.location) {
      polylinePoints.push([destinationHospital.location.lat, destinationHospital.location.lng]);
    }
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Sleek Dark CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <RecenterController center={mapCenter} />

        {/* Patient Pickup Marker */}
        {patientLocation && (
          <Marker
            position={[patientLocation.lat, patientLocation.lng]}
            icon={createPatientIcon()}
          >
            <Popup className="emergency-popup">
              <div className="p-1 text-slate-900">
                <p className="font-bold text-xs text-rose-600 uppercase tracking-wide">Patient Pickup Location</p>
                <p className="text-xs font-medium mt-1">{patientLocation.address || 'Emergency Incident Site'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">GPS: {patientLocation.lat.toFixed(4)}, {patientLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ambulances */}
        {ambulances.map(amb => {
          const isAssigned = activeAmbulance?.id === amb.id;
          return (
            <Marker
              key={amb.id}
              position={[amb.currentLocation.lat, amb.currentLocation.lng]}
              icon={createAmbulanceIcon(isAssigned, amb.isICU)}
            >
              <Popup>
                <div className="p-1 text-slate-900 min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{amb.callSign || amb.vehicleNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      amb.isICU ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {amb.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{amb.providerName}</p>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Pilot: {amb.driverName}</span>
                    <span className="font-bold text-emerald-600">★ {amb.rating || 4.9}</span>
                  </div>
                  {amb.distanceKm !== undefined && (
                    <div className="mt-2 pt-1 border-t border-slate-200 text-xs flex justify-between font-semibold">
                      <span>{amb.distanceKm} km away</span>
                      <span className="text-rose-600">ETA {amb.etaMinutes}m</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hospitals */}
        {hospitals.map(hosp => (
          <Marker
            key={hosp.id}
            position={[hosp.location.lat, hosp.location.lng]}
            icon={createHospitalIcon()}
          >
            <Popup>
              <div className="p-1 text-slate-900 min-w-[200px]">
                <p className="font-bold text-xs text-emerald-700">{hosp.name}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{hosp.emergencyDepartmentStatus}</p>
                <div className="mt-2 text-xs flex justify-between bg-emerald-50 p-1.5 rounded">
                  <span>Available ICU Beds:</span>
                  <span className="font-bold text-emerald-800">{hosp.icuAvailableBeds} / {hosp.icuTotalBeds}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">📞 Helpline: {hosp.emergencyHelpline}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Polyline */}
        {polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{
              color: '#F43F5E',
              weight: 5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-xl text-[11px] shadow-xl text-slate-200 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Patient Incident Pin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>Available Ambulance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Partner Hospital</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-0.5 bg-rose-500"></span>
          <span>Real-time Route</span>
        </div>
      </div>
    </div>
  );
}
