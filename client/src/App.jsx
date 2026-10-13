import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EmergencyModal from './components/EmergencyModal';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DriverDashboard from './pages/DriverDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MassEmergencyPage from './pages/MassEmergencyPage';
import AuthPage from './pages/AuthPage';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';

export default function App() {
  const { user, role } = useAuth();
  const { socket } = useSocket();
  const [activePage, setActivePage] = useState('landing');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    // Preload hospitals for fast modal use
    api.getHospitals().then((res) => {
      if (res.success) setHospitals(res.data);
    }).catch(console.error);

    // Check for any currently active booking for the user
    api.getBookings().then((res) => {
      if (res.success) {
        const ongoing = res.data.find(
          (b) => !['COMPLETED', 'CANCELLED'].includes(b.status)
        );
        if (ongoing) {
          setActiveBooking(ongoing);
        }
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (updated) => {
      setActiveBooking((prev) => {
        if (prev && prev.id === updated.id) {
          if (['COMPLETED', 'CANCELLED'].includes(updated.status)) {
            return null;
          }
          return { ...prev, ...updated, currentLocation: updated.currentLocation || prev.currentLocation };
        }
        return prev;
      });
    };
    const handleReset = () => {
      setActiveBooking(null);
    };
    socket.on('booking:updated', handleUpdate);
    socket.on('demo:reset', handleReset);
    return () => {
      socket.off('booking:updated', handleUpdate);
      socket.off('demo:reset', handleReset);
    };
  }, [socket]);

  const handleBookingCreated = (newBooking) => {
    setActiveBooking(newBooking);
    setActivePage('patient'); // Immediately route to live tracking view
  };

  const handleAuthSuccess = (newRole) => {
    if (newRole === 'driver') setActivePage('driver');
    else if (newRole === 'hospital') setActivePage('hospital');
    else if (newRole === 'admin') setActivePage('admin');
    else setActivePage('patient');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-600 selection:text-white">
      {/* Top Navbar with 1-click persona switcher and lifeline */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'landing' && (
          <LandingPage
            onTriggerSos={() => setIsSosModalOpen(true)}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'patient' && (
          <PatientDashboard
            onOpenSosModal={() => setIsSosModalOpen(true)}
            activeBooking={activeBooking}
            setActiveBooking={setActiveBooking}
          />
        )}

        {activePage === 'driver' && <DriverDashboard />}

        {activePage === 'hospital' && <HospitalDashboard />}

        {activePage === 'mass' && <MassEmergencyPage />}

        {activePage === 'admin' && (
          <AdminDashboard onTriggerSos={() => setIsSosModalOpen(true)} />
        )}

        {activePage === 'auth' && (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        )}
      </main>

      {/* 1-Tap Emergency Modal */}
      <EmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onBookingCreated={handleBookingCreated}
        hospitals={hospitals}
      />

      {/* Footer with Statutory Medical Logistics Disclaimer */}
      <Footer />
    </div>
  );
}
