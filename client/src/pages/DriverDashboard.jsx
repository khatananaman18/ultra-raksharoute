import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';
import {
  Ambulance,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Navigation,
  Clock,
  Shield,
  Activity,
  Award,
  Radio,
  Volume2
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useNotification();

  const [driverStatus, setDriverStatus] = useState('AVAILABLE'); // AVAILABLE, BUSY, OFFLINE
  const [activeTrip, setActiveTrip] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [myAmbulance, setMyAmbulance] = useState(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [tripHistory, setTripHistory] = useState([]);

  // Load driver's assigned ambulance and active trip
  useEffect(() => {
    loadDriverData();
  }, [user]);

  const loadDriverData = async () => {
    try {
      const [ambRes, bkRes] = await Promise.all([
        api.getAmbulances(),
        api.getBookings({ driverId: user?.id || 'user-driver-01' }),
      ]);

      if (ambRes.success) {
        const found = ambRes.data.find(
          (a) => a.driverId === user?.id || a.id === user?.ambulanceId || a.id === 'amb-aiims-icu-01'
        );
        if (found) {
          setMyAmbulance(found);
          setDriverStatus(found.availability);
        }
      }

      if (bkRes.success) {
        setTripHistory(bkRes.data);
        const active = bkRes.data.find((b) => !['COMPLETED', 'CANCELLED'].includes(b.status));
        if (active) {
          setActiveTrip(active);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming emergency SOS alerts
    const handleEmergencyAlert = (booking) => {
      // If this ambulance is free, show incoming dispatch request modal
      if (driverStatus === 'AVAILABLE' && !activeTrip) {
        setIncomingRequest(booking);
        addToast({
          title: '🚨 NEW EMERGENCY REQUEST',
          message: `Patient ${booking.patientName} requires ${booking.ambulanceType}.`,
          type: 'emergency',
        });
      }
    };

    const handleBookingUpdate = (updated) => {
      if (activeTrip && activeTrip.id === updated.id) {
        setActiveTrip(updated);
      }
    };

    socket.on('emergency:sos:created', handleEmergencyAlert);
    socket.on('booking:updated', handleBookingUpdate);

    return () => {
      socket.off('emergency:sos:created', handleEmergencyAlert);
      socket.off('booking:updated', handleBookingUpdate);
    };
  }, [socket, driverStatus, activeTrip]);

  // Toggle availability (Available / Busy / Offline)
  const handleToggleStatus = async (newStatus) => {
    setDriverStatus(newStatus);
    if (myAmbulance) {
      try {
        await api.updateAmbulanceAvailability(myAmbulance.id, newStatus);
        addToast({
          title: `Status: ${newStatus}`,
          message: `Ambulance availability set to ${newStatus}.`,
          type: newStatus === 'AVAILABLE' ? 'success' : 'info',
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Accept incoming request
  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;
    try {
      const res = await api.updateBookingStatus(
        incomingRequest.id,
        'ASSIGNED',
        `Accepted by Pilot ${user?.name || 'Rajesh Kumar'}`
      );
      setActiveTrip(res.data);
      setIncomingRequest(null);
      setDriverStatus('BUSY');
      addToast({
        title: 'Emergency Accepted',
        message: 'Proceed to patient pickup location immediately.',
        type: 'success',
      });
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'emergency' });
    }
  };

  // Reject incoming request (returns to dispatch pool)
  const handleRejectRequest = () => {
    setIncomingRequest(null);
    addToast({
      title: 'Dispatch Declined',
      message: 'Request passed to next available nearest unit.',
      type: 'info',
    });
  };

  // Step-by-step trip status transition
  const handleStepStatus = async (nextStatus, note) => {
    if (!activeTrip) return;
    try {
      const res = await api.updateBookingStatus(activeTrip.id, nextStatus, note);
      setActiveTrip(res.data);

      if (nextStatus === 'COMPLETED') {
        setActiveTrip(null);
        setDriverStatus('AVAILABLE');
        loadDriverData();
        addToast({
          title: 'Trip Completed',
          message: 'Patient safely handed over. Ambulance back in available service.',
          type: 'success',
        });
      } else {
        addToast({ title: 'Status Updated', message: note, type: 'info' });
      }
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'emergency' });
    }
  };

  // Simulated GPS Telemetry toggle
  const toggleGpsBroadcast = () => {
    setGpsSimulating(!gpsSimulating);
    addToast({
      title: gpsSimulating ? 'GPS Broadcast Paused' : 'Live GPS Telemetry Active',
      message: gpsSimulating
        ? 'Stopped transmitting coordinates'
        : 'Transmitting high-frequency GPS to RakshaRoute network.',
      type: 'info',
    });
  };

  return (
    <div className="space-y-8">
      {/* DRIVER HEADER & STATUS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Ambulance className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name || 'Rajesh Kumar'}</h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {myAmbulance?.vehicleNumber || 'DL-01-EA-4421'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Unit: <strong className="text-white">{myAmbulance?.callSign || 'LifeRescue Alpha-1'}</strong> • {myAmbulance?.type || 'ICU Mobile Unit'}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => handleToggleStatus('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              driverStatus === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available</span>
          </button>

          <button
            onClick={() => handleToggleStatus('BUSY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              driverStatus === 'BUSY'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Busy</span>
          </button>

          <button
            onClick={() => handleToggleStatus('OFFLINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              driverStatus === 'OFFLINE'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span>Offline</span>
          </button>
        </div>
      </div>

      {/* INCOMING DISPATCH MODAL / ALERT */}
      {incomingRequest && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🚨</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  NEW EMERGENCY DISPATCH
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Emergency Patient Pickup Required
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-rose-300 font-bold">ETA ~ 6 min</span>
              <span className="block text-[11px] text-slate-400">2.2 km from your GPS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <div>
              <p className="text-slate-400">Patient</p>
              <p className="font-bold text-white text-sm">{incomingRequest.patientName}</p>
              <p className="text-slate-400 mt-0.5">Phone: {incomingRequest.patientPhone}</p>
            </div>
            <div>
              <p className="text-slate-400">Pickup Location</p>
              <p className="font-bold text-white truncate">{incomingRequest.pickupLocation?.address}</p>
              <p className="text-rose-400 mt-0.5">Type: {incomingRequest.ambulanceType}</p>
            </div>
            <div>
              <p className="text-slate-400">Destination Hospital</p>
              <p className="font-bold text-emerald-400">{incomingRequest.hospitalName}</p>
              <p className="text-slate-400 mt-0.5">{incomingRequest.conditionCategory}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleRejectRequest}
              className="px-6 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptRequest}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950 transition flex items-center gap-2"
            >
              <span>ACCEPT EMERGENCY DISPATCH</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE TRIP MANAGEMENT CONSOLE */}
      {activeTrip ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                ACTIVE TRIP IN PROGRESS
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Patient: {activeTrip.patientName}
              </h3>
              <p className="text-xs text-slate-400">
                Destination: <strong className="text-white">{activeTrip.hospitalName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleGpsBroadcast}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  gpsSimulating
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${gpsSimulating ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span>GPS Telemetry: {gpsSimulating ? 'Broadcasting' : 'Live'}</span>
              </button>

              <a
                href={`tel:${activeTrip.patientPhone}`}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center justify-center"
                title="Call Patient"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Active Navigation Map */}
          <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-800">
            <LiveEmergencyMap
              patientLocation={activeTrip.pickupLocation}
              activeAmbulance={{
                id: activeTrip.ambulanceId,
                callSign: myAmbulance?.callSign || activeTrip.callSign || 'LifeRescue Alpha-1',
                vehicleNumber: myAmbulance?.vehicleNumber || activeTrip.vehicleNumber,
                type: activeTrip.ambulanceType,
                isICU: activeTrip.ambulanceType?.includes('ICU'),
                driverName: user?.name || 'Rajesh Kumar',
                currentLocation: myAmbulance?.currentLocation || { lat: 28.5802, lng: 77.2155 },
                currentEtaMinutes: activeTrip.currentEtaMinutes,
              }}
              destinationHospital={{
                name: activeTrip.hospitalName || 'Destination Hospital',
                address: activeTrip.destinationHospitalLocation?.address,
                location: activeTrip.destinationHospitalLocation,
              }}
              className="h-full w-full"
            />
          </div>

          {/* Step-by-Step Status Action Buttons */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Update Emergency Trip Stage:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleStepStatus('EN_ROUTE_PICKUP', 'Pilot driving towards patient pickup')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  activeTrip.status === 'EN_ROUTE_PICKUP'
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1. En Route to Patient
              </button>

              <button
                onClick={() => handleStepStatus('ARRIVED_PICKUP', 'Ambulance arrived at patient scene')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  activeTrip.status === 'ARRIVED_PICKUP'
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2. Arrived at Scene
              </button>

              <button
                onClick={() => handleStepStatus('TRIP_STARTED', 'Patient onboard. En route to hospital.')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  activeTrip.status === 'TRIP_STARTED'
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3. Transporting to Hospital
              </button>

              <button
                onClick={() => handleStepStatus('COMPLETED', 'Patient safely handed over to ER.')}
                className="py-3 px-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition text-center shadow-lg"
              >
                4. Complete Trip ✓
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs space-y-2">
          <Ambulance className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-bold text-white text-sm">No Active Emergency Trip Assigned</p>
          <p>Ambulance is currently on standby in {driverStatus.toLowerCase()} status. When a patient triggers SOS nearby, dispatch alert will sound here.</p>
        </div>
      )}

      {/* DRIVER TRIP HISTORY & REVIEWS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-white">Recent Completed Emergency Trips</h3>
        <div className="space-y-2 text-xs">
          {tripHistory.slice(0, 4).map((trip) => (
            <div
              key={trip.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-white">{trip.patientName}</p>
                <p className="text-[11px] text-slate-400">{trip.hospitalName} • {trip.ambulanceType}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400">★ {trip.rating || 5}.0</span>
                <span className="block text-[10px] text-slate-500 capitalize">{trip.status.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
