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
  KeyRound,
  ShieldAlert,
  Building2,
  FileBadge
} from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const { switchPersona, login, register } = useAuth();
  const { addToast } = useNotification();

  // Role selection: 'patient' | 'driver' | 'hospital'
  const [selectedRole, setSelectedRole] = useState('patient');
  const [authTab, setAuthTab] = useState('fast'); // 'fast' | 'credentials' | 'register' | 'otp'

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [organizationName, setOrganizationName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['7', '4', '2', '9']);
  const [isLoading, setIsLoading] = useState(false);

  // Role Metadata
  const roleConfig = {
    patient: {
      title: 'Sign In as Patient',
      subtitle: 'Request emergency ambulances, tell pickup location manually, and track live dispatches.',
      icon: User,
      color: 'rose',
      demoUser: {
        name: 'Rahul Sharma',
        email: 'rahul@raksharoute.in',
        phone: '+91 98765 43210',
        badge: 'Individual Patient Account',
      },
      buttonText: '⚡ Fast Sign In as Patient (Rahul Sharma)',
    },
    driver: {
      title: 'Sign In as Ambulance Driver',
      subtitle: 'Accept nearby priority emergency requests, navigate to patient, and transmit live GPS.',
      icon: Ambulance,
      color: 'amber',
      demoUser: {
        name: 'Rajesh Kumar',
        email: 'rajesh.driver@raksharoute.in',
        phone: '+91 98112 23344',
        badge: 'Certified ICU Ambulance Pilot (DL-01-EA-4421)',
      },
      buttonText: '⚡ Fast Sign In as Driver (Rajesh Kumar)',
    },
    hospital: {
      title: 'Sign In as Hospital / Provider',
      subtitle: 'Broadcast real-time ICU bed capacity, emergency department status, and manage trauma fleets.',
      icon: Hospital,
      color: 'emerald',
      demoUser: {
        name: 'Dr. Priya Nair',
        email: 'priya@aiims.edu',
        phone: '+91 98991 12233',
        badge: 'AIIMS New Delhi Apex Trauma Desk',
      },
      buttonText: '⚡ Fast Sign In as Hospital (AIIMS Dr. Priya)',
    },
  };

  const currentRoleConfig = roleConfig[selectedRole];

  // 1-Click Fast Sign-In
  const handleFastSignIn = async (role) => {
    setIsLoading(true);
    try {
      const user = await switchPersona(role);
      addToast({
        title: `Welcome, ${user.name}!`,
        message: `Successfully signed in as ${role.toUpperCase()}.`,
        type: 'success',
      });
      if (onAuthSuccess) onAuthSuccess(role);
    } catch (err) {
      addToast({ title: 'Sign In Error', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  // Credentials Login
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email || currentRoleConfig.demoUser.email, selectedRole);
      addToast({
        title: 'Sign In Successful',
        message: `Welcome back, ${user.name}!`,
        type: 'success',
      });
      if (onAuthSuccess) onAuthSuccess(user.role);
    } catch (err) {
      addToast({ title: 'Authentication Failed', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  // Register New Account
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register({
        name,
        email,
        phone,
        role: selectedRole,
        organizationName: selectedRole === 'hospital' ? organizationName : null,
        licenseNumber: selectedRole === 'driver' ? licenseNumber : null,
      });
      addToast({
        title: 'Account Created',
        message: `Welcome to RakshaRoute, ${user.name}!`,
        type: 'success',
      });
      if (onAuthSuccess) onAuthSuccess(user.role);
    } catch (err) {
      addToast({ title: 'Registration Failed', message: err.message, type: 'emergency' });
    } finally {
      setIsLoading(false);
    }
  };

  // Phone OTP Login
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    addToast({ title: 'OTP Verified', message: 'Phone authentication approved.', type: 'success' });
    handleFastSignIn(selectedRole);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/15 border border-rose-500/30 text-rose-300 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Emergency Dispatch Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sign In to RakshaRoute
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select your role to access emergency dispatch tools, live telemetry, and capacity controls.
          </p>
        </div>

        {/* 3 ROLE SELECTION TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'patient',
              title: 'Sign In as Patient',
              badge: 'User / Family',
              icon: User,
              desc: 'Book SOS, tell manual location & track',
            },
            {
              id: 'driver',
              title: 'Sign In as Driver',
              badge: 'Ambulance Pilot',
              icon: Ambulance,
              desc: 'Accept requests & navigate to scene',
            },
            {
              id: 'hospital',
              title: 'Sign In as Hospital',
              badge: 'Healthcare Fleet',
              icon: Hospital,
              desc: 'Update ICU capacity & manage fleet',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedRole === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? tab.id === 'patient'
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/60'
                      : tab.id === 'driver'
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/60'
                      : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/60'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? tab.id === 'patient'
                          ? 'bg-rose-600 text-white'
                          : tab.id === 'driver'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                        : 'bg-slate-700/60 text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{tab.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white capitalize">{currentRoleConfig.title}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {currentRoleConfig.demoUser.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{currentRoleConfig.subtitle}</p>
          </div>
        </div>

        {/* Auth Sub-mode Tabs: Fast Demo / Email & Password / Phone OTP / Register */}
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-950 p-1 text-xs">
            <button
              type="button"
              onClick={() => setAuthTab('fast')}
              className={`flex-1 py-2 font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                authTab === 'fast'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Fast Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('credentials')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                authTab === 'credentials'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('otp')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                authTab === 'otp'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 font-bold rounded-lg transition ${
                authTab === 'register'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* TAB 1: 1-Click Fast Sign In (Instant Access) */}
          {authTab === 'fast' && (
            <div className="space-y-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                <p className="font-bold text-slate-200">Default Verified Persona Credentials:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="block text-slate-500">Name:</span>
                    <strong className="text-white">{currentRoleConfig.demoUser.name}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Email:</span>
                    <strong className="text-white">{currentRoleConfig.demoUser.email}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Phone:</span>
                    <strong className="text-white">{currentRoleConfig.demoUser.phone}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-500">Verified Role:</span>
                    <strong className="text-emerald-400 capitalize">{selectedRole}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFastSignIn(selectedRole)}
                disabled={isLoading}
                className={`w-full font-black text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition transform hover:scale-[1.01] active:scale-[0.99] text-white ${
                  selectedRole === 'patient'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-950/60'
                    : selectedRole === 'driver'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-950/60'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-950/60'
                }`}
              >
                <span>{currentRoleConfig.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 2: Standard Email & Password */}
          {authTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {selectedRole === 'hospital'
                    ? 'Hospital Admin Email'
                    : selectedRole === 'driver'
                    ? 'Driver Registered Email'
                    : 'Patient Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={currentRoleConfig.demoUser.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthTab('otp')}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
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
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition"
              >
                Sign In as {selectedRole.toUpperCase()}
              </button>
            </form>
          )}

          {/* TAB 3: Phone OTP Verification */}
          {authTab === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mobile Number (India)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">4-Digit Security OTP</label>
                <div className="flex gap-2.5">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      defaultValue={otpCode[idx]}
                      className="w-full text-center bg-slate-800 border border-slate-700 rounded-xl py-3 text-lg font-black text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Demo SMS code: 7-4-2-9</p>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3.5 rounded-xl transition"
              >
                Verify Phone & Sign In as {selectedRole.toUpperCase()}
              </button>
            </form>
          )}

          {/* TAB 4: Register New Account */}
          {authTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Dr. Priya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {selectedRole === 'hospital' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hospital / Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Max Super Speciality Hospital"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {selectedRole === 'driver' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Commercial Driver License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-042021008899"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition"
              >
                Create {selectedRole.toUpperCase()} Account & Launch
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
