import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import {
  Ambulance,
  PhoneCall,
  ShieldAlert,
  Hospital,
  Activity,
  Layers,
  RotateCcw,
  Menu,
  X,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, role, switchPersona } = useAuth();
  const { addToast } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await api.resetDemo();
      addToast({
        title: 'Demo Environment Reset',
        message: 'All ambulance coordinates and capacities reset to initial state.',
        type: 'success',
      });
      // reload after quick reset
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      addToast({ title: 'Reset Error', message: e.message, type: 'emergency' });
    } finally {
      setIsResetting(false);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Activity },
    { id: 'patient', label: 'Patient SOS', icon: ShieldAlert, highlight: true },
    { id: 'driver', label: 'Driver Dashboard', icon: Ambulance },
    { id: 'hospital', label: 'Hospital Provider', icon: Hospital },
    { id: 'mass', label: 'Mass Disaster SOS', icon: Layers },
    { id: 'admin', label: 'Command Admin', icon: Activity },
  ];

  const handlePersonaSelect = async (newRole) => {
    await switchPersona(newRole);
    setPersonaDropdownOpen(false);
    addToast({
      title: `Switched Persona: ${newRole.toUpperCase()}`,
      message: `Now viewing platform as ${newRole}.`,
      type: 'info',
    });
    // Auto navigate to the relevant dashboard
    if (newRole === 'driver') setActivePage('driver');
    else if (newRole === 'hospital') setActivePage('hospital');
    else if (newRole === 'admin') setActivePage('admin');
    else setActivePage('patient');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      {/* Top Emergency Ticker */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 border-b border-rose-900/30 px-4 py-1 text-xs text-rose-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-semibold tracking-wide">NATIONAL EMERGENCY LIFELINE:</span>
          <span className="font-bold text-white tracking-wider">Dial 112 / 108</span>
          <span className="hidden md:inline text-rose-400/80">• India's Unified Emergency Network Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-400 text-[11px]">Prototype Demonstration Hub: Delhi NCR</span>
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1 text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition"
            title="Reset simulated trips and restore initial seeds"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition transform">
              <Ambulance className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white">Raksha</span>
                <span className="font-black text-xl tracking-tight text-rose-500">Route</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                Emergency Ambulance Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    item.highlight
                      ? isActive
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                        : 'bg-rose-600/15 text-rose-400 border border-rose-500/30 hover:bg-rose-600/25'
                      : isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Role Persona Switcher & Fast Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-400">Role:</span>
                <span className="font-bold text-white capitalize">{user?.role || role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Quick Persona Switch
                  </p>
                  <button
                    onClick={() => handlePersonaSelect('patient')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between ${
                      role === 'patient' ? 'bg-rose-600/20 text-rose-300 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>👤 Rahul Sharma (Patient)</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">User</span>
                  </button>
                  <button
                    onClick={() => handlePersonaSelect('driver')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between mt-1 ${
                      role === 'driver' ? 'bg-amber-600/20 text-amber-300 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>🚑 Rajesh Kumar (Driver)</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">ICU Pilot</span>
                  </button>
                  <button
                    onClick={() => handlePersonaSelect('hospital')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between mt-1 ${
                      role === 'hospital' ? 'bg-emerald-600/20 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>🏥 Dr. Priya Nair (AIIMS)</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Hospital</span>
                  </button>
                  <button
                    onClick={() => handlePersonaSelect('admin')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between mt-1 ${
                      role === 'admin' ? 'bg-sky-600/20 text-sky-300 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>⚡ Central Command Admin</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Admin</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActivePage('patient')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-900/40 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS DISPATCH</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setActivePage('patient')}
              className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <span>🚨 SOS</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  activePage === item.id
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500 font-semibold mb-2">Switch Active Role:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { handlePersonaSelect('patient'); setMobileMenuOpen(false); }}
                className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-left"
              >
                👤 Patient (User)
              </button>
              <button
                onClick={() => { handlePersonaSelect('driver'); setMobileMenuOpen(false); }}
                className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-left"
              >
                🚑 Driver (Rajesh)
              </button>
              <button
                onClick={() => { handlePersonaSelect('hospital'); setMobileMenuOpen(false); }}
                className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-left"
              >
                🏥 Hospital (AIIMS)
              </button>
              <button
                onClick={() => { handlePersonaSelect('admin'); setMobileMenuOpen(false); }}
                className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-left"
              >
                ⚡ Command Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
