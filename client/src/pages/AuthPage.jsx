import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  User,
  Ambulance,
  Hospital,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const { switchPersona, login, register } = useAuth();
  const { addToast } = useNotification();

  const [selectedRole, setSelectedRole] = useState('patient'); // patient, driver, hospital, admin
  const [authMode, setAuthMode] = useState('demo'); // demo, login, register, otp
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // 1-Click Demo Login
  const handleDemoPersonaLogin = async (role) => {
    setIsLoading(true);
    try {
      const user = await switchPersona(role);
      addToast({
        title: `Welcome, ${user.name}!`,
        message: `Authenticated as ${role.toUpperCase()} persona.`,
        type: 'success',
      });
      if (onAuthSuccess) onAuthSuccess(role);
    } catch (err) {
      addToast({ title: 'Auth Error', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email || 'rahul@raksharoute.in', selectedRole);
      addToast({ title: 'Login Successful', message: `Welcome back, ${user.name}!`, type: 'success' });
      if (onAuthSuccess) onAuthSuccess(user.role);
    } catch (err) {
      addToast({ title: 'Authentication Failed', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register({
        name,
        email,
        phone,
        role: selectedRole,
      });
      addToast({ title: 'Registration Complete', message: 'Account created successfully!', type: 'success' });
      if (onAuthSuccess) onAuthSuccess(user.role);
    } catch (err) {
      addToast({ title: 'Registration Failed', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    addToast({ title: 'OTP Verified', message: 'Mobile number confirmed.', type: 'success' });
    handleDemoPersonaLogin(selectedRole);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to RakshaRoute
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            India's unified emergency ambulance dispatch network
          </p>
        </div>

        {/* Step 1: Select User Role */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'patient', label: 'Patient / User', icon: User },
              { id: 'driver', label: 'Ambulance Driver', icon: Ambulance },
              { id: 'hospital', label: 'Hospital Fleet', icon: Hospital },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('demo')}
            className={`flex-1 py-2 font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              authMode === 'demo' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Persona</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 font-bold rounded-lg transition ${
              authMode === 'login' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-2 font-bold rounded-lg transition ${
              authMode === 'otp' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* 1-Click Instant Demo Persona (Ideal for fast evaluation) */}
        {authMode === 'demo' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-rose-300 mb-1">Instant Hackathon Persona Access:</p>
              <p className="text-[11px] text-slate-400">
                Skip typing credentials and jump straight into the full role experience.
              </p>
            </div>

            <button
              onClick={() => handleDemoPersonaLogin(selectedRole)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-sm py-3.5 rounded-xl shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <span>Launch {selectedRole.toUpperCase()} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Standard Email/Password Login */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={
                    selectedRole === 'patient'
                      ? 'rahul@raksharoute.in'
                      : selectedRole === 'driver'
                      ? 'rajesh.driver@raksharoute.in'
                      : 'priya@aiims.edu'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition"
            >
              Sign In as {selectedRole}
            </button>
          </form>
        )}

        {/* Simulated Phone OTP Flow */}
        {authMode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone (India)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  defaultValue="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">4-Digit OTP Code</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    defaultValue={idx === 0 ? '7' : idx === 1 ? '4' : idx === 2 ? '2' : '9'}
                    className="w-full text-center bg-slate-800 border border-slate-700 rounded-xl py-2.5 text-base font-bold text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Demo SMS code: 7429 (auto-filled)</p>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl transition"
            >
              Verify OTP & Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
