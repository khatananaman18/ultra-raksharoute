import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';
import {
  Hospital,
  Ambulance,
  Plus,
  RefreshCw,
  Activity,
  Bed,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ShieldCheck,
  MapPin,
  TrendingUp
} from 'lucide-react';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useNotification();

  const [hospital, setHospital] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);

  // Form states for updating capacity
  const [icuAvailable, setIcuAvailable] = useState(14);
  const [icuTotal, setIcuTotal] = useState(60);
  const [emergencyStatus, setEmergencyStatus] = useState('Open 24/7');
  const [oxygenStatus, setOxygenStatus] = useState('Normal (100% capacity)');
  const [bloodBankStatus, setBloodBankStatus] = useState('All Groups Available');

  // Add ambulance form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newCallSign, setNewCallSign] = useState('');
  const [newType, setNewType] = useState('ICU Ambulance');
  const [newDriverName, setNewDriverName] = useState('');

  const hospitalId = user?.hospitalId || 'hosp-aiims-01';

  useEffect(() => {
    loadHospitalData();
  }, [hospitalId]);

  const loadHospitalData = async () => {
    try {
      const [hospRes, ambRes, bkRes] = await Promise.all([
        api.getHospital(hospitalId),
        api.getAmbulances({ hospitalId }),
        api.getBookings({ hospitalId }),
      ]);

      if (hospRes.success && hospRes.data) {
        setHospital(hospRes.data);
        setIcuAvailable(hospRes.data.icuAvailableBeds || 14);
        setIcuTotal(hospRes.data.icuTotalBeds || 60);
        setEmergencyStatus(hospRes.data.emergencyDepartmentStatus || 'Open 24/7');
        setOxygenStatus(hospRes.data.oxygenSupplyStatus || 'Normal');
        setBloodBankStatus(hospRes.data.bloodBankStatus || 'Available');
      }

      if (ambRes.success) {
        setAmbulances(ambRes.data);
      }

      if (bkRes.success) {
        setActiveRequests(bkRes.data.filter((b) => !['COMPLETED', 'CANCELLED'].includes(b.status)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleCapacityUpdate = (updated) => {
      if (updated.id === hospitalId) {
        setHospital(updated);
      }
    };

    const handleLocationUpdate = ({ ambulanceId, lat, lng }) => {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === ambulanceId ? { ...a, currentLocation: { lat, lng } } : a))
      );
    };

    const handleBookingUpdate = (booking) => {
      if (booking.hospitalId === hospitalId) {
        loadHospitalData();
      }
    };

    socket.on('hospital:capacity:update', handleCapacityUpdate);
    socket.on('driver:location:update', handleLocationUpdate);
    socket.on('booking:updated', handleBookingUpdate);

    return () => {
      socket.off('hospital:capacity:update', handleCapacityUpdate);
      socket.off('driver:location:update', handleLocationUpdate);
      socket.off('booking:updated', handleBookingUpdate);
    };
  }, [socket, hospitalId]);

  // Update Hospital Emergency Capacity
  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    setIsUpdatingCapacity(true);
    try {
      const res = await api.updateHospitalCapacity(hospitalId, {
        icuAvailableBeds: icuAvailable,
        icuTotalBeds: icuTotal,
        emergencyDepartmentStatus: emergencyStatus,
        oxygenSupplyStatus: oxygenStatus,
        bloodBankStatus,
      });

      if (res.success) {
        setHospital(res.data);
        addToast({
          title: 'Hospital Capacity Updated',
          message: 'Changes broadcast to all emergency dispatch routers.',
          type: 'success',
        });
      }
    } catch (err) {
      addToast({ title: 'Update Error', message: err.message, type: 'emergency' });
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  // Add Ambulance
  const handleAddAmbulance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addAmbulance({
        vehicleNumber: newVehicleNumber,
        callSign: newCallSign || `Unit-${newVehicleNumber.slice(-4)}`,
        type: newType,
        category: newType.includes('ICU') ? 'ICU' : newType.includes('ALS') ? 'ALS' : 'BLS',
        isICU: newType.includes('ICU'),
        hospitalId,
        providerName: hospital?.name || 'Hospital Fleet',
        driverName: newDriverName || 'Paramedic Driver',
        lat: hospital?.location?.lat || 28.5672,
        lng: hospital?.location?.lng || 77.2100,
      });

      if (res.success) {
        setShowAddModal(false);
        setNewVehicleNumber('');
        setNewCallSign('');
        loadHospitalData();
        addToast({ title: 'Ambulance Added', message: 'Vehicle added to active dispatch fleet.', type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'emergency' });
    }
  };

  // Fleet counts
  const availableCount = ambulances.filter((a) => a.availability === 'AVAILABLE').length;
  const busyCount = ambulances.filter((a) => a.availability === 'BUSY').length;
  const offlineCount = ambulances.filter((a) => a.availability === 'OFFLINE').length;

  return (
    <div className="space-y-8">
      {/* HEADER WITH ORGANIZATION INFO & RECENT TIMESTAMP */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Hospital className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{hospital?.name || 'AIIMS New Delhi Apex Trauma'}</h2>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                {hospital?.emergencyDepartmentStatus || 'Open 24/7'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trauma Dispatch Hub • {hospital?.address || 'Ansari Nagar, New Delhi'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Last Capacity Broadcast</p>
            <p className="text-xs font-bold text-slate-200">
              {hospital?.lastUpdated ? new Date(hospital.lastUpdated).toLocaleTimeString() : 'Just now'}
            </p>
          </div>
          <button
            onClick={loadHospitalData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Total Ambulances</p>
          <p className="text-2xl font-black text-white">{ambulances.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Available Fleets</p>
          <p className="text-2xl font-black text-emerald-400">{availableCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Dispatched / Busy</p>
          <p className="text-2xl font-black text-rose-400">{busyCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Maintenance/Off</p>
          <p className="text-2xl font-black text-slate-400">{offlineCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Available ICU Beds</p>
          <p className="text-2xl font-black text-sky-400">
            {hospital?.icuAvailableBeds} <span className="text-xs text-slate-500 font-normal">/ {hospital?.icuTotalBeds}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400">Active Inbound</p>
          <p className="text-2xl font-black text-amber-400">{activeRequests.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Capacity Management Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-400" />
                <span>Update Live Emergency Capacity</span>
              </h3>
              <span className="text-[10px] text-slate-400">Publicly visible</span>
            </div>

            <form onSubmit={handleSaveCapacity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Emergency Department Status
                </label>
                <select
                  value={emergencyStatus}
                  onChange={(e) => setEmergencyStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Open 24/7">🟢 Open 24/7 (Full Intake)</option>
                  <option value="Diverting Non-Critical">🟡 Diverting Non-Critical Cases</option>
                  <option value="Trauma Critical Only">🔴 Trauma Critical Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Available ICU Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={icuAvailable}
                    onChange={(e) => setIcuAvailable(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total ICU Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={icuTotal}
                    onChange={(e) => setIcuTotal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Oxygen Bank Status</label>
                <input
                  type="text"
                  value={oxygenStatus}
                  onChange={(e) => setOxygenStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Blood Bank Status</label>
                <input
                  type="text"
                  value={bloodBankStatus}
                  onChange={(e) => setBloodBankStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingCapacity}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Broadcast Live Capacity Update</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Fleet Management & Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Fleet Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Stationed Ambulance Locations</span>
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fleet Ambulance</span>
              </button>
            </div>

            <div className="h-64 w-full rounded-2xl overflow-hidden">
              <LiveEmergencyMap
                patientLocation={hospital?.location || { lat: 28.5672, lng: 77.2100 }}
                ambulances={ambulances}
                hospitals={hospital ? [hospital] : []}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Fleet Ambulances List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Registered Ambulances</h3>
            <div className="space-y-2 text-xs">
              {ambulances.map((amb) => (
                <div
                  key={amb.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{amb.callSign || amb.vehicleNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        amb.isICU ? 'bg-rose-950 text-rose-300' : 'bg-sky-950 text-sky-300'
                      }`}>
                        {amb.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Driver: {amb.driverName} ({amb.driverPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                      amb.availability === 'AVAILABLE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : amb.availability === 'BUSY'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {amb.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD AMBULANCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Register Ambulance to Fleet</h3>

            <form onSubmit={handleAddAmbulance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Registration Vehicle Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DL-01-EA-9988"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Radio Call Sign</label>
                <input
                  type="text"
                  placeholder="e.g., TraumaRescue Charlie-2"
                  value={newCallSign}
                  onChange={(e) => setNewCallSign(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ambulance Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ICU Ambulance">ICU Ambulance (Ventilator)</option>
                  <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                  <option value="Basic Ambulance (BLS)">Basic Ambulance (BLS)</option>
                  <option value="Neonatal Ambulance (NICU)">Neonatal Ambulance (NICU)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Paramedic Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sandeep Rawat"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Ambulance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
