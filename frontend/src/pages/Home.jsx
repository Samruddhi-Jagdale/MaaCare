// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-800">
      {/* Navigation Bar */}
      <nav className="w-full bg-white/90 backdrop-blur border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-pink-600 tracking-tight">
              Maa<span className="text-teal-600">Care</span>
            </span>
            <span className="hidden sm:inline-block text-xs bg-pink-100 text-pink-800 font-semibold px-2 py-0.5 rounded-full">
              Maternal Health
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/woman'}
                  className="text-sm font-medium text-pink-700 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition"
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-600 hover:text-pink-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-pink-600 transition px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg shadow-sm transition active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50/70 via-pink-50/30 to-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-pink-100 text-pink-800 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Compassionate & Systematic Maternal Care
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            Better Care for Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Mother</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            MaaCare bridges expectant mothers, community health workers, and clinic administrators with digital tracking, automated checkup timelines, and health history logs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition active:scale-95 text-center"
            >
              Register as Expectant Mother
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:border-pink-300 text-gray-800 hover:text-pink-600 font-semibold rounded-xl shadow-sm transition text-center"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Core Features</h2>
          <p className="text-3xl font-extrabold text-gray-900">Everything needed to monitor maternal wellness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-pink-50/50 border border-pink-100 hover:border-pink-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-pink-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow">
              👶
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pregnancy Tracking</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Log pregnancy weeks, blood groups, estimated delivery dates, and maternal vitals in one safe digital book.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-100 hover:border-teal-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow">
              📅
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Checkup Scheduling</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track routine appointments, ultrasound dates, and blood pressure milestones organized by trimester.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow">
              📋
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Health Records</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Securely store maternal history, blood pressure readings, weight progression, and doctor consultation notes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-pink-50/50 border border-pink-100 hover:border-pink-300 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xl font-bold mb-4 shadow">
              🔔
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Follow-up Reminders</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dedicated field health workers stay informed so no post-checkup follow-up or vital medicine is missed.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Simple Workflow</h2>
            <p className="text-3xl font-extrabold text-gray-900">How MaaCare Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-lg mb-4">1</span>
              <h4 className="font-bold text-gray-900 mb-2">Register & Enroll</h4>
              <p className="text-sm text-gray-600">
                Expectant mothers register with their contact information and initial pregnancy details.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-lg mb-4">2</span>
              <h4 className="font-bold text-gray-900 mb-2">Worker Assignment</h4>
              <p className="text-sm text-gray-600">
                Admins assign a dedicated community health worker to monitor and assist throughout the pregnancy.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-lg mb-4">3</span>
              <h4 className="font-bold text-gray-900 mb-2">Checkups & Care</h4>
              <p className="text-sm text-gray-600">
                Health workers log visits, schedule checkups, and record vitals accessible to both mother and doctor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
            Empowering Community Healthcare
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            MaaCare is designed to make maternal healthcare monitoring accessible, organized, and transparent. By connecting administrators, frontline health workers, and mothers, MaaCare supports timely interventions and safer births for every family.
          </p>
          <div className="inline-flex items-center space-x-2 text-pink-600 font-medium text-sm">
            <span>✨ Designed for Maternal and Child Healthcare Initiatives</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-sm gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">MaaCare</span>
            <span className="text-xs text-gray-400">© {new Date().getFullYear()} Maternal Healthcare Monitoring System.</span>
          </div>
          <div className="flex space-x-6 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
