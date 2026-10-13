import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';
import {
  Activity,
  Ambulance,
  Hospital,
  Users,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Play,
  CheckCircle2,
  MapPin,
  Star
} from 'lucide-react';

export default function AdminDashboard({ onTriggerSos }) {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [analytics, setAnalytics] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, ambRes, hospRes, bkRes] = await Promise.all([
        api.getAnalytics(),
        api.getAmbulances(),
        api.getHospitals(),
        api.getBookings(),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (ambRes.success) setAmbulances(ambRes.data);
      if (hospRes.success) setHospitals(hospRes.data);
      if (bkRes.success) setBookings(bkRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemoData = async () => {
    try {
      await api.resetDemo();
      addToast({
        title: 'Platform Reset',
        message: 'All ambulance coordinates, capacities and test trips restored.',
        type: 'success',
      });
      loadAllAdminData();
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'emergency' });
    }
  };

  const handleTriggerSimulatedEmergency = async () => {
    try {
      const res = await api.triggerSos({
        pickupLat: 28.5245,
        pickupLng: 77.2066,
        pickupAddress: 'Saket District Centre, South Delhi',
        patientName: 'Pooja Kashyap (Simulated)',
        patientPhone: '+91 98111 22334',
        requiredType: 'ICU Ambulance',
        conditionCategory: 'Critical Cardiac Triage',
      });
      if (res.success) {
        addToast({
          title: '🚨 Test Emergency Generated',
          message: 'Simulated SOS dispatched. Ambulance moving along route.',
          type: 'emergency',
        });
        loadAllAdminData();
      }
    } catch (e) {
      addToast({ title: 'Simulation Error', message: e.message, type: 'emergency' });
    }
  };

  return (
    <div className="space-y-8">
      {/* COMMAND CONTROL TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              National Dispatch Control Room
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">RakshaRoute Central Command</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry, fleet utilization, and trauma hospital readiness across India
          </p>
        </div>

        {/* Demo Simulation Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSimulatedEmergency}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Emergency SOS</span>
          </button>

          <button
            onClick={handleResetDemoData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Emergencies</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-500">
            {analytics?.emergencies?.active || 0}
          </p>
          <p className="text-[11px] text-slate-400">En route or on-scene</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fleet Utilization</span>
            <Ambulance className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-400">
            {analytics?.fleet?.utilizationRate || 28}%
          </p>
          <p className="text-[11px] text-slate-400">
            {analytics?.fleet?.busy || 2} of {analytics?.fleet?.total || 7} units active
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-sky-400">
            {analytics?.emergencies?.avgResponseTimeMinutes || 7.2}m
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold">↓ 3.8m faster than manual calls</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Network ICU Beds</span>
            <Hospital className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {analytics?.hospitals?.availableIcuBeds || 82}
          </p>
          <p className="text-[11px] text-slate-400">
            Across {analytics?.hospitals?.totalPartnerHospitals || 7} Partner Centers
          </p>
        </div>
      </div>

      {/* MAP & CITY HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-white">
                Live National Fleet Telemetry Map
              </h3>
              <p className="text-xs text-slate-400">Real-time GPS coordinates of active ambulances and trauma centers</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              Region: Delhi NCR Grid
            </span>
          </div>

          <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-800">
            <LiveEmergencyMap
              patientLocation={{ lat: 28.5672, lng: 77.2100, address: 'Central Dispatch Hub' }}
              ambulances={ambulances}
              hospitals={hospitals}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Fleet Breakdown & Geographic Demand */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-white">Fleet Availability Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-emerald-400 font-bold">🟢 Available Standby</span>
                  <span className="font-bold text-white">{analytics?.fleet?.available || 5}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-rose-400 font-bold">🔴 Dispatched / Busy</span>
                  <span className="font-bold text-white">{analytics?.fleet?.busy || 2}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400 font-bold">⚫ Maintenance / Offline</span>
                  <span className="font-bold text-white">{analytics?.fleet?.offline || 0}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-white">Geographic Demand Hubs</h3>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 flex justify-between items-center">
                <span>South Delhi / AIIMS Corridor</span>
                <span className="font-bold text-rose-400">High Demand (42%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 flex justify-between items-center">
                <span>Gurugram NH-48 / Medanta</span>
                <span className="font-bold text-amber-400">Moderate (28%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 flex justify-between items-center">
                <span>Central Delhi / Connaught Place</span>
                <span className="font-bold text-sky-400">Normal (18%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 flex justify-between items-center">
                <span>Noida Expressway Hub</span>
                <span className="font-bold text-emerald-400">Stable (12%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT EMERGENCY LOGS & REVIEWS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-extrabold text-base text-white">Recent Incident Dispatch Feed</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-3">Trip ID</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Destination Hospital</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 font-mono text-slate-400">{b.id}</td>
                  <td className="py-3 font-bold text-white">{b.patientName}</td>
                  <td className="py-3">
                    <span className="font-semibold">{b.callSign || b.vehicleNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{b.ambulanceType}</span>
                  </td>
                  <td className="py-3 text-slate-300">{b.hospitalName}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : b.status === 'CANCELLED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-amber-400">
                    {b.rating ? `★ ${b.rating}.0` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
