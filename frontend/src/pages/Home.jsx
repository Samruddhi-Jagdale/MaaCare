// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, ShieldCheck, Calendar, FileText, Bell, PhoneCall, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/woman';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800">
      {/* Navigation Bar */}
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-200">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-pink-600 to-teal-600 bg-clip-text text-transparent">
              MaaCare
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/education"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-teal-700 hover:bg-teal-50 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('navEducation')}</span>
            </Link>

            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={logout}
                  className="text-xs sm:text-sm font-medium text-gray-500 hover:text-rose-600 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-pink-600 transition px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50/70 via-pink-50/30 to-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center space-x-1.5 bg-pink-100 text-pink-800 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full mb-5">
            <Heart className="w-4 h-4 fill-pink-600 text-pink-600" />
            <span>AI-Enhanced Maternal Healthcare Platform</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            Empowering Every Mother with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-teal-600">
              Safe & Smart Care
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
            MaaCare connects expectant mothers, community health workers (ASHAs), and clinical administrators with interactive pregnancy timelines, digital health records, and automated checkup reminders.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-2xl shadow-lg shadow-pink-200 transition"
            >
              Register as Expectant Mother
            </Link>
            <Link
              to="/education"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-2xl border border-teal-200 transition flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>Explore Maternal Guide</span>
            </Link>
          </div>

          {/* Emergency Helpline Banner */}
          <div className="mt-8 inline-flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
            <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>24/7 National Emergency Ambulance: 108 &bull; Janani Shishu Helpline: 102</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-t border-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Built for Community & Institutional Healthcare
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Comprehensive tools designed to protect maternal and neonatal health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50/60 to-white p-6 rounded-3xl border border-pink-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Pregnancy Journey Tracker</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Gestational progress bar, trimester breakdown, and clinical milestones derived from real dates.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50/60 to-white p-6 rounded-3xl border border-teal-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Digital Maternal Record</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Centralized health records tracking blood pressure, weight, Hb, supplements (IFA), and prescriptions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50/60 to-white p-6 rounded-3xl border border-purple-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Smart Reminders & Alerts</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automated in-app notification center for scheduled appointments, overdue visits, and health announcements.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50/60 to-white p-6 rounded-3xl border border-amber-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Bilingual Education</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Medically vetted nutrition, care checklists, and danger signs available in Marathi and English.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} MaaCare Maternal Healthcare Monitoring Platform. All rights reserved.</p>
        <p className="mt-1 text-gray-400">Emergency Obstetric Helpline: 108 / 102 / 104</p>
      </footer>
    </div>
  );
}
