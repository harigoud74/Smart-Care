import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  HeartPulse,
  Bell,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield,
  Stethoscope,
  Calendar,
  FileText,
  Hospital,
  ChevronDown,
} from 'lucide-react';
import { StatusBadge } from './Badge';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenRecommendation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenRecommendation }) => {
  const { user, profile, role, logout, switchRoleQuick } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/')}
              className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                  Smart<span className="text-sky-600">Care</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-teal-600 block leading-none">
                  Healthcare System
                </span>
              </div>
            </button>

            {/* Role indicator pill if logged in */}
            {role && (
              <div className="hidden sm:inline-flex items-center gap-1.5 ml-2">
                <StatusBadge status={role} />
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('/doctors')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentPath === '/doctors'
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Doctors
            </button>

            {/* Role-Specific Shortcuts */}
            {role === 'PATIENT' && (
              <>
                <button
                  onClick={() => handleNav('/patient/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath.startsWith('/patient/dashboard')
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('/patient/appointments')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/patient/appointments'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => handleNav('/patient/medical-records')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/patient/medical-records'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Records & Rx
                </button>
              </>
            )}

            {role === 'DOCTOR' && (
              <>
                <button
                  onClick={() => handleNav('/doctor/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath.startsWith('/doctor/dashboard')
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Doctor Portal
                </button>
                <button
                  onClick={() => handleNav('/doctor/appointments')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/doctor/appointments'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => handleNav('/doctor/availability')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/doctor/availability'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Working Hours
                </button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <button
                  onClick={() => handleNav('/admin/dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath.startsWith('/admin')
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Center
                </button>
                <button
                  onClick={() => handleNav('/admin/doctors')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/admin/doctors'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Verify Doctors
                </button>
                <button
                  onClick={() => handleNav('/admin/audit-logs')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    currentPath === '/admin/audit-logs'
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Audit Logs
                </button>
              </>
            )}

            {!role && (
              <>
                <button
                  onClick={() => handleNav('/about')}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                >
                  About
                </button>
                <button
                  onClick={() => handleNav('/contact')}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                >
                  Contact
                </button>
              </>
            )}
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center gap-2">
            {/* AI Health Hub (Gemini Live, Chatbot, Grounding, Transcribe) */}
            <button
              type="button"
              onClick={() => handleNav('/ai-hub')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                currentPath === '/ai-hub'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Clinical Suite</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* AI Recommendation Trigger */}
            <button
              type="button"
              onClick={onOpenRecommendation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition cursor-pointer shadow-2xs"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Symptom Triage</span>
              <span className="sm:hidden">Triage</span>
            </button>

            {/* Quick Role Switcher for Demo / Testing */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Quick demo role switch"
              >
                <span className="text-slate-600">Demo Role:</span>
                <span className="font-bold text-sky-800">{role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3 text-slate-600" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    Instant Switch Demo Accounts
                  </div>
                  <button
                    onClick={() => {
                      switchRoleQuick('PATIENT');
                      setRoleSwitcherOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center justify-between text-slate-800 cursor-pointer"
                  >
                    <span>Patient (John Doe)</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">O+</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('DOCTOR');
                      setRoleSwitcherOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center justify-between text-slate-800 cursor-pointer"
                  >
                    <span>Doctor (Dr. Sarah Jenkins)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Cardio</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('ADMIN');
                      setRoleSwitcherOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 flex items-center justify-between text-slate-800 cursor-pointer"
                  >
                    <span>Admin (System Admin)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Notifications ({unreadCount} unread)</span>
                      <button
                        onClick={() => {
                          setNotifDropdownOpen(false);
                          handleNav(role === 'PATIENT' ? '/patient/notifications' : '/notifications');
                        }}
                        className="text-sky-600 hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-400">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) handleNav(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 cursor-pointer hover:bg-slate-50 transition ${
                              !n.isRead ? 'bg-sky-50/50' : ''
                            }`}
                          >
                            <p className="font-bold text-slate-900 leading-snug">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (role === 'PATIENT') handleNav('/patient/profile');
                    else if (role === 'DOCTOR') handleNav('/doctor/profile');
                    else handleNav('/admin/dashboard');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-sky-600" />
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {profile?.fullName || user.email}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNav('/doctors')}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Find Doctors
          </button>
          {role === 'PATIENT' && (
            <>
              <button
                onClick={() => handleNav('/patient/dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Patient Dashboard
              </button>
              <button
                onClick={() => handleNav('/patient/appointments')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                My Appointments
              </button>
              <button
                onClick={() => handleNav('/patient/medical-records')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Medical Records & Rx
              </button>
              <button
                onClick={() => handleNav('/patient/documents')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Uploaded Documents
              </button>
            </>
          )}

          {role === 'DOCTOR' && (
            <>
              <button
                onClick={() => handleNav('/doctor/dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Doctor Dashboard
              </button>
              <button
                onClick={() => handleNav('/doctor/appointments')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Manage Consultations
              </button>
              <button
                onClick={() => handleNav('/doctor/availability')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Schedule & Availability
              </button>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <button
                onClick={() => handleNav('/admin/dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Admin Dashboard & Analytics
              </button>
              <button
                onClick={() => handleNav('/admin/doctors')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Doctor Verification
              </button>
              <button
                onClick={() => handleNav('/admin/audit-logs')}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Audit Logs
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400 px-3">Quick Demo Switch:</span>
            <div className="grid grid-cols-3 gap-2 px-3">
              <button
                onClick={() => {
                  switchRoleQuick('PATIENT');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 bg-sky-50 text-sky-800 text-xs font-semibold rounded-lg text-center"
              >
                Patient
              </button>
              <button
                onClick={() => {
                  switchRoleQuick('DOCTOR');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg text-center"
              >
                Doctor
              </button>
              <button
                onClick={() => {
                  switchRoleQuick('ADMIN');
                  setMobileMenuOpen(false);
                }}
                className="py-1.5 bg-purple-50 text-purple-800 text-xs font-semibold rounded-lg text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
