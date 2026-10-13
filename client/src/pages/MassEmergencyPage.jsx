import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import {
  Layers,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';

export default function MassEmergencyPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [incidentName, setIncidentName] = useState('Major Collision & Structural Collapse');
  const [incidentLocation, setIncidentLocation] = useState('Ring Road Flyover, South Extension, New Delhi');
  const [totalRequested, setTotalRequested] = useState(5);
  const [icuRequested, setIcuRequested] = useState(2);
  const [blsRequested, setBlsRequested] = useState(3);
  const [isDeploying, setIsDeploying] = useState(false);
  const [massResult, setMassResult] = useState(null);

  const handleTriggerMassEmergency = async (e) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      const res = await api.triggerMassEmergency({
        incidentName,
        pickupLat: 28.5672,
        pickupLng: 77.2100,
        pickupAddress: incidentLocation,
        totalRequested: Number(totalRequested),
        icuRequested: Number(icuRequested),
        blsRequested: Number(blsRequested),
        notes: `Mass casualty protocol activated by ${user?.name || 'Emergency Incident Commander'}`,
      });

      if (res.success) {
        setMassResult(res);
        addToast({
          title: '🚨 MASS EMERGENCY PROTOCOL ACTIVATED',
          message: `${res.confirmedCount} ambulances locked & dispatched simultaneously.`,
          type: 'emergency',
        });
      }
    } catch (err) {
      addToast({ title: 'Deployment Error', message: err.message, type: 'emergency' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-950/80">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                INCIDENT COMMAND PROTOCOL
              </span>
              <span className="text-xs text-slate-400">• Multi-Casualty Incident (MCI)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Mass Emergency / Multi-Ambulance Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Simultaneous multi-fleet aggregation for earthquakes, major transportation crashes, and large public emergencies.
            </p>
          </div>
        </div>
      </div>

      {/* DISPATCH CONFIGURATION & LIVE FULFILLMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Request Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Mass Emergency Parameters</span>
            </h3>

            <form onSubmit={handleTriggerMassEmergency} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Incident Name / Type</label>
                <input
                  type="text"
                  required
                  value={incidentName}
                  onChange={(e) => setIncidentName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Incident Ground Zero Address</label>
                <input
                  type="text"
                  required
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ICU Critical Units (Ventilator)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={icuRequested}
                    onChange={(e) => setIcuRequested(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    BLS / Standard Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={blsRequested}
                    onChange={(e) => setBlsRequested(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>Total Ambulances Requested:</span>
                <span className="font-extrabold text-white text-sm">
                  {Number(icuRequested) + Number(blsRequested)} Units
                </span>
              </div>

              <button
                type="submit"
                disabled={isDeploying}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs py-3.5 rounded-xl shadow-xl shadow-rose-950/60 transition flex items-center justify-center gap-2"
              >
                <span>🚨 DISPATCH MULTIPLE AMBULANCES NOW</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Fulfillment Progress & Active Units (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {massResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    DISASTER CONSOLE ACTIVE
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{massResult.incidentName}</h3>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400">Requested</span>
                    <p className="text-xl font-black text-white">{massResult.totalRequested}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400">Confirmed</span>
                    <p className="text-xl font-black text-emerald-400">{massResult.confirmedCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400">Searching</span>
                    <p className="text-xl font-black text-amber-400">{massResult.searchingCount}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">
                    Fulfillment Rate: {Math.round((massResult.confirmedCount / massResult.totalRequested) * 100)}%
                  </span>
                  <span className="text-slate-400">
                    {massResult.confirmedCount} of {massResult.totalRequested} Dispatched
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(massResult.confirmedCount / massResult.totalRequested) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dispatched Units Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Simultaneously Dispatched Units:
                </h4>
                <div className="space-y-2 text-xs">
                  {massResult.bookings?.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">{b.callSign} ({b.vehicleNumber})</p>
                          <p className="text-[11px] text-slate-400">{b.ambulanceType} • Pilot: {b.driverName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">● DISPATCHED</span>
                        <span className="block text-[10px] text-slate-400">ETA ~ 5 min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs space-y-3">
              <Layers className="w-12 h-12 mx-auto text-slate-600" />
              <p className="font-bold text-white text-sm">No Active Mass Emergency Declared</p>
              <p>Configure incident requirements on the left to aggregate multiple ambulances across partner hospital and private networks simultaneously.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
