import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SmartRecommendationModal } from './components/common/SmartRecommendationModal';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { DoctorsList } from './pages/public/DoctorsList';
import { DoctorDetail } from './pages/public/DoctorDetail';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { AIHealthHub } from './pages/public/AIHealthHub';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { PatientRecords } from './pages/patient/PatientRecords';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions';
import { PatientDocuments } from './pages/patient/PatientDocuments';
import { PatientProfile } from './pages/patient/PatientProfile';
import { PatientNotifications } from './pages/patient/PatientNotifications';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorAvailabilityPage } from './pages/doctor/DoctorAvailability';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorPatientDetail } from './pages/doctor/DoctorPatientDetail';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminPatients } from './pages/admin/AdminPatients';
import { AdminHospitals } from './pages/admin/AdminHospitals';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

import { DoctorProfile } from './types';
import { apiRequest } from './services/api';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false);
  const [featuredDoctors, setFeaturedDoctors] = useState<DoctorProfile[]>([]);

  // Simple client-side routing synchronization
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch verified doctors for home page
  useEffect(() => {
    apiRequest<DoctorProfile[]>('/doctors').then((res) => {
      if (res.success && res.data) {
        setFeaturedDoctors(res.data);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
        Initializing SmartCare Clinical Core...
      </div>
    );
  }

  // Parse path & params
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  // Role Access Guard
  const isPatientRoute = currentPath.startsWith('/patient');
  const isDoctorRoute = currentPath.startsWith('/doctor');
  const isAdminRoute = currentPath.startsWith('/admin');

  if (isPatientRoute && role !== 'PATIENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar currentPath={currentPath} navigate={navigate} onOpenRecommendation={() => setRecommendationModalOpen(true)} />
        <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Patient Portal Authentication Required</h2>
          <p className="text-xs text-slate-600">
            Please log in with a registered Patient account to access your personal appointments and medical history.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Sign In as Patient
          </button>
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  if (isDoctorRoute && role !== 'DOCTOR') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar currentPath={currentPath} navigate={navigate} onOpenRecommendation={() => setRecommendationModalOpen(true)} />
        <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Physician Access Only</h2>
          <p className="text-xs text-slate-600">
            This module contains confidential clinical consultations. Please sign in with an authorized Doctor credential.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Sign In as Doctor
          </button>
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  if (isAdminRoute && role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar currentPath={currentPath} navigate={navigate} onOpenRecommendation={() => setRecommendationModalOpen(true)} />
        <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-purple-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Administrative Privilege Required</h2>
          <p className="text-xs text-slate-600">
            You must be logged in as a hospital system administrator to view governance and audit logs.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Sign In as Administrator
          </button>
        </div>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Router renderer
  const renderPage = () => {
    // 1. Public Routes
    if (currentPath === '/') {
      return (
        <Home
          navigate={navigate}
          onOpenRecommendation={() => setRecommendationModalOpen(true)}
          featuredDoctors={featuredDoctors}
        />
      );
    }
    if (currentPath === '/about') return <About navigate={navigate} />;
    if (currentPath === '/contact') return <Contact />;
    if (currentPath === '/doctors') {
      const sp = searchParams.get('specialization') || '';
      return (
        <DoctorsList
          navigate={navigate}
          onOpenRecommendation={() => setRecommendationModalOpen(true)}
          initialSpecialization={sp}
        />
      );
    }
    if (currentPath.startsWith('/doctors/')) {
      const docId = currentPath.split('/')[2];
      return <DoctorDetail doctorId={docId} navigate={navigate} />;
    }
    if (currentPath === '/login') return <Login navigate={navigate} />;
    if (currentPath === '/register') return <Register navigate={navigate} />;
    if (currentPath === '/ai-hub' || currentPath.startsWith('/ai-hub')) {
      const tab = (searchParams.get('tab') as any) || 'chat';
      return <AIHealthHub initialTab={tab} />;
    }
    if (currentPath === '/forgot-password' || currentPath.startsWith('/reset-password')) {
      return <ForgotPassword navigate={navigate} />;
    }

    // 2. Patient Routes
    if (currentPath === '/patient/dashboard') {
      return (
        <PatientDashboard
          navigate={navigate}
          onOpenRecommendation={() => setRecommendationModalOpen(true)}
        />
      );
    }
    if (currentPath === '/patient/profile') return <PatientProfile />;
    if (currentPath === '/patient/doctors') {
      return (
        <DoctorsList
          navigate={navigate}
          onOpenRecommendation={() => setRecommendationModalOpen(true)}
        />
      );
    }
    if (currentPath.startsWith('/patient/book-appointment')) {
      const docId = searchParams.get('doctorId') || '';
      const date = searchParams.get('date') || '';
      return <BookAppointment navigate={navigate} initialDoctorId={docId} initialDate={date} />;
    }
    if (currentPath === '/patient/appointments') {
      return <PatientAppointments navigate={navigate} />;
    }
    if (currentPath === '/patient/medical-records') return <PatientRecords />;
    if (currentPath === '/patient/prescriptions') return <PatientPrescriptions />;
    if (currentPath === '/patient/documents') return <PatientDocuments />;
    if (currentPath === '/patient/notifications') {
      return <PatientNotifications navigate={navigate} />;
    }

    // 3. Doctor Routes
    if (currentPath === '/doctor/dashboard') {
      return <DoctorDashboard navigate={navigate} />;
    }
    if (currentPath === '/doctor/profile') return <DoctorProfilePage />;
    if (currentPath === '/doctor/availability') return <DoctorAvailabilityPage />;
    if (currentPath === '/doctor/appointments') {
      return <DoctorAppointments navigate={navigate} />;
    }
    if (currentPath === '/doctor/patients') {
      return <DoctorPatients navigate={navigate} />;
    }
    if (currentPath.startsWith('/doctor/patients/')) {
      const pId = currentPath.split('/')[3]?.split('?')[0];
      const aptId = searchParams.get('appointmentId') || undefined;
      return <DoctorPatientDetail patientId={pId} appointmentId={aptId} navigate={navigate} />;
    }

    // 4. Admin Routes
    if (currentPath === '/admin/dashboard' || currentPath === '/admin/analytics') {
      return <AdminDashboard navigate={navigate} />;
    }
    if (currentPath === '/admin/doctors') return <AdminDoctors />;
    if (currentPath === '/admin/patients') return <AdminPatients />;
    if (currentPath === '/admin/hospitals' || currentPath === '/admin/departments') {
      return <AdminHospitals />;
    }
    if (currentPath === '/admin/appointments') return <AdminAppointments />;
    if (currentPath === '/admin/audit-logs') return <AdminAuditLogs />;
    if (currentPath === '/admin/settings') return <AdminSettings />;

    // Fallback to Home
    return (
      <Home
        navigate={navigate}
        onOpenRecommendation={() => setRecommendationModalOpen(true)}
        featuredDoctors={featuredDoctors}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      <div>
        <EmergencyBanner />
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          onOpenRecommendation={() => setRecommendationModalOpen(true)}
        />
        <main>{renderPage()}</main>
      </div>

      <Footer navigate={navigate} />

      {/* Global AI Recommendation Modal */}
      <SmartRecommendationModal
        isOpen={recommendationModalOpen}
        onClose={() => setRecommendationModalOpen(false)}
        onSelectDoctor={(doc) => {
          navigate(`/patient/book-appointment?doctorId=${doc.id}`);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
