import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  PhoneCall,
  ShieldAlert,
  Hospital,
  Activity,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  HeartPulse,
  Award,
  Layers,
  Sparkles,
  Phone
} from 'lucide-react';
import LiveEmergencyMap from '../components/Map/LiveEmergencyMap';
import { AMBULANCE_TYPES, EMERGENCY_NUMBERS } from '../services/constants';

export default function LandingPage({ onTriggerSos, setActivePage }) {
  // Mock interactive preview for hero map
  const [demoStep, setDemoStep] = useState(0);

  const previewPatientLoc = { lat: 28.5672, lng: 77.2100, address: 'Connaught Place / AIIMS Hub' };
  const previewAmbulances = [
    {
      id: 'amb-demo-1',
      callSign: 'LifeRescue Alpha-1',
      category: 'ICU',
      isICU: true,
      providerName: 'AIIMS Apex Trauma Center',
      driverName: 'Rajesh Kumar',
      currentLocation: {
        lat: 28.5750 + Math.sin(demoStep * 0.2) * 0.005,
        lng: 77.2130 + Math.cos(demoStep * 0.2) * 0.005,
      },
      distanceKm: 2.1,
      etaMinutes: 6,
    },
    {
      id: 'amb-demo-2',
      callSign: 'MaxRapid Echo-4',
      category: 'ALS',
      isICU: false,
      providerName: 'Max Healthcare',
      driverName: 'Amit Verma',
      currentLocation: { lat: 28.5400, lng: 77.2250 },
      distanceKm: 4.5,
      etaMinutes: 11,
    },
  ];

  const previewHospitals = [
    {
      id: 'h-1',
      name: 'AIIMS New Delhi (Apex Trauma)',
      location: { lat: 28.5672, lng: 77.2100 },
      emergencyDepartmentStatus: 'Open 24/7',
      icuAvailableBeds: 14,
      icuTotalBeds: 60,
      emergencyHelpline: '102',
    },
    {
      id: 'h-2',
      name: 'Max Super Speciality Saket',
      location: { lat: 28.5284, lng: 77.2119 },
      emergencyDepartmentStatus: 'Open 24/7',
      icuAvailableBeds: 9,
      icuTotalBeds: 38,
      emergencyHelpline: '011-40554055',
    },
  ];

  // Subtle live movement animation for preview map
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((s) => s + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-600/10 via-sky-600/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>India's First Intelligent Ambulance Aggregation Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Emergency Help, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-300">
                  One Tap Away.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                RakshaRoute intelligently connects you with the nearest suitable ambulance using real-time location, availability, ambulance type, and ETA. No more frantic manual calling during critical emergencies.
              </p>

              {/* CTA Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onTriggerSos}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-base px-8 py-4 rounded-2xl shadow-2xl shadow-rose-900/60 flex items-center justify-center gap-3 transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xl">🚨</span>
                  <span>EMERGENCY SOS</span>
                </button>

                <button
                  onClick={() => setActivePage('patient')}
                  className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition hover:text-white"
                >
                  <Ambulance className="w-4 h-4 text-sky-400" />
                  <span>Book an Ambulance</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-black text-white">4.2 min</div>
                  <p className="text-xs text-slate-400 mt-0.5">Avg Match Time</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <p className="text-xs text-slate-400 mt-0.5">Verified Fleets</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">24 / 7</div>
                  <p className="text-xs text-slate-400 mt-0.5">Trauma Readiness</p>
                </div>
              </div>
            </div>

            {/* Right Live Interactive Preview */}
            <div className="lg:col-span-5 relative">
              <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Live Telemetry Preview</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    Delhi NCR Active Grid
                  </span>
                </div>

                <div className="h-72 w-full rounded-2xl overflow-hidden relative">
                  <LiveEmergencyMap
                    patientLocation={previewPatientLoc}
                    ambulances={previewAmbulances}
                    hospitals={previewHospitals}
                    activeAmbulance={previewAmbulances[0]}
                    destinationHospital={previewHospitals[0]}
                    className="h-full w-full"
                  />
                </div>

                {/* Live Card Overlay */}
                <div className="mt-3 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">LifeRescue Alpha-1 (ICU)</p>
                      <p className="text-[11px] text-slate-400">AIIMS Apex Trauma • 2.1 km away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-400">ETA 6 min</span>
                    <span className="block text-[10px] text-emerald-400">● En Route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW RAKSHAROUTE WORKS (5 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Emergency Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How RakshaRoute Works
          </h2>
          <p className="text-slate-400 text-sm">
            Designed around a simple life-saving principle: minimum actions during an emergency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Send SOS',
              desc: 'Tap the prominent emergency button. No lengthy sign-up forms required during distress.',
              icon: ShieldAlert,
              color: 'from-rose-600 to-rose-700',
            },
            {
              step: '02',
              title: 'Share Location',
              desc: 'Precise GPS coordinate detection or instant Indian landmark selection.',
              icon: MapPin,
              color: 'from-sky-600 to-sky-700',
            },
            {
              step: '03',
              title: 'Match Best Unit',
              desc: 'Intelligent algorithm ranks units by medical suitability (ICU/ALS) and proximity.',
              icon: Zap,
              color: 'from-amber-600 to-amber-700',
            },
            {
              step: '04',
              title: 'Track It Live',
              desc: 'Watch the assigned ambulance move in real-time with accurate minute-by-minute ETA.',
              icon: Clock,
              color: 'from-emerald-600 to-emerald-700',
            },
            {
              step: '05',
              title: 'Reach Hospital',
              desc: 'Destination emergency department pre-notified with ICU capacity confirmed.',
              icon: Hospital,
              color: 'from-indigo-600 to-indigo-700',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-600 group-hover:text-slate-400 transition">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY RAKSHAROUTE (Traditional vs RakshaRoute) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why RakshaRoute Matters
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              During a cardiac event or major accident, every 60-second delay decreases survival odds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-rose-950/60 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                <span>❌ The Traditional Emergency Nightmare</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Calling 4-6 different hospital numbers while patient's condition deteriorates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Ambulance arrives only to reveal it lacks a ventilator or critical care paramedic.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Zero visibility into driver location, leading to panic and uncertainty.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Arriving at hospital only to discover ICU beds are 100% full.</span>
                </li>
              </ul>
            </div>

            {/* The RakshaRoute Way */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <span>✅ The RakshaRoute Intelligent Grid</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>1-Tap Unified Broadcast:</strong> Instantly discovers all nearby ambulances regardless of fleet owner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Medical Suitability Matching:</strong> ICU cases matched with verified ventilators, not just the closest van.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Real-time Telemetry:</strong> Live turn-by-turn map tracking with countdown ETA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Live Hospital Capacity:</strong> Direct status check on ICU beds & trauma readiness before dispatch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AMBULANCE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Specialized Emergency Fleets
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Every emergency has distinct clinical requirements. RakshaRoute categorizes and verifies fleet capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AMBULANCE_TYPES.map((type) => (
            <div
              key={type.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    type.isICU ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    {type.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{type.category}</span>
                </div>

                <h3 className="text-lg font-bold text-white mt-3">{type.name}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{type.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Recommended for:</span>
                <span className="italic">{type.recommendedFor}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNER HOSPITALS & FLEETS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Integrated Hospital & Fleet Network
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Connected with India's premier government and private medical institutions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'AIIMS New Delhi', tag: 'Apex Trauma' },
            { name: 'Safdarjung Hospital', tag: 'Govt Referral' },
            { name: 'Max Super Speciality', tag: 'Cardiac / Stroke' },
            { name: 'Apollo Hospitals', tag: 'Tertiary Care' },
            { name: 'Fortis Escorts', tag: 'Heart Institute' },
            { name: 'Medanta Medicity', tag: 'Polytrauma Hub' },
          ].map((h, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition"
            >
              <Hospital className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
              <p className="font-bold text-xs text-white">{h.name}</p>
              <p className="text-[10px] text-slate-400">{h.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'Does RakshaRoute own the ambulances?',
              a: 'No. RakshaRoute is a medical logistics aggregator. We integrate ambulances operated by government hospitals, private healthcare systems, emergency medical providers, and verified private partner fleets into a single, unified real-time dispatch grid.',
            },
            {
              q: 'How does the dynamic search radius work?',
              a: 'Our dispatch algorithm begins with a 5 km perimeter. If no suitable unit (e.g. ICU ambulance) is available, it dynamically expands to 10 km, 20 km, and 30 km+ until an appropriate medical response vehicle is locked.',
            },
            {
              q: 'What is Mass Emergency Mode?',
              a: 'For major accidents, natural disasters, or multi-casualty events, authorized emergency personnel can trigger Mass Emergency Mode to request multiple ambulances simultaneously (e.g., 2 ICU + 3 BLS units) with unified live tracking.',
            },
            {
              q: 'How does post-trip follow-up work?',
              a: 'Following hospital transfer, RakshaRoute automatically schedules condition check-ins (12 hours for basic cases, 24-48 hours for ICU cases) to ensure patient continuity of care.',
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-white">{faq.q}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-950 border border-rose-800/50 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Every Second Matters. Dispatch Help Now.
            </h2>
            <p className="text-xs sm:text-sm text-rose-200">
              Free emergency routing. Zero subscription barrier during medical crises.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onTriggerSos}
              className="bg-white hover:bg-rose-50 text-rose-950 font-black text-sm px-8 py-4 rounded-2xl shadow-xl flex items-center gap-2 transition"
            >
              <span>🚨 1-TAP EMERGENCY SOS</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
