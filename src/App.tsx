import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BookingsView } from './views/BookingsView';
import { CalendarView } from './views/CalendarView';
import { PatientsView } from './views/PatientsView';
import { SetupGuideView } from './views/SetupGuideView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';

import { NewBookingModal } from './components/NewBookingModal';
import { BookingDetailModal } from './components/BookingDetailModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { WebhookTesterModal } from './components/WebhookTesterModal';
import type { Booking } from './lib/crm-store';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('crm_username') ? 'dashboard' : 'login';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('crm_username');
  });

  // Modals
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isWebhookTesterOpen, setIsWebhookTesterOpen] = useState(false);

  // Auto pre-fill for new booking from patient profile
  const [prefillPatient, setPrefillPatient] = useState<{
    name: string;
    phone: string;
    email?: string;
  } | null>(null);

  const handleBookForPatient = (name: string, phone: string, email?: string) => {
    setPrefillPatient({ name, phone, email });
    setIsNewBookingOpen(true);
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('crm_session_id');
      if (sessionId) {
        await fetch('/api/auth/logout', { 
          method: 'POST', 
          headers: {'Content-Type': 'application/json'}, 
          body: JSON.stringify({ sessionId }) 
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('crm_session_id');
      localStorage.removeItem('crm_username');
      setUserEmail(null);
      setActiveTab('login');
    }
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setActiveTab('dashboard');
  };

  if (!userEmail || activeTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header
          currentTab="login"
          userEmail="Guest"
          onOpenNewBooking={() => setIsNewBookingOpen(true)}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginView onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Navigation Header */}
      <Header
        currentTab={activeTab}
        userEmail={userEmail}
        onLogout={handleLogout}
        onOpenNewBooking={() => setIsNewBookingOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container: Sidebar + Active View */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewBooking={() => setIsNewBookingOpen(true)}
              onOpenBookingDetail={(b) => setSelectedBooking(b)}
              onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              onOpenNewBooking={() => setIsNewBookingOpen(true)}
              onOpenBookingDetail={(b) => setSelectedBooking(b)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              onSelectPatient={(id) => setSelectedPatientId(id)}
              onBookForPatient={handleBookForPatient}
            />
          )}

          {activeTab === 'setup-guide' && (
            <SetupGuideView
              onOpenWebhookTester={() => setIsWebhookTesterOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onCreated={() => {
          // Trigger view update
        }}
      />

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdated={() => {
          setSelectedBooking(null);
        }}
      />

      <PatientProfileModal
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
        onBookForPatient={handleBookForPatient}
      />

      <WebhookTesterModal
        isOpen={isWebhookTesterOpen}
        onClose={() => setIsWebhookTesterOpen(false)}
        onTriggered={() => {
          // Trigger refresh
        }}
      />
    </div>
  );
}
