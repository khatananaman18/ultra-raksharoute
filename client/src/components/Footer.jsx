import React from 'react';
import { ShieldCheck, AlertTriangle, Phone, Heart, Ambulance } from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../services/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-16">
      {/* Mandatory Statutory Disclaimer & Compliance Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-300">
            <p className="font-bold text-amber-400 text-xs uppercase tracking-wide">
              Official Medical Logistics Aggregation Disclaimer
            </p>
            <p className="mt-0.5">
              <strong className="text-white">RakshaRoute</strong> operates strictly as an intelligent emergency routing and ambulance aggregation platform. RakshaRoute does not directly own ambulances or provide in-transit medical procedures. Fleet availability, in-ambulance critical care equipment, and medical personnel are operated by verified hospital networks, emergency medical service fleets, and private licensed providers.
              For extreme life-threatening trauma, always coordinate with India's central helpline <strong className="text-rose-400 underline">112 / 108</strong> immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
                <Ambulance className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">RakshaRoute</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When every second matters, RakshaRoute helps you find the right ambulance faster. Eliminating the manual calls, delays, and uncertainty during critical medical emergencies.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Emergency Dispatch Hub • India</span>
            </div>
          </div>

          {/* Quick Helplines */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              National Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              {EMERGENCY_NUMBERS.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">{item.name}</span>
                  <a
                    href={`tel:${item.number}`}
                    className="font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{item.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Ambulance Types */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Fleet Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>• Mobile ICU / Critical Care (Ventilator)</li>
              <li>• Advanced Life Support (ALS Cardiac)</li>
              <li>• Basic Life Support (BLS Oxygen)</li>
              <li>• Neonatal Critical Care (NICU)</li>
              <li>• Non-Emergency Patient Transit (PTS)</li>
              <li>• Disaster Mass Emergency Multi-Unit</li>
            </ul>
          </div>

          {/* Regional Hubs */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Supported Regional Hubs
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Actively connected with trauma networks across major metropolitan areas:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Delhi NCR', 'Mumbai Metro', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'].map((city) => (
                <span key={city} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RakshaRoute Technologies. Built with medical urgency and precision.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">ISO 27001 Secure Data Encryption</span>
            <span>•</span>
            <span className="text-slate-400">HIPAA Compliant Data Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
